"""
Terra_vault — Tests for Advanced OCR v2 (5 Independent Features)
"""
import pytest


# ── Feature 1: Confidence Heatmap ────────────────────────────────────────────

class TestConfidenceHeatmap:
    def test_generate_demo_returns_boxes(self):
        from ocr_engine.confidence_heatmap import ConfidenceHeatmapGenerator
        gen = ConfidenceHeatmapGenerator()
        boxes = gen.generate_demo()
        assert len(boxes) > 0
        for b in boxes:
            assert 0.0 <= b.confidence <= 1.0
            assert b.color_hex in ("#10b981", "#f59e0b", "#ef4444")
            assert b.label in ("HIGH", "MODERATE", "LOW")

    def test_generate_from_custom_words(self):
        from ocr_engine.confidence_heatmap import ConfidenceHeatmapGenerator
        gen = ConfidenceHeatmapGenerator()
        words = [
            {"word": "खसरा", "bbox": {"x": 10, "y": 20, "w": 60, "h": 22}, "confidence": 0.95},
            {"word": "नंबर", "bbox": {"x": 80, "y": 20, "w": 55, "h": 22}, "confidence": 0.60},
        ]
        boxes = gen.generate(words)
        assert len(boxes) == 2
        assert boxes[0].label == "HIGH"
        assert boxes[1].label == "LOW"
        assert boxes[1].color_hex == "#ef4444"

    def test_summary_aggregation(self):
        from ocr_engine.confidence_heatmap import ConfidenceHeatmapGenerator
        gen = ConfidenceHeatmapGenerator()
        boxes = gen.generate_demo()
        summary = gen.summary(boxes)
        assert summary["total"] == len(boxes)
        assert summary["high"] + summary["moderate"] + summary["low"] == summary["total"]
        assert 0.0 <= summary["avg_confidence"] <= 1.0


# ── Feature 2: Smart Field Cross-Validator ────────────────────────────────────

class TestSmartFieldCrossValidator:
    def test_all_rules_pass(self):
        from ocr_engine.field_cross_validator import SmartFieldCrossValidator
        validator = SmartFieldCrossValidator()
        results = validator.validate({
            "owner_name": "Suresh Kumar", "mutation_owner": "Suresh Kumar",
            "area_ocr_sqm": 4046.0, "gis_area_sqm": 4100.0,
            "stamp_duty_inr": 22000, "sale_consideration_inr": 280000,
            "registration_date": "14/05/2018", "mutation_date": "22/06/2018",
        })
        assert len(results) == 4
        failed = [r for r in results if not r.passed]
        assert len(failed) == 0

    def test_stamp_duty_failure(self):
        from ocr_engine.field_cross_validator import SmartFieldCrossValidator
        validator = SmartFieldCrossValidator()
        results = validator.validate({
            "stamp_duty_inr": 5000, "sale_consideration_inr": 500000,
        })
        stamp_rule = next((r for r in results if r.rule_id == "RULE_03_STAMP_DUTY_RATIO"), None)
        assert stamp_rule is not None
        assert not stamp_rule.passed
        assert stamp_rule.severity == "ERROR"

    def test_date_sequence_failure(self):
        from ocr_engine.field_cross_validator import SmartFieldCrossValidator
        validator = SmartFieldCrossValidator()
        results = validator.validate({
            "registration_date": "22/06/2020",
            "mutation_date": "14/05/2018",  # before registration
        })
        date_rule = next((r for r in results if r.rule_id == "RULE_04_DATE_SEQUENCE"), None)
        assert date_rule is not None
        assert not date_rule.passed

    def test_levenshtein_similarity(self):
        from ocr_engine.field_cross_validator import SmartFieldCrossValidator
        v = SmartFieldCrossValidator()
        assert v._levenshtein_ratio("suresh kumar", "suresh kumar") == 1.0
        assert v._levenshtein_ratio("ram", "ran") > 0.6
        assert v._levenshtein_ratio("abc", "xyz") < 0.5


# ── Feature 3: Signature Authenticator ───────────────────────────────────────

class TestSignatureAuthenticator:
    def test_demo_regions_detect_forgery(self):
        from ocr_engine.signature_authenticator import SignatureAuthenticator
        auth = SignatureAuthenticator()
        regions = auth.demo_regions()
        results = auth.authenticate(regions)
        assert len(results) == 3
        forgeries = [r for r in results if r.is_duplicate]
        assert len(forgeries) == 1
        assert forgeries[0].forgery_risk in ("DEFINITE_FORGERY", "PROBABLE_FORGERY", "HIGH")

    def test_unique_signatures_no_forgery(self):
        from ocr_engine.signature_authenticator import SignatureAuthenticator
        auth = SignatureAuthenticator()
        unique_regions = [
            {"region_type": "SIGNATURE", "bbox": {"x": 60, "y": 820, "w": 140, "h": 55}, "ink_color": "BLUE_INK", "seed": f"unique_{i}"}
            for i in range(3)
        ]
        results = auth.authenticate(unique_regions)
        forgeries = [r for r in results if r.is_duplicate]
        assert len(forgeries) == 0

    def test_phash_is_hex_string(self):
        from ocr_engine.signature_authenticator import SignatureAuthenticator
        auth = SignatureAuthenticator()
        region = {"region_type": "SIGNATURE", "bbox": {"x": 0, "y": 0, "w": 100, "h": 50}, "seed": "test"}
        phash = auth._compute_phash(region)
        assert len(phash) == 16
        int(phash, 16)   # must be valid hex


# ── Feature 4: Ink Age & Tampering Detector ───────────────────────────────────

class TestInkTamperingDetector:
    def test_high_std_triggers_multi_ink(self):
        from ocr_engine.ink_tampering_detector import InkTamperingDetector
        det = InkTamperingDetector()
        report = det.detect({"width": 800, "height": 1100, "mean_luminance": 180, "std_luminance": 70, "seed": 1})
        assert report.multi_ink_age_detected is True
        assert "MULTI_INK_AGE" in report.tampering_types
        assert report.has_tampering is True

    def test_low_std_no_multi_ink(self):
        from ocr_engine.ink_tampering_detector import InkTamperingDetector
        det = InkTamperingDetector()
        report = det.detect({"width": 800, "height": 1100, "mean_luminance": 160, "std_luminance": 20, "seed": 2})
        assert report.multi_ink_age_detected is False

    def test_risk_score_range(self):
        from ocr_engine.ink_tampering_detector import InkTamperingDetector
        det = InkTamperingDetector()
        report = det.detect({"width": 800, "height": 1100, "mean_luminance": 195, "std_luminance": 62, "seed": 7})
        assert 0.0 <= report.tampering_risk_score <= 100.0

    def test_report_serializable(self):
        from ocr_engine.ink_tampering_detector import InkTamperingDetector
        det = InkTamperingDetector()
        report = det.detect({"seed": 5})
        d = report.to_dict()
        assert "has_tampering" in d
        assert "tampering_types" in d
        assert "suspect_regions" in d


# ── Feature 5: Handwriting Style Clustering ───────────────────────────────────

class TestHandwritingClusterer:
    def test_extract_features_returns_vector(self):
        from ocr_engine.handwriting_clusterer import HandwritingStyleClusterer
        clusterer = HandwritingStyleClusterer()
        feat = clusterer.extract_features("deed_2018_p1", {"seed": 2018})
        assert len(feat.feature_vector) == 6
        assert all(0.0 <= v <= 1.5 for v in feat.feature_vector)

    def test_cluster_returns_result(self):
        from ocr_engine.handwriting_clusterer import HandwritingStyleClusterer
        clusterer = HandwritingStyleClusterer()
        page_ids = ["deed_2018_p1", "deed_2020_p1", "deed_2018_p2", "deed_2024_p1", "deed_2022_p1"]
        features = [clusterer.extract_features(pid, {}) for pid in page_ids]
        result = clusterer.cluster(features, k=2)
        assert result.total_pages == 5
        assert result.total_clusters <= 2
        assert isinstance(result.has_suspicious_cluster, bool)

    def test_suspicious_cluster_large_group(self):
        from ocr_engine.handwriting_clusterer import HandwritingStyleClusterer
        clusterer = HandwritingStyleClusterer()
        # Same page_id → same feature vector → all in one cluster → suspicious
        features = [clusterer.extract_features("deed_same_hand", {}) for _ in range(5)]
        result = clusterer.cluster(features, k=1)
        assert result.clusters[0]["is_suspicious"] is True

    def test_euclidean_distance(self):
        from ocr_engine.handwriting_clusterer import HandwritingStyleClusterer
        c = HandwritingStyleClusterer()
        assert c._euclidean([0.0, 0.0], [0.0, 0.0]) == 0.0
        assert c._euclidean([0.0, 0.0], [3.0, 4.0]) == 5.0
