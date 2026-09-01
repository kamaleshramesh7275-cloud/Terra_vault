"""
Terra_vault — Tests for Innovation 6 (Digital Twin 3D Land Parcel Visualizer)
"""
import pytest
from validation.digital_twin import DigitalTwinEngine, DigitalTwinPayload, EncroachmentZone


class TestDigitalTwinEngine:
    def test_generate_twin_returns_payload(self):
        engine = DigitalTwinEngine()
        twin = engine.generate_twin(
            record_id="rec-test-001",
            khasra_no="104/A",
            centroid_lat=11.0168,
            centroid_lon=76.9558,
            area_sqm=4046.0,
        )
        assert isinstance(twin, DigitalTwinPayload)
        assert twin.record_id == "rec-test-001"
        assert twin.khasra_no == "104/A"

    def test_elevation_mesh_is_populated(self):
        engine = DigitalTwinEngine()
        twin = engine.generate_twin("rec-001", "101", 11.01, 76.95, 2000.0)
        assert len(twin.elevation_mesh) == 64   # 8x8 grid
        assert all("elevation_m" in p for p in twin.elevation_mesh)

    def test_elevation_stats_are_consistent(self):
        engine = DigitalTwinEngine()
        twin = engine.generate_twin("rec-002", "102", 11.02, 76.96, 3000.0)
        assert twin.elevation_min_m <= twin.elevation_avg_m <= twin.elevation_max_m

    def test_terrain_classification(self):
        engine = DigitalTwinEngine()
        terrain = engine._classify_terrain(280.0, 281.5)    # diff = 1.5 → flat
        assert terrain == "FLAT_PLAIN"
        terrain2 = engine._classify_terrain(280.0, 284.0)   # diff = 4.0 → gentle
        assert terrain2 == "GENTLE_SLOPE"

    def test_boundary_geojson_is_valid(self):
        engine = DigitalTwinEngine()
        twin = engine.generate_twin("rec-003", "103", 11.03, 76.97, 4046.0)
        geo = twin.boundary_geojson
        assert geo["type"] == "Feature"
        assert geo["geometry"]["type"] == "Polygon"
        coords = geo["geometry"]["coordinates"][0]
        assert len(coords) == 5     # 4 corners + closing point
        assert coords[0] == coords[-1]   # polygon is closed

    def test_encroachment_detector_returns_list(self):
        engine = DigitalTwinEngine()
        zones = engine._detect_encroachments(11.0168, 76.9558, "104/A")
        assert isinstance(zones, list)
        for z in zones:
            assert "overlap_area_sqm" in z
            assert "severity" in z
            assert "neighbor_type" in z

    def test_twin_dict_serialization(self):
        engine = DigitalTwinEngine()
        twin = engine.generate_twin("rec-004", "104", 11.04, 76.98, 4046.0)
        d = twin.to_dict()
        assert isinstance(d, dict)
        assert "elevation_mesh" in d
        assert "boundary_geojson" in d
        assert "encroachments" in d
