"""Terra_vault — Fraud Alert API
Exposes CRUD + stats for FraudAlert records produced by the weekly graph scan.
Any authenticated user can view and resolve alerts.
"""
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from api.auth import get_current_user
from core.database import get_db
from core.models import FraudAlert

router = APIRouter()


# ── Serializer ────────────────────────────────────────────────────────────────

def _serialize(fa: FraudAlert) -> dict:
    return {
        "id":             fa.id,
        "alert_type":     fa.alert_type,
        "severity":       fa.severity,
        "record_ids":     fa.record_ids or [],
        "description":    fa.description,
        "subgraph_nodes": fa.subgraph_nodes or [],
        "detected_at":    fa.detected_at.isoformat() if fa.detected_at else None,
        "resolved":       fa.resolved,
        "resolved_by":    fa.resolved_by,
        "resolved_at":    fa.resolved_at.isoformat() if fa.resolved_at else None,
    }


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/alerts")
async def list_alerts(
    severity: Optional[str] = Query(None, description="critical|high|medium"),
    resolved: Optional[bool] = Query(None, description="true=only resolved, false=only open"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    """List fraud alerts with optional filtering."""
    stmt = select(FraudAlert).order_by(FraudAlert.detected_at.desc())
    if severity:
        stmt = stmt.where(FraudAlert.severity == severity)
    if resolved is not None:
        stmt = stmt.where(FraudAlert.resolved == resolved)

    total = (await db.execute(
        select(func.count()).select_from(stmt.subquery())
    )).scalar()

    stmt = stmt.offset((page - 1) * page_size).limit(page_size)
    items = (await db.execute(stmt)).scalars().all()

    return {"total": total, "page": page, "page_size": page_size, "items": [_serialize(fa) for fa in items]}


@router.get("/alerts/{alert_id}")
async def get_alert(
    alert_id: str,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    """Get a single fraud alert by ID."""
    fa = await db.get(FraudAlert, alert_id)
    if not fa:
        raise HTTPException(status_code=404, detail="Alert not found")
    return _serialize(fa)


@router.post("/alerts/{alert_id}/resolve")
async def resolve_alert(
    alert_id: str,
    body: dict,
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    """Mark a fraud alert as resolved."""
    fa = await db.get(FraudAlert, alert_id)
    if not fa:
        raise HTTPException(status_code=404, detail="Alert not found")
    if fa.resolved:
        raise HTTPException(status_code=400, detail="Alert is already resolved")

    resolver_id = body.get("resolver_id") or _user.username
    fa.resolved    = True
    fa.resolved_by = resolver_id
    fa.resolved_at = datetime.utcnow()
    await db.commit()

    return {"status": "resolved", "alert_id": alert_id, "resolved_by": resolver_id,
            "resolved_at": fa.resolved_at.isoformat()}


@router.get("/stats")
async def fraud_stats(
    db: AsyncSession = Depends(get_db),
    _user=Depends(get_current_user),
):
    """Aggregate fraud alert statistics."""
    total      = (await db.execute(select(func.count(FraudAlert.id)))).scalar() or 0
    unresolved = (await db.execute(
        select(func.count(FraudAlert.id)).where(FraudAlert.resolved == False)  # noqa: E712
    )).scalar() or 0
    resolved   = total - unresolved

    # Counts by severity (unresolved only — what reviewers need to act on)
    by_severity = {}
    for sev in ("critical", "high", "medium"):
        cnt = (await db.execute(
            select(func.count(FraudAlert.id))
            .where(FraudAlert.severity == sev, FraudAlert.resolved == False)  # noqa: E712
        )).scalar() or 0
        by_severity[sev] = cnt

    resolution_rate = round(resolved / total, 4) if total else 0.0

    return {
        "total": total,
        "unresolved": unresolved,
        "resolved": resolved,
        "by_severity": by_severity,
        "resolution_rate": resolution_rate,
    }
