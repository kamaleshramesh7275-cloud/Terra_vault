"""
Terra_vault — Tests for Master Upload Quality Gatekeeper, Generative Inpainter, & Self-Learning AI
"""
import pytest
import numpy as np
from ml_pipeline.upload_gatekeeper import UploadGatekeeper, UploadHealthReport
from ml_pipeline.generative_inpainter import GenerativeInpainter, GenerativeInpaintingReport
from ml_pipeline.self_learning import SelfLearningEngine, SelfLearningSample


class TestUploadGatekeeper:
    def test_assess_and_enhance_degraded_document(self):
        gatekeeper = UploadGatekeeper()
        # Synthetic document image
        img = np.ones((400, 400, 3), dtype=np.uint8) * 220
        img[100:150, 100:300] = 40  # Text line

        report = gatekeeper.assess_and_enhance("/tmp/synthetic_doc.jpg")
        assert isinstance(report, UploadHealthReport)
        assert report.health_score > 0.0
        assert report.zero_drop_passed is True
        assert len(report.steps_applied) > 0


class TestGenerativeInpainter:
    def test_reconstruct_missing_parts(self):
        inpainter = GenerativeInpainter()
        img = np.ones((300, 300, 3), dtype=np.uint8) * 250
        img[0:40, 260:300] = 255  # Torn top-right corner

        report = inpainter.reconstruct_missing_parts(img)
        assert isinstance(report, GenerativeInpaintingReport)
        assert report.inpainting_method == "Generative LaMa Neural Inpainting + Telea"
        assert len(report.reconstructed_regions) > 0


class TestSelfLearningEngine:
    def test_self_learning_loop(self, tmp_path):
        engine = SelfLearningEngine(data_dir=str(tmp_path))
        sample = engine.record_learning_pair(
            field_name="owner_name",
            original_ocr="Ram Kumr",
            human_corrected="Ram Kumar",
            is_inpainted=True
        )
        assert isinstance(sample, SelfLearningSample)
        assert sample.human_corrected_value == "Ram Kumar"

        check = engine.trigger_model_retrain_check()
        assert check["total_samples"] == 1
        assert check["inpainted_samples"] == 1


class TestColabExporter:
    def test_export_for_colab(self, tmp_path):
        from ml_pipeline.export_colab_dataset import export_for_colab
        zip_path = str(tmp_path / "colab_dataset.zip")
        res = export_for_colab(data_dir=str(tmp_path), output_zip=zip_path)
        assert res == zip_path
