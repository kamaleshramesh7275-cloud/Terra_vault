"""
Terra_vault — Temporal Graph AI Fraud API Endpoints
Exposes scan endpoints for land mafia rings, circular property flips, and Benami proxy buyers.
"""
from fastapi import APIRouter, HTTPException
from validation.temporal_graph_ai import TemporalGraphAIEngine

router = APIRouter()


@router.get("/mafia-scan")
async def scan_land_mafia():
    """Run Temporal Graph AI scan across all transaction lineages to detect land mafia rings."""
    engine = TemporalGraphAIEngine()
    alerts = engine.scan_for_land_mafia()
    return {
        "total_rings_detected": len(alerts),
        "critical_alerts": sum(1 for a in alerts if a.severity == "CRITICAL"),
        "alerts": [a.to_dict() for a in alerts]
    }


@router.get("/subgraph/{record_id}")
async def get_record_subgraph(record_id: str):
    """Fetch node and edge relationship subgraph for a specific land record."""
    engine = TemporalGraphAIEngine()
    subgraph = engine.get_subgraph(record_id)
    return subgraph
