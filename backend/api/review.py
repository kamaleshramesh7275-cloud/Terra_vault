"""Terra_vault — Review Queue API"""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.models import ReviewTask, LandRecord, FieldConfidence

router = APIRouter()


@router.get("/queue")
async def get_review_queue(
    limit: int = 20,
    assigned_to: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Return pending review tasks ordered by priority (highest first)."""
    stmt = (
        select(ReviewTask)
        .where(ReviewTask.status == "pending")
        .order_by(ReviewTask.priority.desc())
        .limit(limit)
    )
    if assigned_to:
        stmt = stmt.where(ReviewTask.assigned_to == assigned_to)
    tasks = (await db.execute(stmt)).scalars().all()
    return [_serialize_task(t) for t in tasks]


@router.get("/queue/{task_id}")
async def get_review_task(task_id: str, db: AsyncSession = Depends(get_db)):
    task = await db.get(ReviewTask, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    record = await db.get(LandRecord, task.record_id)
    fc_stmt = select(FieldConfidence).where(FieldConfidence.record_id == task.record_id)
    fcs = (await db.execute(fc_stmt)).scalars().all()
    return {**_serialize_task(task), "record": _serialize_record(record), "field_confidences": [_serialize_fc(fc) for fc in fcs]}


@router.post("/queue/{task_id}/correct")
async def submit_correction(
    task_id: str,
    corrections: dict,  # {field_name: {value, reason}}
    reviewer_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Submit field corrections from human reviewer."""
    task = await db.get(ReviewTask, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    record = await db.get(LandRecord, task.record_id)
    fc_stmt = select(FieldConfidence).where(FieldConfidence.record_id == task.record_id)
    fcs = {fc.field_name: fc for fc in (await db.execute(fc_stmt)).scalars().all()}

    for field_name, correction in corrections.items():
        # Update record field
        if hasattr(record, field_name):
            setattr(record, field_name, correction.get("value"))
        # Update field confidence
        if field_name in fcs:
            fc = fcs[field_name]
            fc.is_corrected = True
            fc.corrected_value = correction.get("value")
            fc.corrected_by = reviewer_id
            fc.correction_reason = correction.get("reason", "")
            fc.corrected_at = datetime.utcnow()
            fc.confidence = 1.0  # human verified → max confidence

    # Resolve task
    task.status = "resolved"
    task.assigned_to = reviewer_id
    task.resolved_at = datetime.utcnow()
    record.status = "verified"
    record.overall_confidence = 1.0

    await db.commit()
    return {"message": "Corrections saved", "task_id": task_id, "record_id": task.record_id}


@router.get("/stats")
async def review_stats(db: AsyncSession = Depends(get_db)):
    from sqlalchemy import func
    total = (await db.execute(select(func.count(ReviewTask.id)))).scalar()
    pending = (await db.execute(select(func.count(ReviewTask.id)).where(ReviewTask.status == "pending"))).scalar()
    resolved = (await db.execute(select(func.count(ReviewTask.id)).where(ReviewTask.status == "resolved"))).scalar()
    return {"total": total, "pending": pending, "resolved": resolved}


def _serialize_task(t: ReviewTask) -> dict:
    return {"id": t.id, "record_id": t.record_id, "priority": t.priority,
            "flags": t.flags, "status": t.status,
            "created_at": t.created_at.isoformat() if t.created_at else None}

def _serialize_record(r) -> dict:
    if not r: return {}
    return {"id": r.id, "owner_name": r.owner_name, "khasra_no": r.khasra_no,
            "village": r.village, "district": r.district, "overall_confidence": r.overall_confidence,
            "enhanced_doc_url": r.enhanced_doc_url, "detected_script": r.detected_script}

def _serialize_fc(fc) -> dict:
    return {"field_name": fc.field_name, "raw_ocr_value": fc.raw_ocr_value,
            "confidence": fc.confidence, "flags": fc.flags, "is_corrected": fc.is_corrected}
