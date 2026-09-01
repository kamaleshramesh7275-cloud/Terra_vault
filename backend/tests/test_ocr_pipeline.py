"""
Terra_vault — OCR Pipeline Integration Tests
Tests the OCR engine, field extractor, and script classifier using
a synthetically generated land-record image. No network or real files needed.
"""
import os
import sys
import pytest

# Make sure we can import backend modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# ── Field Extractor Tests ─────────────────────────────────────────────────────

class TestFieldExtractor:
    """Unit tests for FieldExtractor using synthetic OCR text."""

    def test_khasra_extraction_english(self, field_extractor):
        text = "Khasra No: 123/4  Village: Rampur  District: Lucknow"
        result = field_extractor.extract(text, avg_ocr_confidence=0.9)
        assert result.khasra_no.value == "123/4", f"Got: {result.khasra_no.value}"

    def test_owner_name_so_pattern(self, field_extractor):
        text = "Ram Kumar S/O Shyam Lal  Khasra No: 55  Village: Agra"
        result = field_extractor.extract(text, avg_ocr_confidence=0.88)
        assert result.owner_name.value is not None, "owner_name should be extracted via S/O pattern"
        assert "Ram" in result.owner_name.value or "Kumar" in result.owner_name.value

    def test_village_label_hint(self, field_extractor):
        text = "Village: Bhopal Tehsil: Kolar District: Bhopal Area: 2.5 acre"
        result = field_extractor.extract(text, avg_ocr_confidence=0.85)
        assert result.village.value is not None
        assert "Bhopal" in result.village.value

    def test_area_extraction(self, field_extractor):
        text = "Land area: 3.5 bigha  Mutation No: 456  Date: 12/03/2021"
        result = field_extractor.extract(text, avg_ocr_confidence=0.9)
        assert result.area_value.value == "3.5"
        assert result.area_unit.value == "bigha"

    def test_mutation_no_extraction(self, field_extractor):
        text = "Mutation Number 789  Owner: Priya"
        result = field_extractor.extract(text, avg_ocr_confidence=0.9)
        assert result.mutation_no.value == "789"

    def test_land_type_keyword(self, field_extractor):
        text = "This is agricultural land khasra no 100"
        result = field_extractor.extract(text, avg_ocr_confidence=0.9)
        assert result.land_type.value == "agricultural"

    def test_missing_required_fields_flagged(self, field_extractor):
        result = field_extractor.extract("some random text with no structured fields", 0.5)
        for fname in ["khasra_no", "village", "area_value"]:
            ef = getattr(result, fname)
            assert any(f["severity"] == "error" for f in ef.flags), \
                f"Expected error flag on missing field '{fname}'"

    def test_full_record_via_fixture(self, field_extractor, sample_english_text):
        """Uses the shared conftest fixture for a canonical full-record text."""
        result = field_extractor.extract(sample_english_text, avg_ocr_confidence=0.9)
        assert result.khasra_no.value == "123/4"
        assert result.village.value is not None
        assert result.area_value.value == "2.5"
        assert result.mutation_no.value == "789"


# ── parse_mutation_date Tests ──────────────────────────────────────────────────

class TestParseMutationDate:
    def test_slash_format(self):
        from ocr_engine.field_extractor import parse_mutation_date
        dt = parse_mutation_date("12/03/2021")
        assert dt is not None
        assert dt.year == 2021 and dt.month == 3 and dt.day == 12

    def test_dash_format(self):
        from ocr_engine.field_extractor import parse_mutation_date
        dt = parse_mutation_date("05-11-2019")
        assert dt is not None and dt.year == 2019

    def test_month_name_format(self):
        from ocr_engine.field_extractor import parse_mutation_date
        dt = parse_mutation_date("7 Jan 2022")
        assert dt is not None and dt.month == 1

    def test_invalid_returns_none(self):
        from ocr_engine.field_extractor import parse_mutation_date
        assert parse_mutation_date("not-a-date") is None
        assert parse_mutation_date("") is None
        assert parse_mutation_date(None) is None


# ── Script Classifier Tests ────────────────────────────────────────────────────

class TestUnicodeClassifier:
    def test_devanagari_text(self):
        from ml_pipeline.script_classifier import _classify_text_by_unicode
        # Devanagari characters: क ख ग घ ङ + some more
        text = "खसरा नंबर ग्राम भोपाल जिला इंदौर"
        result = _classify_text_by_unicode(text)
        assert result == "Devanagari", f"Expected Devanagari, got {result}"

    def test_tamil_text(self):
        from ml_pipeline.script_classifier import _classify_text_by_unicode
        # Tamil characters
        text = "கிராமம் மாவட்டம் கர்நாடகா"
        result = _classify_text_by_unicode(text)
        assert result == "Tamil", f"Expected Tamil, got {result}"

    def test_latin_text(self):
        from ml_pipeline.script_classifier import _classify_text_by_unicode
        text = "Village Name Khasra District State"
        result = _classify_text_by_unicode(text)
        assert result == "Latin", f"Expected Latin, got {result}"

    def test_insufficient_chars_returns_none(self):
        from ml_pipeline.script_classifier import _classify_text_by_unicode
        result = _classify_text_by_unicode("ab")   # < 5 Latin chars
        assert result is None

# ── OCR Router Tests (require OCR engines installed) ──────────────────────────

@pytest.mark.slow
class TestOCRRouter:
    """Requires EasyOCR or Tesseract to be installed. Run with: pytest -m slow"""

    def test_recognizes_synthetic_english_image(self, synthetic_image_factory):
        img_path = synthetic_image_factory(
            "Khasra No: 101/A\nVillage: Rampur\nDistrict: Lucknow\nOwner: Raj Kumar S/O Shyam\nArea: 1.5 acre"
        )
        from ocr_engine.recognizer import OCRRouter
        from ml_pipeline.script_classifier import SCRIPT_OCR_MAP
        router = OCRRouter()
        result = router.recognize(
            img_path,
            ocr_config=SCRIPT_OCR_MAP["Latin"],
            is_handwriting=False,
        )
        assert result.full_text.strip() != "", "OCR should produce some text"
        assert result.avg_confidence >= 0.0

    def test_field_extraction_on_synthetic_image(self, synthetic_image_factory, field_extractor):
        img_path = synthetic_image_factory(
            "Khasra No: 202  Village: Agra  District: Agra\n"
            "Owner: Sita Devi D/O Ram Prasad\n"
            "Area: 2 bigha  Mutation No: 555"
        )
        from ocr_engine.recognizer import OCRRouter
        from ml_pipeline.script_classifier import SCRIPT_OCR_MAP

        router = OCRRouter()
        ocr = router.recognize(img_path, ocr_config=SCRIPT_OCR_MAP["Latin"], is_handwriting=False)
        fields = field_extractor.extract(ocr.full_text, ocr.avg_confidence)
        assert ocr.full_text.strip() != ""
