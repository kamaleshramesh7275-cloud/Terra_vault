"""
Terra_vault — Tests for High-Accuracy Multimodal AI OCR Pipeline
"""
import pytest
import numpy as np
from ml_pipeline.restoration import suppress_ink_bleed, inpaint_stains
from ocr_engine.stamp_detector import StampDetector, StampDetection
from ocr_engine.table_extractor import TableExtractor, TableStructure
from ocr_engine.ensemble_ocr import MultiPassEnsembleOCR, EnsembleOCRResult


class TestImageRestorationEnhancements:
    def test_ink_bleed_suppression(self):
        # Create synthetic image with dark bleed smudge
        img = np.ones((100, 100, 3), dtype=np.uint8) * 200
        img[30:50, 30:50] = 50  # dark smudge
        res = suppress_ink_bleed(img)
        assert res is not None
        assert res.shape[:2] == (100, 100)

    def test_stain_inpainting(self):
        img = np.ones((100, 100, 3), dtype=np.uint8) * 250
        img[10:20, 10:20] = 10  # dark stain
        res = inpaint_stains(img)
        assert res is not None
        assert res.shape == (100, 100, 3)


class TestStampDetector:
    def test_detect_stamps_and_seals(self):
        detector = StampDetector()
        # Synthetic document image
        img = np.ones((400, 400, 3), dtype=np.uint8) * 255
        # Add blue seal blob
        img[300:360, 300:360, 0] = 255  # Blue channel high
        img[300:360, 300:360, 1] = 50
        img[300:360, 300:360, 2] = 50

        detections = detector.detect(img)
        assert isinstance(detections, list)
        assert len(detections) > 0
        assert any(isinstance(d, StampDetection) for d in detections)


class TestTableExtractor:
    def test_extract_table_grid(self):
        extractor = TableExtractor()
        img = np.ones((300, 600, 3), dtype=np.uint8) * 255
        # Draw horizontal and vertical gridlines
        img[50, :] = 0
        img[100, :] = 0
        img[150, :] = 0
        for x in range(0, 600, 100):
            img[:, x] = 0

        struct = extractor.extract_table(img)
        assert isinstance(struct, TableStructure)
        assert len(struct.headers) == 6
        assert len(struct.cells) > 0


class TestEnsembleOCR:
    def test_multi_pass_consensus_and_lgd_correction(self):
        engine = MultiPassEnsembleOCR()
        pass1 = ("Khusra No 104/A Village Rampoor District Lucknow", 0.85)
        pass2 = ("Khasra No 104/A Village Rampur District Lucknow", 0.80)

        result = engine.process_ensemble([pass1, pass2])
        assert isinstance(result, EnsembleOCRResult)
        assert "khasra" in result.full_text.lower()  # Auto-corrected 'Khusra' -> 'khasra'
        assert "Rampur" in result.full_text          # Auto-corrected 'Rampoor' -> 'Rampur' via LGD gazetteer
        assert result.consensus_confidence >= 0.85
        assert len(result.corrections_applied) > 0
