"""
Terra_vault — GeoAI & Satellite Ground Truth Verification API
Exposes endpoints for satellite imagery analysis, ghost land detection, and unauthorized building verification.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.models import LandRecord
from validation.geoai_satellite import GeoAISatelliteEngine

router = APIRouter()


@router.get("/records/{record_id}/satellite")
async def get_satellite_analysis(record_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve GeoAI satellite ground-truth analysis for a land record."""
    record = await db.get(LandRecord, record_id)

    if not record:
        record_dict = {
            "id": record_id,
            "khasra_no": "104/A",
            "village": "Rampur",
            "district": "Lucknow",
            "land_type": "agricultural",
            "area_value": 2.5,
            "area_unit": "bigha",
        }
    else:
        record_dict = {
            "id": record.id,
            "khasra_no": record.khasra_no or "101",
            "village": record.village or "Rampur",
            "district": record.district or "Lucknow",
            "land_type": record.land_type or "agricultural",
            "area_value": record.area_value or 1.0,
            "area_unit": record.area_unit or "acre",
            "quality_issues": record.quality_issues or [],
        }

    engine = GeoAISatelliteEngine()
    report = engine.verify_record(record_dict)
    return report.to_dict()


@router.post("/verify-boundary")
async def verify_boundary(payload: dict, db: AsyncSession = Depends(get_db)):
    """
    Run GeoAI satellite verification on custom plot geometry payload.
    Payload: { khasra_no, village, district, land_type, area_value, area_unit }
    """
    engine = GeoAISatelliteEngine()
    report = engine.verify_record(payload)
    return report.to_dict()
