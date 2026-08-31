"""Terra_vault — Blockchain API endpoints"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.models import LandRecord, BlockchainAnchor
from blockchain.anchor import anchor_record as do_anchor, verify_record as do_verify

router = APIRouter()


@router.post("/{record_id}/anchor")
async def anchor(record_id: str, verifier_id: str, db: AsyncSession = Depends(get_db)):
    """Anchor a verified record hash to Polygon Amoy testnet."""
    record = await db.get(LandRecord, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    if record.status != "verified":
        raise HTTPException(status_code=400, detail="Only verified records can be anchored")

    record_dict = {
        "id": record.id, "owner_name": record.owner_name, "khasra_no": record.khasra_no,
        "village": record.village, "district": record.district, "state": record.state,
        "area_value": record.area_value, "area_unit": record.area_unit,
        "mutation_no": record.mutation_no, "doc_sha256": record.doc_sha256,
    }
    result = await do_anchor(record_id, record_dict, verifier_id)

    if result.get("status") == "anchored":
        anchor = BlockchainAnchor(
            record_id=record_id,
            record_hash=result["record_hash"],
            tx_hash=result["tx_hash"],
            block_number=result["block_number"],
            verifier_id=verifier_id,
        )
        db.add(anchor)
        record.blockchain_anchored = True
        await db.commit()

    return result


@router.get("/{record_id}/verify")
async def verify(record_id: str, db: AsyncSession = Depends(get_db)):
    """Verify a record's blockchain anchor — detect tampering."""
    record = await db.get(LandRecord, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    from sqlalchemy import select
    anchor = (await db.execute(select(BlockchainAnchor).where(BlockchainAnchor.record_id == record_id))).scalar_one_or_none()
    verifier_id = anchor.verifier_id if anchor else "system"

    record_dict = {
        "id": record.id, "owner_name": record.owner_name, "khasra_no": record.khasra_no,
        "village": record.village, "district": record.district, "state": record.state,
        "area_value": record.area_value, "area_unit": record.area_unit,
        "mutation_no": record.mutation_no, "doc_sha256": record.doc_sha256,
    }
    result = await do_verify(record_id, record_dict, verifier_id=verifier_id)

    if anchor:
        result["tx_hash"] = anchor.tx_hash
        result["block_number"] = anchor.block_number
    return result
