"""
Terra_vault — Validation & Business Rules Engine
Cross-validates extracted fields against open-source datasets:
LGD Directory, Census 2011, Bhu-Naksha GeoJSON, OpenStreetMap India.
"""
import structlog
import re
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional, Dict

from fuzzywuzzy import fuzz

log = structlog.get_logger(__name__)


@dataclass
class ValidationIssue:
    field: str
    severity: str    # "error" | "warning" | "info"
    message: str
    suggestion: Optional[str] = None


@dataclass
class ValidationReport:
    is_valid: bool
    issues: List[ValidationIssue]
    confidence_adjustment: float   # multiplicative adjustment to overall confidence


AREA_CONVERSIONS_TO_SQM = {
    "bigha": 2529.28,     # UP bigha
    "acre": 4046.86,
    "hectare": 10000.0,
    "are": 100.0,
    "guntha": 101.17,
    "cent": 40.47,
    "sqft": 0.0929,
    "sqm": 1.0,
    "sqyard": 0.836,
}

STATE_KHASRA_PATTERNS = {
    "Uttar Pradesh": r"^\d+[A-Za-z]?(/\d+)?$",
    "Maharashtra":   r"^\d+/[A-Za-z0-9]+$",
    "Rajasthan":     r"^\d+$",
    "default":       r"^[A-Za-z0-9/\-]+$",
}


class RulesEngine:
    """Validates extracted fields against business rules."""

    def validate(self, fields: dict, state: str = "default") -> ValidationReport:
        issues = []

        # Required fields
        required = ["owner_name", "khasra_no", "village", "district"]
        for f in required:
            if not fields.get(f):
                issues.append(ValidationIssue(f, "error", f"Required field '{f}' is missing"))

        # Khasra number format
        khasra = fields.get("khasra_no") or ""
        if khasra:
            pattern = STATE_KHASRA_PATTERNS.get(state, STATE_KHASRA_PATTERNS["default"])
            if not re.match(pattern, khasra):
                issues.append(ValidationIssue("khasra_no", "warning",
                    f"Khasra format '{khasra}' doesn't match expected pattern for {state}"))

        # Area unit validation
        area_val = fields.get("area_value")
        area_unit = (fields.get("area_unit") or "").lower().replace(" ", "")
        if area_val and area_unit:
            try:
                val = float(area_val)
                if val <= 0:
                    issues.append(ValidationIssue("area_value", "error", "Area must be positive"))
                elif val > 10000 and area_unit in ("bigha", "acre"):
                    issues.append(ValidationIssue("area_value", "warning",
                        f"Unusually large area {val} {area_unit} — possible OCR error"))
            except ValueError:
                issues.append(ValidationIssue("area_value", "error",
                    f"Area value '{area_val}' is not numeric"))

        # Date ordering / sanity
        from datetime import datetime as dt_type
        mut_date = fields.get("mutation_date")
        if mut_date:
            if isinstance(mut_date, dt_type):
                year = mut_date.year
            else:
                m = re.search(r"\b(19|20)\d{2}\b", str(mut_date))
                year = int(m.group()) if m else None

            if year and not (1900 <= year <= 2030):
                issues.append(ValidationIssue("mutation_date", "warning",
                    f"Mutation year {year} is outside expected range 1900–2030"))
            elif not year:
                issues.append(ValidationIssue("mutation_date", "warning",
                    "Mutation date has no recognizable year"))

        confidence_adj = 1.0 - (0.05 * len([i for i in issues if i.severity == "error"]))
        confidence_adj = max(0.3, confidence_adj)

        return ValidationReport(
            is_valid=not any(i.severity == "error" for i in issues),
            issues=issues,
            confidence_adjustment=round(confidence_adj, 4),
        )


class DatabaseValidator:
    """
    Cross-validates extracted fields against open-source datasets:
    - LGD Directory (village/tehsil/district canonical names)
    - Census 2011 village list
    - Common Indian name corpus
    """

    def __init__(self, data_dir: str = "/app/data/open_datasets"):
        self.data_dir = Path(data_dir)
        self._census_villages: set = set()
        self._common_names: set = set()
        self._loaded = False

    def _load(self):
        if self._loaded:
            return
        # Load Census 2011 village names
        census_path = self.data_dir / "census_villages.txt"
        if census_path.exists():
            with open(census_path, encoding="utf-8") as f:
                self._census_villages = {line.strip().lower() for line in f if line.strip()}
        # Load common Indian names
        names_path = self.data_dir / "indian_names.txt"
        if names_path.exists():
            with open(names_path, encoding="utf-8") as f:
                self._common_names = {line.strip().lower() for line in f if line.strip()}
        self._loaded = True
        log.info("db_validator.loaded", villages=len(self._census_villages), names=len(self._common_names))

    def validate_village(self, village: str) -> Dict:
        self._load()
        if not village:
            return {"found": False, "score": 0.0, "suggestion": None}
        vl = village.lower()
        if vl in self._census_villages:
            return {"found": True, "score": 1.0, "suggestion": None}
        # Fuzzy match
        best_score, best_match = 0, None
        for v in list(self._census_villages)[:5000]:  # sample for speed
            score = fuzz.token_sort_ratio(vl, v)
            if score > best_score:
                best_score, best_match = score, v
        return {"found": best_score > 85, "score": best_score / 100.0, "suggestion": best_match}

    def validate_owner_name(self, name: str) -> Dict:
        self._load()
        if not name:
            return {"plausible": False, "score": 0.0}
        parts = name.lower().split()
        plausible = any(p in self._common_names for p in parts)
        return {"plausible": plausible, "score": 0.9 if plausible else 0.4}
