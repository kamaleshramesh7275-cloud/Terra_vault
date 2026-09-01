"""
Terra_vault — Shared pytest fixtures and configuration.
"""
import os
import sys
import tempfile
import pytest

# Ensure backend modules are importable when running tests from any cwd
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))


# ── Mark registration ─────────────────────────────────────────────────────────

def pytest_configure(config):
    """Register custom marks to silence PytestUnknownMarkWarning."""
    config.addinivalue_line(
        "markers",
        "slow: marks tests that require OCR engines (EasyOCR, Tesseract) to be installed",
    )


# ── Text fixtures ─────────────────────────────────────────────────────────────

@pytest.fixture
def sample_english_text() -> str:
    """Canonical English land-record string used across multiple test classes."""
    return (
        "Khasra No: 123/4  Village: Rampur  District: Lucknow  State: Uttar Pradesh\n"
        "Owner: Ram Kumar S/O Shyam Lal  Area: 2.5 bigha  Mutation No: 789\n"
        "Date of Mutation: 12/03/2021  Land Type: Agricultural"
    )


@pytest.fixture
def sample_hindi_text() -> str:
    """Canonical Devanagari land-record string."""
    return "खसरा नंबर: 456  ग्राम: भोपाल  जिला: इंदौर  क्षेत्रफल: 3 बीघा"


# ── Module fixtures ───────────────────────────────────────────────────────────

@pytest.fixture(scope="module")
def field_extractor():
    """Pre-instantiated FieldExtractor — module-scoped for performance."""
    from ocr_engine.field_extractor import FieldExtractor
    return FieldExtractor()


@pytest.fixture(scope="module")
def ocr_router():
    """Pre-instantiated OCRRouter — module-scoped (heavy to init)."""
    from ocr_engine.recognizer import OCRRouter
    return OCRRouter()


# ── Filesystem fixtures ───────────────────────────────────────────────────────

@pytest.fixture
def tmp_data_dir() -> str:
    """Temporary directory that is cleaned up after each test."""
    with tempfile.TemporaryDirectory() as d:
        yield d


@pytest.fixture
def synthetic_image_factory():
    """
    Factory fixture: call with a text string, get a path to a temporary PNG.
    The PNG is deleted after the test.
    Usage:
        def test_foo(synthetic_image_factory):
            path = synthetic_image_factory("Khasra No: 1")
    """
    import pathlib
    created = []

    def _make(text: str) -> str:
        try:
            from PIL import Image, ImageDraw, ImageFont
        except ImportError:
            pytest.skip("Pillow not installed")
        img = Image.new("RGB", (800, 400), color=(255, 255, 255))
        draw = ImageDraw.Draw(img)
        try:
            font = ImageFont.truetype("arial.ttf", 18)
        except IOError:
            font = ImageFont.load_default()
        draw.multiline_text((20, 20), text, fill=(0, 0, 0), font=font, spacing=10)
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
        img.save(tmp.name, "PNG")
        tmp.close()
        created.append(tmp.name)
        return tmp.name

    yield _make

    for p in created:
        try:
            os.unlink(p)
        except OSError:
            pass
