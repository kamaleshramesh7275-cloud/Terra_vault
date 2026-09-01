"""
Terra_vault — Tests for GeoAI Satellite Ground Truth Verification Engine
"""
import pytest
from validation.geoai_satellite import GeoAISatelliteEngine, GeoAISatelliteReport


class TestGeoAISatelliteEngine:
    def test_standard_agri_land_verification(self):
        engine = GeoAISatelliteEngine()
        record = {
            "id": "rec-geo-1",
            "khasra_no": "101/A",
            "village": "Rampur",
            "district": "Lucknow",
            "land_type": "agricultural",
            "area_value": 2.5,
            "area_unit": "acre"
        }
        report = engine.verify_record(record)
        assert isinstance(report, GeoAISatelliteReport)
        assert report.ndvi_index > 0.40
        assert report.iou_match_score >= 80.0
        assert report.is_ghost_plot is False

    def test_unauthorized_construction_detection(self):
        engine = GeoAISatelliteEngine()
        # Seed record that triggers unauthorized building flag
        record = {
            "id": "rec-geo-unauth",
            "khasra_no": "101",
            "village": "Rampur",
            "district": "Lucknow",
            "land_type": "agricultural",
            "quality_issues": ["unauthorized construction suspected"]
        }
        report = engine.verify_record(record)
        assert report.has_unauthorized_construction is True
        assert report.ndbi_index > 0.20
        assert any(a["code"] == "UNAUTHORIZED_CONSTRUCTION" for a in report.alerts)

    def test_ghost_land_waterbody_detection(self):
        engine = GeoAISatelliteEngine()
        record = {
            "id": "rec-geo-ghost",
            "khasra_no": "water_body_12",
            "village": "Lakebed",
            "district": "Coimbatore",
            "land_type": "riverbed"
        }
        report = engine.verify_record(record)
        assert report.is_ghost_plot is True
        assert report.ghost_plot_type is not None
        assert any(a["code"] == "GHOST_LAND_OVERLAP" for a in report.alerts)
        assert report.verification_status == "VIOLATION_DETECTED"
