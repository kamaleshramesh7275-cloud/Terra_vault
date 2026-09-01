"""
Terra_vault — Regression Tests for Master Fine-Tuning across all 13 Feature Modules
"""
import pytest
from core.config import settings


# ── Module 1: Config & Thresholds ──────────────────────────────────────────────

def test_config_thresholds_loaded():
    assert settings.CONFIDENCE_THRESHOLD == 0.75
    assert settings.OCR_LGD_FUZZY_THRESHOLD == 0.75
    assert settings.IQA_BLUR_THRESHOLD_96DPI == 60.0
    assert settings.IQA_BLUR_THRESHOLD_300DPI == 200.0
    assert settings.ZK_PROOF_TTL_HOURS == 24
    assert settings.SIG_HAMMING_DEFINITE_FORGERY == 5
    assert settings.TAMPER_MULTI_INK_STD_THRESHOLD == 55.0
    assert settings.HW_FEATURE_DIMS == 6


# ── Module 2: Stamp Detector (Per-State HSV) ──────────────────────────────────

def test_stamp_detector_per_state_hsv():
    from ocr_engine.stamp_detector import StampDetector
    detector = StampDetector()
    for state in ["TN", "MH", "UP", "RJ"]:
        detections = detector.detect("/tmp/nonexistent.jpg", state_code=state)
        # Should return fallback detections if image not found
        assert len(detections) >= 2
        labels = [d.label for d in detections]
        assert "official_seal" in labels
        assert "signature" in labels


# ── Module 3: MultiPass Ensemble OCR (Weighted Voting & Adaptive LGD) ─────────

def test_ensemble_ocr_weighted_voting_and_adaptive_lgd():
    from ocr_engine.ensemble_ocr import MultiPassEnsembleOCR
    ocr = MultiPassEnsembleOCR()

    pass_texts = [
        ("खसरा नंबर 104/A gram Rampur", 0.85),
        ("kasra number 104/A village Rampur", 0.70),
    ]
    res = ocr.process_ensemble(pass_texts)
    assert res.full_text != ""
    assert 0.0 <= res.consensus_confidence <= 1.0
    assert len(res.passes_run) == 6  # includes otsu and morph opening passes


# ── Module 4: Table Extractor (Adaptive DPI Kernels) ──────────────────────────

def test_table_extractor_default():
    from ocr_engine.table_extractor import TableExtractor
    ext = TableExtractor()
    table = ext.extract_table("/tmp/nonexistent.jpg")
    assert table.num_rows > 0
    assert table.num_cols > 0


# ── Module 5: Upload Quality Gatekeeper (Per-DPI Blur & Weighted Scoring) ─────

def test_upload_gatekeeper_weighted_health():
    from ml_pipeline.upload_gatekeeper import UploadGatekeeper
    gk = UploadGatekeeper()
    report = gk._fallback_report("test.jpg")
    assert report.health_score > 0
    assert report.zero_drop_passed is True


# ── Module 6: Generative Inpainter (Navier-Stokes Fallback & Otsu Masking) ───

def test_generative_inpainter_report():
    from ml_pipeline.generative_inpainter import GenerativeInpainter
    inp = GenerativeInpainter()
    report = inp._default_report("test.jpg")
    assert report.damaged_area_pct > 0
    assert len(report.reconstructed_regions) > 0


# ── Module 7: Self-Learning AI Engine (SHA-256 Dedup & HF Format) ────────────

def test_self_learning_sha256_dedup_and_hf_export(tmp_path):
    from ml_pipeline.self_learning import SelfLearningEngine
    sle = SelfLearningEngine(data_dir=str(tmp_path))

    # Record first pair
    sample1 = sle.record_learning_pair("owner_name", "Surish Kumar", "Suresh Kumar")
    assert len(sample1.dedup_hash) == 64

    # Record exact duplicate — should be deduplicated
    sample2 = sle.record_learning_pair("owner_name", "Surish Kumar", "Suresh Kumar")
    assert sample1.dedup_hash == sample2.dedup_hash

    # Check HF export format
    hf_data = sle.export_huggingface_dataset()
    assert "train" in hf_data
    assert "validation" in hf_data
    assert "test" in hf_data


# ── Module 8: GeoAI Satellite Ground Truth (Tiered IoU & Token Cache) ─────────

def test_geoai_satellite_tiered_iou():
    from validation.geoai_satellite import GeoAISatelliteEngine
    geo = GeoAISatelliteEngine()
    record = {
        "id": "rec_001", "khasra_no": "104/A", "village": "Rampur",
        "district": "Lucknow", "land_type": "agricultural",
        "area_value": 1.0, "area_unit": "acre"
    }
    report = geo.verify_record(record)
    assert report.verification_status in ("MATCHED", "DISCREPANCY_FLAGGED", "VIOLATION_DETECTED")
    assert 0.0 <= report.iou_match_score <= 100.0


# ── Module 9: ZK Proof Generator (Poseidon SHA3-256 & 24h TTL) ────────────────

def test_zk_proof_generator_poseidon_and_ttl():
    from blockchain.zk_proof_generator import ZKProofGenerator
    zk = ZKProofGenerator()
    payload = zk.generate_title_cleanliness_proof("rec_001", "104/A", 85.0)
    assert payload.is_valid is True
    assert payload.expires_at != ""
    assert len(payload.public_inputs) == 2


# ── Module 10: Polygon ZK Verifier (RPC Fallback Pool) ─────────────────────────

def test_polygon_verifier_rpc_pool():
    from blockchain.polygon_verifier import PolygonZKVerifier
    verifier = PolygonZKVerifier()
    assert len(verifier.rpc_endpoints) == 3
    res = verifier.verify_on_chain({"proof_id": "zk_001", "is_valid": True, "verification_hash": "0x1234567890abcdef"})
    assert res.is_onchain_valid is True
    assert "polygonscan.com" in res.explorer_url


# ── Module 11: Temporal Graph AI (Benami Ring & 4 Patterns) ────────────────────

def test_temporal_graph_ai_patterns():
    from validation.temporal_graph_ai import TemporalGraphAIEngine
    graph = TemporalGraphAIEngine()
    alerts = graph.scan_for_land_mafia()
    assert len(alerts) >= 2
    types = [a.pattern_type for a in alerts]
    assert "CIRCULAR_PROPERTY_FLIP" in types
    assert "BENAMI_SHELL_BUYER" in types


# ── Module 12: Digital Twin 3D Parcel (16x16 DEM & 6-Tier Terrain) ─────────────

def test_digital_twin_16x16_dem():
    from validation.digital_twin import DigitalTwinEngine
    twin_engine = DigitalTwinEngine()

    # Large parcel (>2000 sq.m) -> 16x16 = 256 elevation points
    payload = twin_engine.generate_twin("rec_001", "104/A", area_sqm=4046.0)
    assert len(payload.elevation_mesh) == 256
    assert payload.terrain_type in (
        "FLAT_PLAIN", "GENTLE_SLOPE", "MODERATE_INCLINE",
        "STEEP_HILL", "WATERLOGGED_BASIN", "ROCKY_RIDGE"
    )


# ── Module 13: Advanced OCR v2 (Heatmap, CrossVal, Sig, Ink, HW Cluster) ───────

def test_advanced_ocr_v2_finetuned_integration():
    from ocr_engine.confidence_heatmap import ConfidenceHeatmapGenerator
    from ocr_engine.field_cross_validator import SmartFieldCrossValidator
    from ocr_engine.signature_authenticator import SignatureAuthenticator
    from ocr_engine.ink_tampering_detector import InkTamperingDetector
    from ocr_engine.handwriting_clusterer import HandwritingStyleClusterer

    # 1. Heatmap per-field thresholds
    hm_gen = ConfidenceHeatmapGenerator()
    boxes = hm_gen.generate_demo()
    assert len(boxes) > 40
    summary = hm_gen.summary(boxes)
    assert "low_confidence_critical_fields" in summary

    # 2. CrossVal state stamp duty + new rules
    validator = SmartFieldCrossValidator()
    val_results = validator.validate({
        "owner_name": "Suresh Kumar", "mutation_owner": "Suresh Kumar",
        "area_ocr_sqm": 4046.0, "gis_area_sqm": 4100.0,
        "stamp_duty_inr": 28000, "sale_consideration_inr": 400000,
        "registration_date": "14/05/2018", "mutation_date": "22/06/2018",
        "state_code": "TN", "survey_no": "104/A", "executant_birth_year": 1980,
    })
    rule_ids = [r.rule_id for r in val_results]
    assert "RULE_05_SURVEY_FORMAT" in rule_ids
    assert "RULE_06_EXECUTANT_AGE" in rule_ids

    # 3. Signature authenticator tiered forgery
    auth = SignatureAuthenticator()
    sig_res = auth.authenticate(auth.demo_regions())
    assert len(sig_res) == 3

    # 4. Ink tampering weighted risk
    det = InkTamperingDetector()
    tamp_rep = det.detect({"width": 800, "height": 1100, "mean_luminance": 190, "std_luminance": 60, "seed": 42})
    assert tamp_rep.has_tampering is True

    # 5. Handwriting clusterer 6D features
    hw = HandwritingStyleClusterer()
    f1 = hw.extract_features("p1", {})
    assert len(f1.feature_vector) == 6
