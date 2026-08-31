"""
Terra_vault — Blockchain Anchoring (Polygon Amoy Testnet)
Computes SHA3-256 hash of verified record and anchors to RecordRegistry contract.
"""
import hashlib
import json
import structlog
from datetime import datetime, timezone
from typing import Optional

from web3 import Web3
from web3.exceptions import ContractLogicError

from core.config import settings

log = structlog.get_logger(__name__)

# ── ABI for RecordRegistry.sol ────────────────────────────────────────────────
RECORD_REGISTRY_ABI = [
    {
        "inputs": [
            {"internalType": "string",  "name": "recordId", "type": "string"},
            {"internalType": "bytes32", "name": "hash",     "type": "bytes32"},
        ],
        "name": "anchorRecord",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    {
        "inputs": [{"internalType": "string", "name": "recordId", "type": "string"}],
        "name": "getLatestAnchor",
        "outputs": [
            {"internalType": "bytes32", "name": "", "type": "bytes32"},
            {"internalType": "address", "name": "", "type": "address"},
            {"internalType": "uint256", "name": "", "type": "uint256"},
        ],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [{"internalType": "string", "name": "recordId", "type": "string"}],
        "name": "getHistory",
        "outputs": [
            {
                "components": [
                    {"internalType": "bytes32", "name": "recordHash", "type": "bytes32"},
                    {"internalType": "address", "name": "verifier",   "type": "address"},
                    {"internalType": "uint256", "name": "timestamp",  "type": "uint256"},
                ],
                "internalType": "struct RecordRegistry.Anchor[]",
                "name": "",
                "type": "tuple[]",
            }
        ],
        "stateMutability": "view",
        "type": "function",
    },
]


def _get_web3() -> Web3:
    w3 = Web3(Web3.HTTPProvider(settings.POLYGON_RPC_URL))
    if not w3.is_connected():
        raise ConnectionError(f"Cannot connect to Polygon RPC: {settings.POLYGON_RPC_URL}")
    return w3


def compute_record_hash(record: dict, verifier_id: str) -> str:
    """
    Computes SHA3-256 of the canonical record JSON + verifier + timestamp.
    Returns hex string (0x-prefixed, 32 bytes).
    """
    # Canonical serialization: sorted keys, no whitespace
    payload = {
        "id":               record.get("id"),
        "owner_name":       record.get("owner_name"),
        "father_name":      record.get("father_name"),
        "khasra_no":        record.get("khasra_no"),
        "khata_no":         record.get("khata_no"),
        "survey_no":        record.get("survey_no"),
        "village":          record.get("village"),
        "tehsil":           record.get("tehsil"),
        "district":         record.get("district"),
        "state":            record.get("state"),
        "area_value":       str(record.get("area_value", "")),
        "area_unit":        record.get("area_unit"),
        "land_type":        record.get("land_type"),
        "mutation_no":      record.get("mutation_no"),
        "mutation_date":    str(record.get("mutation_date", "")),
        "transaction_type": record.get("transaction_type"),
        "doc_sha256":       record.get("doc_sha256"),
        "verifier_id":      verifier_id,
    }
    canonical = json.dumps(payload, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    digest = hashlib.sha3_256(canonical.encode("utf-8")).digest()
    return "0x" + digest.hex()


async def anchor_record(record_id: str, record: dict, verifier_id: str) -> dict:
    """
    Anchors record hash to Polygon Amoy testnet.
    Returns: {tx_hash, block_number, record_hash, anchored_at}
    """
    if not settings.POLYGON_PRIVATE_KEY or not settings.CONTRACT_ADDRESS:
        log.warning("blockchain.skipped_no_config")
        return {"status": "skipped", "reason": "blockchain not configured"}

    try:
        w3 = _get_web3()
        account = w3.eth.account.from_key(settings.POLYGON_PRIVATE_KEY)
        contract = w3.eth.contract(
            address=Web3.to_checksum_address(settings.CONTRACT_ADDRESS),
            abi=RECORD_REGISTRY_ABI,
        )

        record_hash = compute_record_hash(record, verifier_id)
        hash_bytes32 = bytes.fromhex(record_hash[2:])   # strip "0x"

        nonce = w3.eth.get_transaction_count(account.address)
        tx = contract.functions.anchorRecord(record_id, hash_bytes32).build_transaction({
            "chainId":  settings.POLYGON_CHAIN_ID,
            "gas":      300000,
            "gasPrice": w3.eth.gas_price,
            "nonce":    nonce,
        })
        signed = account.sign_transaction(tx)
        raw_tx = getattr(signed, "raw_transaction", getattr(signed, "rawTransaction", None))
        tx_hash = w3.eth.send_raw_transaction(raw_tx)
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)

        log.info("blockchain.anchored", record_id=record_id, tx_hash=tx_hash.hex(),
                 block=receipt.blockNumber)
        return {
            "status":       "anchored",
            "tx_hash":      "0x" + tx_hash.hex(),
            "block_number": receipt.blockNumber,
            "record_hash":  record_hash,
            "anchored_at":  datetime.now(timezone.utc).isoformat(),
        }
    except Exception as e:
        log.error("blockchain.anchor_failed", record_id=record_id, error=str(e))
        raise


async def verify_record(record_id: str, current_record: dict, verifier_id: str) -> dict:
    """
    Recomputes current hash and compares with on-chain anchor.
    Returns: {status: VERIFIED|TAMPERED|NOT_ANCHORED, ...}
    """
    if not settings.POLYGON_PRIVATE_KEY or not settings.CONTRACT_ADDRESS:
        return {"status": "NOT_CONFIGURED"}

    try:
        w3 = _get_web3()
        contract = w3.eth.contract(
            address=Web3.to_checksum_address(settings.CONTRACT_ADDRESS),
            abi=RECORD_REGISTRY_ABI,
        )
        on_chain_hash_bytes, verifier_addr, timestamp = \
            contract.functions.getLatestAnchor(record_id).call()
        on_chain_hash = "0x" + on_chain_hash_bytes.hex()
        current_hash  = compute_record_hash(current_record, verifier_id)

        status = "VERIFIED" if current_hash == on_chain_hash else "TAMPERED"
        return {
            "status":         status,
            "on_chain_hash":  on_chain_hash,
            "current_hash":   current_hash,
            "verifier_addr":  verifier_addr,
            "anchored_at":    datetime.fromtimestamp(timestamp, tz=timezone.utc).isoformat(),
            "polygonscan_url": f"https://amoy.polygonscan.com/",
        }
    except ContractLogicError:
        return {"status": "NOT_ANCHORED"}
    except Exception as e:
        log.error("blockchain.verify_failed", record_id=record_id, error=str(e))
        raise
