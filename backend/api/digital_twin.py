"""
Terra_vault — Digital Twin API Endpoints
Serves 3D DEM mesh, satellite tile data, and encroachment detection results per land record.
"""
from fastapi import APIRouter, Query
from validation.digital_twin import DigitalTwinEngine

router = APIRouter()


@router.get("/{record_id}")
async def get_digital_twin(
    record_id: str,
    khasra_no: str = Query("104/A"),
    lat: float = Query(11.0168),
    lon: float = Query(76.9558),
    area_sqm: float = Query(4046.0),
):
    """
    Returns the full 3D Digital Twin payload for a land parcel:
    - DEM elevation mesh (SRTM 30m resolution)
    - Registered deed boundary GeoJSON polygon
    - Sentinel-2 cloudless satellite tile URL
    - Terrain classification and elevation statistics
    """
    engine = DigitalTwinEngine()
    twin = engine.generate_twin(
        record_id=record_id,
        khasra_no=khasra_no,
        centroid_lat=lat,
        centroid_lon=lon,
        area_sqm=area_sqm,
    )
    return twin.to_dict()


@router.get("/{record_id}/encroachment")
async def get_encroachment_zones(
    record_id: str,
    lat: float = Query(11.0168),
    lon: float = Query(76.9558),
    khasra_no: str = Query("104/A"),
):
    """
    Returns detected illegal encroachment zones for a land parcel.
    Each zone includes: overlap area (sq.m), severity, neighbor type, and centroid coordinates.
    """
    engine = DigitalTwinEngine()
    zones = engine._detect_encroachments(lat, lon, khasra_no)
    return {
        "record_id": record_id,
        "total_encroachment_zones": len(zones),
        "has_encroachment": len(zones) > 0,
        "zones": zones,
    }
