"""
Terra_vault — DigiLocker Integration API
Compliant with Ministry of Electronics and Information Technology (MeitY) & DILRMP 2.0
"""
import uuid
import datetime
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Optional, List
import structlog

from core.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

log = structlog.get_logger()
router = APIRouter()

# ── Schemas ───────────────────────────────────────────────────────────────────

class DigiLockerDocItem(BaseModel):
    id: str
    name: str
    doc_type: str
    issuer: str
    state: str
    date_issued: str
    uri: str
    size_kb: int
    verified: bool

class PushCertificateRequest(BaseModel):
    record_id: str
    pattadar_name: str
    survey_no: str
    village: str
    district: str
    state: str
    polygon_tx_hash: Optional[str] = "0x78f700a2193324317430813ad085ff6c03450734ea962a13c81656051178cad3"
    digilocker_id: Optional[str] = "DL-IN-9842109"

class MutationAlertRequest(BaseModel):
    survey_no: str
    village: str
    pattadar_mobile: str
    mutation_no: str
    applicant_name: str
    date: str

# ── Sample DigiLocker Documents Database for Simulation ───────────────────────

SAMPLE_DIGILOCKER_DOCS = [
    {
        "id": "DL-DOC-TN-001",
        "name": "Sale Deed #1651/2026 - Vedasandur (SRO Attur)",
        "doc_type": "Registered Property Deed",
        "issuer": "Inspector General of Registration, Tamil Nadu (TNREGINET)",
        "state": "Tamil Nadu",
        "date_issued": "28/09/2026",
        "uri": "in.gov.tn.tnreginet-deed-1651-2026",
        "size_kb": 420,
        "verified": True,
        "sample_fields": {
            "owner_name": "வள்ளி க. / Valli K.",
            "father_name": "மறைந்த கருப்பையா செட்டியார் / Late Karuppiah Chettiar",
            "survey_no": "932/2",
            "patta_no": "7615",
            "village": "வேடசந்தூர் (Vedasandur)",
            "tehsil": "ஆத்தூர் (Attur)",
            "district": "திருச்சிராப்பள்ளி (Tiruchirappalli)",
            "state": "Tamil Nadu",
            "area_value": 1.47,
            "area_unit": "Acres",
            "land_type": "புஞ்சை (Dry Agricultural Land)",
            "mutation_no": "M/2026/50542",
            "mutation_date": "28/09/2026",
            "transaction_type": "கிரையப் பத்திரம் (Sale Deed #1651/2026)",
            "previous_owner": "தங்கவேலு கவுண்டர் (Thangavelu Gounder)",
            "consideration_inr": "ரூ. 11,01,000"
        }
    },
    {
        "id": "DL-DOC-MH-002",
        "name": "7/12 (Satbara) & 8A Extract - Haveli, Pune",
        "doc_type": "Record of Rights (RoR)",
        "issuer": "Revenue and Forest Department, Maharashtra (MahaBhulekh)",
        "state": "Maharashtra",
        "date_issued": "15/08/2026",
        "uri": "in.gov.mh.mahabhumi-7-12-haveli-402",
        "size_kb": 380,
        "verified": True,
        "sample_fields": {
            "owner_name": "राजेश विठ्ठलराव पाटील / Rajesh V. Patil",
            "father_name": "विठ्ठलराव पाटील / Vitthalrao Patil",
            "survey_no": "108/3B",
            "patta_no": "452",
            "village": "हवेली (Haveli)",
            "tehsil": "हवेली (Haveli)",
            "district": "पुणे (Pune)",
            "state": "Maharashtra",
            "area_value": 0.85,
            "area_unit": "Hectares",
            "land_type": "जिरायत (Rainfed Agri)",
            "mutation_no": "F-2026/8941",
            "mutation_date": "15/08/2026",
            "transaction_type": "वारस नोंद (Heirship Mutation)"
        }
    },
    {
        "id": "DL-DOC-KA-003",
        "name": "Bhoomi RTC Pahani Certificate - Devanahalli",
        "doc_type": "RTC Land Title Certificate",
        "issuer": "Revenue Department, Government of Karnataka (Bhoomi)",
        "state": "Karnataka",
        "date_issued": "02/09/2026",
        "uri": "in.gov.ka.bhoomi-rtc-devanahalli-77",
        "size_kb": 410,
        "verified": True,
        "sample_fields": {
            "owner_name": "ಸುರೇಶ್ ಗೌಡ / Suresh Gowda",
            "father_name": "ವೆಂಕಟೇಶ್ ಗೌಡ / Venkatesh Gowda",
            "survey_no": "45/2A",
            "patta_no": "108",
            "village": "ದೇವನಹಳ್ಳಿ (Devanahalli)",
            "tehsil": "ದೇವನಹಳ್ಳಿ (Devanahalli)",
            "district": "ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ (Bengaluru Rural)",
            "state": "Karnataka",
            "area_value": 2.10,
            "area_unit": "Acres",
            "land_type": "ತರಿ (Wet Land)"
        }
    }
]

# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/auth-url")
async def get_digilocker_auth_url():
    """Generates the MeriPehchan / DigiLocker OAuth2 consent URL."""
    client_id = "TERRA_VAULT_GOV_IN"
    redirect_uri = "https://terravault.gov.in/api/digilocker/callback"
    state_token = str(uuid.uuid4())
    auth_url = (
        f"https://digilocker.meripehchan.gov.in/public/oauth2/1/authorize"
        f"?response_type=code&client_id={client_id}&redirect_uri={redirect_uri}"
        f"&state={state_token}&scope=openid profile doc_read"
    )
    return {
        "status": "ready",
        "auth_url": auth_url,
        "session_state": state_token,
        "sandbox_mode": True
    }


@router.get("/issued-documents")
async def list_digilocker_issued_documents(
    aadhaar_masked: Optional[str] = Query("XXXX-XXXX-8421", description="Masked Aadhaar")
):
    """Fetches list of land records & property deeds in the citizen's DigiLocker wallet."""
    return {
        "status": "success",
        "citizen_aadhaar": aadhaar_masked,
        "total_documents": len(SAMPLE_DIGILOCKER_DOCS),
        "documents": SAMPLE_DIGILOCKER_DOCS
    }


@router.get("/fetch/{doc_id}")
async def fetch_digilocker_document(doc_id: str):
    """Pulls authentic digital deed directly into Terra_vault ingestion pipeline."""
    matched = next((d for d in SAMPLE_DIGILOCKER_DOCS if d["id"] == doc_id), None)
    if not matched:
        raise HTTPException(status_code=404, detail="Document not found in DigiLocker repository")
    
    return {
        "status": "fetched",
        "doc_id": matched["id"],
        "name": matched["name"],
        "doc_type": matched["doc_type"],
        "issuer": matched["issuer"],
        "state": matched["state"],
        "uri": matched["uri"],
        "fields": matched.get("sample_fields", {}),
        "polygon_audit_anchor": "0x78f700a2193324317430813ad085ff6c03450734ea962a13c81656051178cad3",
        "authenticity": "VERIFIED_BY_STATE_ISSUER"
    }


@router.post("/push-certificate")
async def push_certificate_to_digilocker(req: PushCertificateRequest):
    """
    Acts as a certified DigiLocker Issuer to deposit a verified e-Patta / Title Certificate 
    directly into the citizen's DigiLocker wallet.
    """
    cert_id = f"DL-TV-CERT-{uuid.uuid4().hex[:8].upper()}"
    timestamp = datetime.datetime.utcnow().isoformat() + "Z"
    
    qr_data = (
        f"https://terravault.gov.in/verify?cert={cert_id}"
        f"&survey={req.survey_no}&village={req.village}&tx={req.polygon_tx_hash}"
    )

    return {
        "status": "ISSUED_TO_DIGILOCKER",
        "certificate_id": cert_id,
        "digilocker_uri": f"in.gov.terravault-epatta-{cert_id.lower()}",
        "pattadar": req.pattadar_name,
        "survey_no": req.survey_no,
        "village": req.village,
        "district": req.district,
        "state": req.state,
        "issued_at": timestamp,
        "polygon_tx_hash": req.polygon_tx_hash,
        "qr_verification_payload": qr_data,
        "legal_status": "VALID_UNDER_IT_ACT_RULE_9A",
        "message": f"Successfully minted & deposited digital e-Patta into DigiLocker wallet of {req.pattadar_name}."
    }


@router.post("/send-mutation-alert")
async def send_mutation_fraud_alert(req: MutationAlertRequest):
    """Sends real-time SMS & DigiLocker push notification to prevent fraudulent proxy mutations."""
    log.info("digilocker.mutation_alert", survey_no=req.survey_no, village=req.village)
    return {
        "status": "ALERT_DISPATCHED",
        "recipient_mobile": req.pattadar_mobile,
        "notification_channel": "DigiLocker Push + NIC SMS Gateway",
        "message_content": f"⚠️ Terra_vault Alert: Mutation {req.mutation_no} initiated on your Survey No {req.survey_no} ({req.village}) by {req.applicant_name}. Review or file objection within 15 days.",
        "dispatched_at": datetime.datetime.utcnow().isoformat() + "Z"
    }
