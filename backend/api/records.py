"""Terra_vault — Records API: CRUD + search + blockchain verification"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.models import LandRecord, FieldConfidence, BlockchainAnchor
from blockchain.anchor import verify_record as bc_verify

router = APIRouter()


@router.get("/")
async def list_records(
    q: Optional[str] = Query(None, description="Full-text search"),
    district: Optional[str] = None,
    tehsil: Optional[str] = None,
    village: Optional[str] = None,
    status: Optional[str] = None,
    land_type: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(LandRecord)
    if q:
        stmt = stmt.where(
            LandRecord.owner_name.ilike(f"%{q}%") |
            LandRecord.khasra_no.ilike(f"%{q}%") |
            LandRecord.survey_no.ilike(f"%{q}%")
        )
    if district:  stmt = stmt.where(LandRecord.district.ilike(f"%{district}%"))
    if tehsil:    stmt = stmt.where(LandRecord.tehsil.ilike(f"%{tehsil}%"))
    if village:   stmt = stmt.where(LandRecord.village.ilike(f"%{village}%"))
    if status:    stmt = stmt.where(LandRecord.status == status)
    if land_type: stmt = stmt.where(LandRecord.land_type == land_type)

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = (await db.execute(count_stmt)).scalar()

    stmt = stmt.offset((page - 1) * page_size).limit(page_size)
    records = (await db.execute(stmt)).scalars().all()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "records": [_serialize(r) for r in records],
    }


@router.get("/{record_id}")
async def get_record(record_id: str, db: AsyncSession = Depends(get_db)):
    record = await db.get(LandRecord, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    # Fetch field confidences
    fc_stmt = select(FieldConfidence).where(FieldConfidence.record_id == record_id)
    fcs = (await db.execute(fc_stmt)).scalars().all()

    return {**_serialize(record), "field_confidences": [_serialize_fc(fc) for fc in fcs]}


@router.get("/{record_id}/verify")
async def verify_blockchain(record_id: str, db: AsyncSession = Depends(get_db)):
    """Live blockchain verification — recomputes hash and compares with Polygon anchor."""
    record = await db.get(LandRecord, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    result = await bc_verify(record_id, _serialize(record), verifier_id="system")
    return result


@router.patch("/{record_id}/status")
async def update_status(record_id: str, new_status: str, db: AsyncSession = Depends(get_db)):
    record = await db.get(LandRecord, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    allowed = {"processing", "review", "verified", "disputed", "rejected"}
    if new_status not in allowed:
        raise HTTPException(status_code=400, detail=f"Invalid status: {new_status}")
    record.status = new_status
    await db.commit()
    return {"record_id": record_id, "status": new_status}


def _serialize(r: LandRecord) -> dict:
    return {
        "id": r.id, "owner_name": r.owner_name, "father_name": r.father_name,
        "khasra_no": r.khasra_no, "khata_no": r.khata_no, "survey_no": r.survey_no,
        "village": r.village, "tehsil": r.tehsil, "district": r.district, "state": r.state,
        "village_lgd_code": r.village_lgd_code,
        "area_value": r.area_value, "area_unit": r.area_unit, "land_type": r.land_type,
        "mutation_no": r.mutation_no, "mutation_date": str(r.mutation_date) if r.mutation_date else None,
        "transaction_type": r.transaction_type, "detected_script": r.detected_script,
        "overall_confidence": r.overall_confidence, "quality_score": r.quality_score,
        "status": r.status, "blockchain_anchored": r.blockchain_anchored,
        "raw_doc_url": r.raw_doc_url, "enhanced_doc_url": r.enhanced_doc_url,
        "created_at": r.created_at.isoformat() if r.created_at else None,
    }


def _serialize_fc(fc: FieldConfidence) -> dict:
    return {
        "id": fc.id, "field_name": fc.field_name,
        "raw_ocr_value": fc.raw_ocr_value, "confidence": fc.confidence,
        "flags": fc.flags, "is_corrected": fc.is_corrected,
        "corrected_value": fc.corrected_value, "correction_reason": fc.correction_reason,
    }
