"""
Terra_vault — Tests for Advanced OCR Expansion (Items 1, 2, 3, & 4)
"""
import pytest
import numpy as np
from ocr_engine.archaic_transliterator import ArchaicScriptTransliterator, TransliterationResult
from ml_pipeline.active_learning import ActiveLearningManager, ActiveLearningFeedback
from ocr_engine.layout_segregator import LayoutSegregator, RegionSegmentation
from ocr_engine.multi_page_aggregator import MultiPageDeedAggregator, AggregatedDeedRecord


class TestArchaicScriptTransliterator:
    def test_transliterate_modi_script(self):
        t = ArchaicScriptTransliterator()
        res = t.transliterate(" मौजे जमीन ", script="modi")
        assert isinstance(res, TransliterationResult)
        assert res.script == "Modi"
        assert len(res.modern_script_text) > 0
        assert res.confidence >= 0.90

    def test_transliterate_kaithi_script(self):
        t = ArchaicScriptTransliterator()
        res = t.transliterate(" 𑂎𑂞𑂱𑂨𑂰𑂢 ", script="kaithi")
        assert res.script == "Kaithi"
        assert "खतियान" in res.modern_script_text

    def test_transliterate_grantha_script(self):
        t = ArchaicScriptTransliterator()
        res = t.transliterate(" 𑌪𑌟𑍍𑌟𑌾 ", script="grantha")
        assert res.script == "Grantha"
        assert "பட்டா" in res.modern_script_text


class TestActiveLearningManager:
    def test_record_feedback_and_stats(self, tmp_path):
        mgr = ActiveLearningManager(data_dir=str(tmp_path))
        fb = mgr.record_feedback(
            task_id="task-101",
            record_id="rec-202",
            field_name="khasra_no",
            original_val="104/B",
            corrected_val="104/A",
            reviewer_id="reviewer-test"
        )
        assert isinstance(fb, ActiveLearningFeedback)
        assert fb.corrected_value == "104/A"

        stats = mgr.get_dataset_stats()
        assert stats["total_samples"] == 1
        assert stats["fields_breakdown"].get("khasra_no") == 1


class TestLayoutSegregator:
    def test_segregate_handwritten_margin(self):
        seg = LayoutSegregator()
        img = np.ones((500, 800, 3), dtype=np.uint8) * 255
        regions = seg.segregate_layout(img)
        assert isinstance(regions, list)
        assert len(regions) >= 2
        assert any(r.content_type == "PRINTED_BOILERPLATE" for r in regions)
        assert any(r.content_type == "HANDWRITTEN_MARGIN_NOTE" for r in regions)


class TestMultiPageDeedAggregator:
    def test_aggregate_multi_page_deed(self):
        agg = MultiPageDeedAggregator()
        p1 = {"full_text": "Page 1 Stamp Paper Khasra 104/A Owner Ram Kumar", "confidence": 0.95, "khasra_no": "104/A", "owner_name": "Ram Kumar"}
        p2 = {"full_text": "Page 2 Schedule of Property Boundary North Road South Lake", "confidence": 0.92}

        rec = agg.aggregate([p1, p2])
        assert isinstance(rec, AggregatedDeedRecord)
        assert rec.total_pages == 2
        assert rec.primary_khasra_no == "104/A"
        assert "--- PAGE 1 ---" in rec.unified_full_text
        assert "--- PAGE 2 ---" in rec.unified_full_text
