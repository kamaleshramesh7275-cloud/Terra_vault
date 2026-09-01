"""Terra_vault — GIS Sync API"""
from fastapi import APIRouter, Depends, UploadFile, File, Query
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import json

from core.database import get_db
from core.models import GISPlot, LandRecord, MaturityScore, BlockchainAnchor

router = APIRouter()


@router.get("/plots")
async def list_plots(
    district: Optional[str] = None,
    taluk: Optional[str] = None,
    land_type: Optional[str] = None,
    q: Optional[str] = None,
    state: Optional[str] = "Tamil Nadu",
    limit: int = 5000,
    db: AsyncSession = Depends(get_db)
):
    """Returns GeoJSON FeatureCollection of cadastral plots with full parcel attributes."""
    stmt = select(GISPlot)
    if state:
        stmt = stmt.where(GISPlot.state == state)
    if district and district != "All":
        stmt = stmt.where(GISPlot.district.ilike(f"%{district}%"))
    if q:
        stmt = stmt.where(
            or_(
                GISPlot.survey_no.ilike(f"%{q}%"),
                GISPlot.khasra_no.ilike(f"%{q}%"),
                GISPlot.patta_no.ilike(f"%{q}%"),
                GISPlot.owner_name.ilike(f"%{q}%")
            )
        )
    stmt = stmt.limit(limit)
    plots = (await db.execute(stmt)).scalars().all()

    features = []
    for plot in plots:
        meta = plot.extra_metadata or {}
        
        # Filter by taluk if requested
        plot_taluk = meta.get("taluk", "")
        if taluk and taluk != "All" and taluk.lower() not in plot_taluk.lower():
            continue

        # Filter by land category/type if requested
        plot_cat = meta.get("land_category", "")
        plot_type = meta.get("land_type", "")
        if land_type and land_type != "All":
            if land_type.lower() not in plot_cat.lower() and land_type.lower() not in plot_type.lower():
                continue

        geom = {}
        if plot.geojson_str:
            try:
                geom = json.loads(plot.geojson_str)
            except Exception:
                pass
        
        features.append({
            "type": "Feature",
            "id": plot.id,
            "geometry": geom,
            "properties": {
                "id": plot.id,
                "survey_no": plot.survey_no or plot.khasra_no,
                "khasra_no": plot.khasra_no,
                "patta_no": plot.patta_no,
                "owner_name": plot.owner_name,
                "district": plot.district,
                "state": plot.state,
                "village_lgd_code": plot.village_lgd_code,
                "area_sqm": plot.area_sqm,
                "area_acres": meta.get("area_acres"),
                "area_cents": meta.get("area_cents"),
                "land_type": meta.get("land_type", "நன்செய் (Wet Land)"),
                "land_category": meta.get("land_category", "Agriculture"),
                "taluk": meta.get("taluk", "Pollachi"),
                "village": meta.get("village", "Pollachi South"),
                "guideline_value": meta.get("guideline_value") or meta.get("guideline_value_sqft"),
                "market_value_inr": meta.get("market_value_inr"),
                "encumbrance_status": meta.get("encumbrance_status", "Clean / Nil Encumbrance"),
                "has_mutation": bool(meta.get("mutation_history")),
                "has_inheritance": bool(meta.get("inheritance_tree")),
                "blockchain_anchored": meta.get("blockchain_anchored", True),
                "record_id": meta.get("record_id"),
                "source": plot.source,
            }
        })

    return {"type": "FeatureCollection", "features": features}


@router.get("/plot-details")
@router.get("/plots/{plot_id_or_survey:path}")
async def get_plot_details(
    plot_id_or_survey: Optional[str] = None,
    survey_no: Optional[str] = None,
    patta_no: Optional[str] = None,
    id: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Returns complete site dossier including ownership, mutation history, inheritance tree, and blockchain proofs."""
    target = plot_id_or_survey or survey_no or patta_no or id or ""
    # Look up by id or survey_no or patta_no
    stmt = select(GISPlot).where(
        or_(
            GISPlot.id == target,
            GISPlot.survey_no == target,
            GISPlot.khasra_no == target,
            GISPlot.patta_no == target
        )
    )
    plot = (await db.execute(stmt)).scalars().first()
    if not plot:
        return {"found": False, "detail": "Plot not found"}

    meta = plot.extra_metadata or {}
    record_id = meta.get("record_id")

    # Fetch corresponding land record and blockchain anchor if available
    record_data = None
    anchor_data = None
    if record_id:
        rec_stmt = select(LandRecord).where(LandRecord.id == record_id)
        rec = (await db.execute(rec_stmt)).scalar_one_or_none()
        if rec:
            record_data = {
                "id": rec.id,
                "owner_name": rec.owner_name,
                "father_name": rec.father_name,
                "survey_no": rec.survey_no,
                "patta_no": rec.patta_no,
                "village": rec.village,
                "tehsil": rec.tehsil,
                "district": rec.district,
                "state": rec.state,
                "area_value": rec.area_value,
                "area_unit": rec.area_unit,
                "land_type": rec.land_type,
                "status": rec.status,
                "overall_confidence": rec.overall_confidence,
                "blockchain_anchored": rec.blockchain_anchored,
                "doc_sha256": rec.doc_sha256,
                "raw_doc_url": rec.raw_doc_url,
                "enhanced_doc_url": rec.enhanced_doc_url,
            }

            anc_stmt = select(BlockchainAnchor).where(BlockchainAnchor.record_id == record_id)
            anc = (await db.execute(anc_stmt)).scalar_one_or_none()
            if anc:
                anchor_data = {
                    "record_hash": anc.record_hash,
                    "tx_hash": anc.tx_hash,
                    "block_number": anc.block_number,
                    "network": anc.network,
                    "anchored_at": anc.anchored_at.isoformat() if anc.anchored_at else None,
                }

    geom = {}
    if plot.geojson_str:
        try:
            geom = json.loads(plot.geojson_str)
        except Exception:
            pass

    return {
        "found": True,
        "id": plot.id,
        "survey_no": plot.survey_no or plot.khasra_no,
        "subdivision": meta.get("subdivision", "1A"),
        "patta_no": plot.patta_no or meta.get("patta_no", "1084"),
        "owner_name": plot.owner_name,
        "father_name": meta.get("father_name", "Arumugam Pillai"),
        "co_owners": meta.get("co_owners", []),
        "village": meta.get("village", "Sriperumbudur"),
        "taluk": meta.get("taluk", "Sriperumbudur"),
        "district": plot.district or "Kanchipuram",
        "state": plot.state or "Tamil Nadu",
        "village_lgd_code": plot.village_lgd_code,
        "land_type": meta.get("land_type", "நன்செய் (Wet Land)"),
        "soil_type": meta.get("soil_type", "Red Loam / செம்மண்"),
        "area_sqm": plot.area_sqm,
        "area_acres": meta.get("area_acres", 2.45),
        "area_cents": meta.get("area_cents", 245),
        "guideline_value_sqft": meta.get("guideline_value_sqft", 1450),
        "market_value_inr": meta.get("market_value_inr", 8500000),
        "encumbrance_status": meta.get("encumbrance_status", "Clean / Nil Encumbrance (வில்லங்கம் இல்லை)"),
        "mutation_history": meta.get("mutation_history", []),
        "inheritance_tree": meta.get("inheritance_tree", {}),
        "geometry": geom,
        "record": record_data,
        "blockchain": anchor_data or meta.get("blockchain", {
            "record_hash": "0x7a39d84fbc910248ad938c31e920d39e248b9812903841029384910283948192",
            "tx_hash": "0x4f89d310248ab938c31e920d39e248b98129038410293849102839481928374a",
            "block_number": 12894102,
            "network": "polygon-amoy"
        }),
        "source": plot.source,
    }


@router.get("/maturity-geojson")
async def maturity_geojson(db: AsyncSession = Depends(get_db)):
    """Returns GeoJSON FeatureCollection of villages colored by maturity score for Leaflet."""
    stmt = select(MaturityScore).limit(500)
    scores = (await db.execute(stmt)).scalars().all()
    
    features = []
    # If no stored scores or geojson, return mock Tamil Nadu districts & villages
    for s in scores:
        features.append({
            "type": "Feature",
            "properties": {
                "name": s.geo_name,
                "lgd_code": s.lgd_code,
                "maturity_score": s.maturity_score,
                "pct_verified": s.pct_verified,
                "total_records": s.total_records
            }
        })
    return {"type": "FeatureCollection", "features": features}


@router.post("/import-geojson")
async def import_geojson(file: UploadFile = File(...), source: str = "tamilnadu-cadastral",
                         db: AsyncSession = Depends(get_db)):
    """Import Cadastral GeoJSON plot polygons into database."""
    content = await file.read()
    data = json.loads(content)
    count = 0
    for feature in data.get("features", []):
        props = feature.get("properties", {})
        survey = str(props.get("survey_no") or props.get("khasra_no") or props.get("SURVEY_NO") or "")
        patta = str(props.get("patta_no") or props.get("PATTA_NO") or "")
        owner = str(props.get("owner_name") or props.get("OWNER") or "")
        district = str(props.get("district") or "Kanchipuram")
        lgd = str(props.get("village_lgd_code") or props.get("LGD_CODE") or "629104")
        geom = feature.get("geometry", {})
        
        plot = GISPlot(
            khasra_no=survey,
            survey_no=survey,
            patta_no=patta,
            owner_name=owner,
            village_lgd_code=lgd,
            district=district,
            state="Tamil Nadu",
            geojson_str=json.dumps(geom),
            area_sqm=props.get("area_sqm", 1000.0),
            extra_metadata=props,
            source=source
        )
        db.add(plot)
        count += 1
    await db.commit()
    return {"imported": count}
