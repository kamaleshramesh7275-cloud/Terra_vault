"""
Terra_vault — Field Extractor
Extracts structured land record fields from raw OCR text using
spaCy NER + regex patterns + LGD directory cross-validation.
"""
import re
import json
import structlog
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any

log = structlog.get_logger(__name__)

# ── LGD data (loaded once at import) ─────────────────────────────────────────
_LGD_VILLAGES: Dict[str, str] = {}   # name_lower → lgd_code
_LGD_TEHSILS: Dict[str, str] = {}
_LGD_DISTRICTS: Dict[str, str] = {}


def _load_lgd_data(data_dir: str = "/app/data/open_datasets"):
    """Load pre-downloaded LGD directory CSVs for cross-validation."""
    global _LGD_VILLAGES, _LGD_TEHSILS, _LGD_DISTRICTS
    import csv
    for fname, target in [
        ("lgd_villages.csv", _LGD_VILLAGES),
        ("lgd_tehsils.csv", _LGD_TEHSILS),
        ("lgd_districts.csv", _LGD_DISTRICTS),
    ]:
        path = Path(data_dir) / fname
        if path.exists():
            with open(path, encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    name = row.get("name", "").strip().lower()
                    code = row.get("lgd_code", "").strip()
                    if name and code:
                        target[name] = code
    log.info("lgd.loaded", villages=len(_LGD_VILLAGES), tehsils=len(_LGD_TEHSILS), districts=len(_LGD_DISTRICTS))


_load_lgd_data()

# ── Regex patterns (state-agnostic & Tamil/Indic) ────────────────────────────
PATTERNS = {
    "khasra_no": [
        r"\bkhasra\s*(?:no\.?|number|संख्या|नं\.?)?\s*[:\-]?\s*([A-Za-z0-9/\-]+)\b",
        r"\bखसरा\s*(?:नं\.?|न\.?)?\s*[:\-]?\s*(\d+[A-Za-z0-9/\-]*)\b",
        r"(?:ப\s*ு\s*ல\s*எ\s*ண்|ச\s*ர்\s*ே\s*வ\s*எ\s*ண்)(?:\s*/\s*உ\s*ட்\s*ப\s*ி\s*ர\s*ி\s*வ\s*ு)?\s*[:\-.]*\s*([0-9/\-A-Za-z\s]{1,20}?)(?=\s*ப\s*ர\s*ப்|\s*வ\s*ி\s*ஸ\s*்\s*த\s*ீ|\s*வ\s*ை\s*க|\s*ப\s*ட்|$|\n)",
    ],
    "khata_no": [
        r"\bkhata\s*(?:no\.?|number)?\s*[:\-]?\s*(\d+)\b",
        r"\bखाता\s*(?:नं\.?|न\.?)?\s*[:\-]?\s*(\d+)\b",
        r"ப\s*ட்\s*ட\s*ா\s*எ\s*ண்\s*[:\-.]*\s*(\d+)",
    ],
    "survey_no": [
        r"(?:ச\s*ர்\s*ே\s*வ\s*எ\s*ண்|ப\s*ு\s*ல\s*எ\s*ண்)(?:\s*/\s*உ\s*ட்\s*ப\s*ி\s*ர\s*ி\s*வ\s*ு)?\s*[:\-.]*\s*([0-9/\-A-Za-z\s]{1,20}?)(?=\s*ப\s*ர\s*ப்|\s*வ\s*ி\s*ஸ\s*்\s*த\s*ீ|\s*வ\s*ை\s*க|\s*ப\s*ட்|$|\n)",
        r"\b(?:survey\s*no\.?|sf\.?\s*no\.?|khasra\s*no\.?)\s*[:\-.]*\s*([0-9/\-A-Za-z\s]+?)(?=[,\n;]|$)",
        r"\bसर्वे\s*(?:नं\.?)?\s*[:\-]?\s*([A-Za-z0-9/\-]+)\b",
    ],
    "patta_no": [
        r"ப\s*ட்\s*ட\s*ா\s*எ\s*ண்\s*[:\-.]*\s*(\d+)",
        r"\b(?:patta\s*no\.?|khata\s*no\.?)\s*[:\-.]*\s*(\d+)\b",
    ],
    "mutation_no": [
        r"\b(?:mutation|mut)\s*(?:no\.?|number)?\s*[:\-]?\s*([A-Za-z0-9/\-]+)\b",
        r"\bдаखिल\s*खारिज\s*(?:नं\.?)?\s*[:\-]?\s*(\d+)\b",
        r"(?:மா\s*ற்\s*று\s*ப்\s*ப\s*தி\s*வு\s*எ\s*ண்|மா\s*று\s*த\s*ல்\s*எ\s*ண்)\s*[:\-.]*\s*([A-Za-z0-9/\-]+)",
    ],
    "area_value": [
        r"ப\s*ர\s*ப்\s*ப\s*ள\s*வ\s*ு\s*[:\-.]*\s*([0-9.,\s]+(?:ஹெக்டேர்|ெஹக் ேடர்|ஏக்கர்|ஏக் கர்|சென்ட்|acre|hectare|cent)[^\n;]*)",
        r"(\d+(?:\.\d+)?)\s*(bigha|acre|hectare|are|guntha|cent|sq\.?\s*ft|sq\.?\s*m|sq\.?\s*yard|ஹெக்டேர்|ஏர்ஸ்|சென்ட்|ஏக்கர்|குழி)",
    ],
    "mutation_date": [
        r"\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b",
        r"\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})\b",
    ],
}

# ── Indian relationship-prefix patterns for owner name extraction ──────────────
OWNER_NAME_PATTERNS = [
    # 1. Tamil Buyer / Purchaser (வாங்குபவர் / கிரயம் பெறுபவர்)
    r"(?:வா\s*ங்\s*கு\s*ப\s*வ\s*ர்|கிர\s*யம்\s*ெ\s*ப\s*று\s*ப\s*வ\s*ர்)\s*(?:\([^)]*\))?\s*[:\-.]*\s*([\u0B80-\u0BFF\.\s]{2,40}?)(?=\s*,\s*த\s*ந்|\s*த\s*ந்|\s*க\s*ண|\s*வ\s*ய\s*து|\(இனி|\n)",
    # 2. Tamil Seller / Prior Owner (விற்பவர் / கிரயம் வழங்குபவர்)
    r"(?:வி\s*ற்\s*ப\s*வ\s*ர்|கிர\s*யம்\s*வ\s*ழ\s*ங்\s*கு\s*ப\s*வ\s*ர்)\s*(?:\([^)]*\))?\s*[:\-.]*\s*([\u0B80-\u0BFF\.\s]{2,40}?)(?=\s*,\s*த\s*ந்|\s*த\s*ந்|\s*வ\s*ய\s*து|\(இனி|\n)",
    # 3. Tamil General Pattadar / Title holder
    r"(?:உரி\s*மை\s*யா\s*ளர்\s*பெ\s*யர்|பட்\s*டா\s*தா\s*ரர்\s*பெ\s*யர்)\s*[:\-.]*\s*([\u0B80-\u0BFF\.\s]{2,40}?)(?=[,\n;]|\s+தந்தை|\s+வயது|$)",
    # English: capture name before the S/O / D/O / W/O token
    r"([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})\s+(?:S/O|D/O|W/O|s/o|d/o|w/o|Son of|Daughter of|Wife of)",
    # English: capture name after "Name:" / "Owner:" label
    r"(?:owner|name|khatedar|pattadar|holder|purchaser|buyer)\s*[:\-]\s*([A-Za-z][A-Za-z\s]{2,50}?)(?=\s*(?:S/O|D/O|W/O|Village|Khasra|$))",
    # Hindi: name before पुत्र / पुत्री / पत्नी
    r"([\u0900-\u097F]+(?:\s+[\u0900-\u097F]+){0,3})\s+(?:पुत्र|पुत्री|पत्नी|पिता)\s*[:\-]?",
    # Hindi: after खातेदार / नाम label
    r"(?:खातेदार|नाम)\s*[:\-]\s*([\u0900-\u097F]+(?:\s+[\u0900-\u097F]+){1,4})",
]

FATHER_NAME_PATTERNS = [
    r"த\s*ந்\s*ை\s*த\s*[:\-.]*\s*(?:ம\s*ை\s*ற\s*ந்\s*த\s*)?([\u0B80-\u0BFF\.\s]{2,35}?)(?=\s*,\s*வ\s*ய\s*து|\s*வ\s*ய\s*து|\s*வ\s*ி\s*வ\s*ச\s*ா\s*ய\s*ி|\s*வ\s*ச\s*ி\s*ப்|\n)",
    r"க\s*ண\s*வ\s*ர்\s*[:\-.]*\s*([\u0B80-\u0BFF\.\s]{2,35}?)(?=\s*,\s*வ\s*ய\s*து|\s*வ\s*ய\s*து|\n)",
    r"(?:father|husband|spouse)\s*[:\-.]*\s*([A-Za-z][A-Za-z\s]{2,40}?)(?=[,\n;]|$)",
    r"(?:पिता|पति)\s*[:\-.]*\s*([\u0900-\u097F]+(?:\s+[\u0900-\u097F]+){0,3})",
]

# ── Village / location label-hint patterns ────────────────────────────────────
VILLAGE_PATTERNS = [
    r"க\s*ி\s*ர\s*ா\s*ம\s*ம்\s*[:\-.]*\s*([\u0B80-\u0BFF\s]{2,30}?)(?=\s*வ\s*ட்\s*ட\s*ம்|\s*ம\s*ா\s*வ\s*ட்|\s*ச\s*ர்\s*ே\s*வ|\n|$)",
    r"(?:village|vill\.?|gram|gaon)\s*[:\-]\s*([A-Za-z][A-Za-z\s]{2,40}?)(?=\s*(?:Tehsil|Taluka|District|$))",
    r"(?:ग्राम|गाँव|मौजा)\s*[:\-]?\s*([\u0900-\u097F]+(?:\s+[\u0900-\u097F]+){0,3})",
]

TEHSIL_PATTERNS = [
    r"(?:^|\n|\s{2,})வ\s*ட்\s*ட\s*ம்\s*[:\-.]*\s*([\u0B80-\u0BFF\s]{2,25}?)(?=\s*க\s*ி\s*ர\s*ா\s*ம\s*ம்|\s*ம\s*ா\s*வ\s*ட்|\n|$)",
    r"(?:tehsil|taluka|taluk|mandal)\s*[:\-]\s*([A-Za-z][A-Za-z\s]{2,30}?)(?=\s*(?:District|$))",
    r"(?:तहसील|तालुका|मंडल)\s*[:\-]?\s*([\u0900-\u097F]+(?:\s+[\u0900-\u097F]+){0,2})",
]

DISTRICT_PATTERNS = [
    r"ம\s*ா\s*வ\s*ட்\s*ட\s*ம்\s*[:\-.]*\s*([\u0B80-\u0BFF\s]{2,25}?)(?=\s*வ\s*ட்\s*ட\s*ம்|\s*க\s*ி\s*ர\s*ா\s*ம\s*ம்|\n|$)",
    r"(?:district|dist\.?)\s*[:\-]\s*([A-Za-z][A-Za-z\s]{2,30}?)(?=[,\n]|$)",
    r"(?:जिला|जिल्ला)\s*[:\-]?\s*([\u0900-\u097F]+(?:\s+[\u0900-\u097F]+){0,2})",
]


def parse_mutation_date(raw: str) -> Optional[datetime]:
    """Convert raw OCR date string to a datetime object.

    Handles formats: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY, DD Month YYYY,
    as well as 2-digit years (assumed 20xx if <= current year, else 19xx).
    Returns None if parsing fails.
    """
    if not raw:
        return None
    raw = raw.strip()
    FMTS = [
        "%d/%m/%Y", "%d-%m-%Y", "%d.%m.%Y",
        "%d/%m/%y", "%d-%m-%y", "%d.%m.%y",
        "%d %B %Y", "%d %b %Y",
        "%Y/%m/%d", "%Y-%m-%d",
    ]
    for fmt in FMTS:
        try:
            return datetime.strptime(raw, fmt)
        except ValueError:
            continue
    log.warning("field_extractor.date_parse_failed", raw=raw)
    return None

AREA_UNITS = {"bigha", "acre", "hectare", "are", "guntha", "cent",
              "sq.ft", "sq.m", "sqft", "sqm", "sq ft", "sq m", "sq yard"}

LAND_TYPE_KEYWORDS = {
    "agricultural": ["agricultural", "farm", "farming", "कृषि", "खेती", "நன்செய்", "புன்செய்", "விவசாயம்"],
    "residential":  ["residential", "house", "plot", "आवासीय", "मकान", "வீட்டுமனை", "குடியிருப்பு"],
    "commercial":   ["commercial", "shop", "व्यावसायिक", "दुकान", "வணிகம்"],
    "forest":       ["forest", "वन", "jungle", "காடு"],
    "waste":        ["waste", "barren", "बंजर", "தரிசு"],
    "govt":         ["government", "सरकारी", "govt", "புறம்போக்கு", "அரசு நிலம்"],
}

TRANSACTION_KEYWORDS = {
    "sale":        ["sale", "sold", "purchase", "विक्रय", "बिक्री", "கிரையம்", "விற்பனை"],
    "inheritance": ["inheritance", "heir", "विरासत", "उत्तराधिकार", "பாகப்பிரிவினை", "வாரிசு"],
    "partition":   ["partition", "division", "बंटवारा", "विभाजन", "பங்கு"],
    "gift":        ["gift", "donation", "दान", "उपहार", "தானம்", "சீதனம்"],
    "mortgage":    ["mortgage", "loan", "बंधक", "ऋण", "அடமானம்", "கடன்"],
}


@dataclass
class ExtractedField:
    value: Optional[str]
    confidence: float
    method: str          # "regex" | "ner" | "llm_fallback"
    flags: List[Dict]   # explainable issues
    bounding_box: Optional[List[int]] = None


@dataclass
class LandRecordFields:
    owner_name: ExtractedField = field(default_factory=lambda: ExtractedField(None, 0.0, "ner", []))
    father_name: ExtractedField = field(default_factory=lambda: ExtractedField(None, 0.0, "ner", []))
    khasra_no: ExtractedField = field(default_factory=lambda: ExtractedField(None, 0.0, "regex", []))
    khata_no: ExtractedField = field(default_factory=lambda: ExtractedField(None, 0.0, "regex", []))
    survey_no: ExtractedField = field(default_factory=lambda: ExtractedField(None, 0.0, "regex", []))
    village: ExtractedField = field(default_factory=lambda: ExtractedField(None, 0.0, "ner", []))
    tehsil: ExtractedField = field(default_factory=lambda: ExtractedField(None, 0.0, "ner", []))
    district: ExtractedField = field(default_factory=lambda: ExtractedField(None, 0.0, "ner", []))
    state: ExtractedField = field(default_factory=lambda: ExtractedField(None, 0.0, "ner", []))
    village_lgd_code: ExtractedField = field(default_factory=lambda: ExtractedField(None, 0.0, "lgd_lookup", []))
    area_value: ExtractedField = field(default_factory=lambda: ExtractedField(None, 0.0, "regex", []))
    area_unit: ExtractedField = field(default_factory=lambda: ExtractedField(None, 0.0, "regex", []))
    land_type: ExtractedField = field(default_factory=lambda: ExtractedField(None, 0.0, "keyword", []))
    mutation_no: ExtractedField = field(default_factory=lambda: ExtractedField(None, 0.0, "regex", []))
    mutation_date: ExtractedField = field(default_factory=lambda: ExtractedField(None, 0.0, "regex", []))
    transaction_type: ExtractedField = field(default_factory=lambda: ExtractedField(None, 0.0, "keyword", []))

    @property
    def overall_confidence(self) -> float:
        fields = [self.owner_name, self.khasra_no, self.khata_no, self.village,
                  self.tehsil, self.district, self.area_value, self.mutation_no]
        confs = [f.confidence for f in fields if f.value is not None]
        return round(sum(confs) / len(confs), 4) if confs else 0.0


class FieldExtractor:
    """
    Extracts structured fields from OCR text using:
    1. Regex pattern matching (khasra, khata, survey, mutation, area, date)
    2. spaCy NER (owner name, location entities)
    3. Keyword matching (land type, transaction type)
    4. LGD directory lookup for village/tehsil/district validation
    """

    def __init__(self):
        self._nlp = None

    def _load_spacy(self):
        if self._nlp is not None:
            return
        try:
            import spacy
            # Try loading custom trained model first, fallback to base multilingual
            try:
                self._nlp = spacy.load("xx_ent_wiki_sm")  # multilingual
            except Exception:
                self._nlp = spacy.blank("xx")
            log.info("spacy.loaded")
        except Exception as e:
            log.warning("spacy.load_failed", error=str(e))

    def _normalize_indic_text(self, text: str) -> str:
        """Removes watermarks and merges detached diacritics without collapsing word boundaries."""
        cleaned = re.sub(r"(?:SPECIMEN|SAMPLE|ONLY|மாதிரி|உதாரணம்|மட்டும்|சட்டப்பூர்வ|ஆவணம்|அல்ல|•)", " ", text, flags=re.IGNORECASE)
        # Merge detached Tamil vowels and virama (\u0BBE to \u0BCD, \u0BD7)
        cleaned = re.sub(r"([\u0B80-\u0BFF])\s+([\u0BBE-\u0BCD\u0BD7])", r"\1\2", cleaned)
        # Merge detached consonants in short syllable tokens
        cleaned = re.sub(r"(\b[\u0B80-\u0BFF]{1,2})\s+([\u0B80-\u0BFF]{1,2}\b)", r"\1\2", cleaned)
        cleaned = re.sub(r"\s+", " ", cleaned)
        return cleaned

    def extract(self, ocr_text: str, avg_ocr_confidence: float = 0.8) -> LandRecordFields:
        result = LandRecordFields()
        norm_text = self._normalize_indic_text(ocr_text)
        search_corpus = ocr_text + "\n" + norm_text

        # ── 1. Regex extractions ─────────────────────────────────────────────
        for field_name, patterns in PATTERNS.items():
            for pattern in patterns:
                m = re.search(pattern, search_corpus, re.IGNORECASE)
                if m:
                    value = m.group(1).strip()
                    # Clean survey_no and khasra_no of internal spaces (e.g. 245/3 B -2 -> 245/3B-2)
                    if field_name in ("survey_no", "khasra_no"):
                        value = re.sub(r"\s+", "", value)
                    ef = ExtractedField(value=value, confidence=avg_ocr_confidence * 0.88,
                                       method="regex", flags=[])
                    setattr(result, field_name, ef)
                    break

        # Parse area unit and value
        if result.area_value.value:
            raw_area = result.area_value.value
            # Extract number
            num_m = re.search(r"(\d+(?:\.\d+)?)", raw_area)
            if num_m:
                result.area_value.value = num_m.group(1)
            # Extract unit
            unit_m = re.search(r"(bigha|acre|hectare|are|guntha|cent|sq\.?\s*(?:ft|m|yard)|ஹெக்டேர்|ெஹக்\s*ேடர்|ஏக்கர்|ஏக்\s*கர்|சென்ட்)",
                              raw_area, re.IGNORECASE)
            if unit_m:
                u = unit_m.group(1).lower().replace(" ", "")
                if "ஏக்" in u or "acre" in u:
                    result.area_unit.value = "acre"
                elif "ெஹக்" in u or "ஹெக்" in u or "hectare" in u:
                    result.area_unit.value = "hectare"
                elif "சென்ட்" in u or "cent" in u:
                    result.area_unit.value = "cent"
                else:
                    result.area_unit.value = u
                result.area_unit.confidence = avg_ocr_confidence * 0.90

        # ── 1b. Label-hint regex for village, tehsil, district ────────────────
        for patterns, field_name in [
            (VILLAGE_PATTERNS,  "village"),
            (TEHSIL_PATTERNS,   "tehsil"),
            (DISTRICT_PATTERNS, "district"),
        ]:
            if getattr(result, field_name).value is None:
                for pattern in patterns:
                    m = re.search(pattern, search_corpus, re.IGNORECASE | re.UNICODE)
                    if m:
                        val = m.group(1).strip()
                        # Clean up any trailing punctuation or whitespace
                        val = re.sub(r"^[:\-\.\s]+|[:\-\.\s]+$", "", val)
                        val = re.sub(r"\s+", " ", val)
                        ef = ExtractedField(value=val, confidence=avg_ocr_confidence * 0.85,
                                            method="regex", flags=[])
                        setattr(result, field_name, ef)
                        break

        # ── 1c. Relationship-prefix regex for owner_name & father_name ─────────
        for pattern in OWNER_NAME_PATTERNS:
            m = re.search(pattern, search_corpus, re.IGNORECASE | re.UNICODE)
            if m:
                cand = m.group(1).strip()
                cand = re.sub(r"^[:\-\.\s]+|[:\-\.\s]+$", "", cand)
                cand = re.sub(r"\s+", " ", cand)
                # Ignore noise words or specimen markers
                if cand and not any(noise in cand for noise in ["மாதிரி", "உதாரணம்", "இதன் மூலம்", "அட்டவணை"]):
                    result.owner_name = ExtractedField(
                        value=cand, confidence=avg_ocr_confidence * 0.92,
                        method="regex", flags=[])
                    break

        for pattern in FATHER_NAME_PATTERNS:
            m = re.search(pattern, search_corpus, re.IGNORECASE | re.UNICODE)
            if m:
                cand = m.group(1).strip()
                cand = re.sub(r"^[:\-\.\s]+|[:\-\.\s]+$", "", cand)
                cand = re.sub(r"\s+", " ", cand)
                if cand and not any(noise in cand for noise in ["மாதிரி", "உதாரணம்"]):
                    result.father_name = ExtractedField(
                        value=cand, confidence=avg_ocr_confidence * 0.88,
                        method="regex", flags=[])
                    break

        # ── 2. spaCy NER for persons and locations (ONLY as fallback) ────────
        self._load_spacy()
        if self._nlp and (result.owner_name.value is None or result.father_name.value is None):
            doc = self._nlp(ocr_text)
            persons, locs = [], []
            for ent in doc.ents:
                if ent.label_ == "PER":
                    persons.append(ent.text)
                elif ent.label_ in ("LOC", "GPE", "FAC"):
                    locs.append(ent.text)

            if persons and result.owner_name.value is None:
                result.owner_name = ExtractedField(
                    value=persons[0], confidence=avg_ocr_confidence * 0.70,
                    method="ner", flags=[])
            if len(persons) > 1 and result.father_name.value is None:
                result.father_name = ExtractedField(
                    value=persons[1], confidence=avg_ocr_confidence * 0.65,
                    method="ner", flags=[])

            # Assign location entities heuristically if missing
            for loc in locs:
                if result.village.value is None:
                    result.village = ExtractedField(value=loc, confidence=avg_ocr_confidence * 0.65,
                                                     method="ner", flags=[])
                elif result.tehsil.value is None:
                    result.tehsil = ExtractedField(value=loc, confidence=avg_ocr_confidence * 0.60,
                                                    method="ner", flags=[])
                elif result.district.value is None:
                    result.district = ExtractedField(value=loc, confidence=avg_ocr_confidence * 0.60,
                                                      method="ner", flags=[])

        # ── 3. Keyword matching for land type and transaction type ─────────────
        text_lower = ocr_text.lower()
        for lt, keywords in LAND_TYPE_KEYWORDS.items():
            if any(kw in text_lower for kw in keywords):
                result.land_type = ExtractedField(value=lt, confidence=0.85, method="keyword", flags=[])
                break
        for tt, keywords in TRANSACTION_KEYWORDS.items():
            if any(kw in text_lower for kw in keywords):
                result.transaction_type = ExtractedField(value=tt, confidence=0.85, method="keyword", flags=[])
                break

        # ── 4. LGD directory lookup ────────────────────────────────────────────
        if result.village.value:
            lgd = _LGD_VILLAGES.get(result.village.value.lower())
            if lgd:
                result.village_lgd_code = ExtractedField(value=lgd, confidence=0.95, method="lgd_lookup", flags=[])
                result.village.confidence = min(result.village.confidence + 0.1, 1.0)
            else:
                result.village.flags.append({"reason": "Village not found in LGD directory", "severity": "warn"})
                result.village.confidence *= 0.85

        # ── 5. Explainability flags ────────────────────────────────────────────
        for fname in ["owner_name", "khasra_no", "village", "area_value"]:
            ef: ExtractedField = getattr(result, fname)
            if ef.value is None:
                ef.flags.append({"reason": f"Required field '{fname}' not found in OCR text", "severity": "error"})
            elif ef.confidence < 0.6:
                ef.flags.append({"reason": f"Low OCR confidence ({ef.confidence:.2f})", "severity": "warn"})

        return result
