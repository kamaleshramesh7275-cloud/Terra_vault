"""Terra_vault — Maturity Score API"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from core.database import get_db
from core.models import MaturityScore

router = APIRouter()


@router.get("/")
async def get_maturity_scores(
    geo_level: Optional[str] = Query("village", description="village|tehsil|district"),
    limit: int = Query(50, ge=1, le=500),
    sort_by: str = Query("maturity_score", description="maturity_score|pct_verified|total_records"),
    order: str = Query("asc", description="asc|desc — asc=lowest first (priority)"),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(MaturityScore).where(MaturityScore.geo_level == geo_level)
    col = getattr(MaturityScore, sort_by, MaturityScore.maturity_score)
    stmt = stmt.order_by(col.asc() if order == "asc" else col.desc()).limit(limit)
    scores = (await db.execute(stmt)).scalars().all()
    return [_serialize(s) for s in scores]


@router.get("/summary")
async def maturity_summary(db: AsyncSession = Depends(get_db)):
    from sqlalchemy import func
    total = (await db.execute(select(func.count(MaturityScore.id)))).scalar()
    avg = (await db.execute(select(func.avg(MaturityScore.maturity_score)))).scalar()
    low_priority = (await db.execute(
        select(func.count(MaturityScore.id)).where(MaturityScore.maturity_score < 0.4)
    )).scalar()
    return {
        "total_geo_units": total,
        "avg_maturity_score": round(float(avg or 0), 4),
        "low_priority_units": low_priority,
    }


def _serialize(s: MaturityScore) -> dict:
    return {
        "id": s.id, "geo_level": s.geo_level, "geo_name": s.geo_name,
        "lgd_code": s.lgd_code, "pct_verified": s.pct_verified,
        "avg_confidence": s.avg_confidence, "error_rate": s.error_rate,
        "dispute_rate": s.dispute_rate, "maturity_score": s.maturity_score,
        "total_records": s.total_records,
        "computed_at": s.computed_at.isoformat() if s.computed_at else None,
    }
