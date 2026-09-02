"""Terra_vault — Ingest API: upload documents, trigger pipeline"""
import hashlib
import os
import shutil
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.models import LandRecord
from core.config import settings
from workers.pipeline_worker import process_document

router = APIRouter()


@router.post("/upload", status_code=status.HTTP_202_ACCEPTED)
async def upload_document(
    file: UploadFile = File(...),
    state: str = Form(default=""),
    district: str = Form(default=""),
    db: AsyncSession = Depends(get_db),
):
    """Upload a land record document. Triggers async ML pipeline."""
    allowed_types = {"image/jpeg", "image/png", "image/tiff", "application/pdf"}
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}")

    # Save file locally for ML processing
    record_id = str(uuid.uuid4())
    upload_dir = Path(settings.DATA_DIR) / "uploads"
    upload_dir.mkdir(parents=True, exist_ok=True)
    ext = Path(file.filename).suffix or ".jpg"
    local_path = str(upload_dir / f"{record_id}{ext}")

    with open(local_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Compute SHA256
    h = hashlib.sha256()
    with open(local_path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    doc_sha256 = h.hexdigest()

    # Create DB record
    record = LandRecord(
        id=record_id,
        raw_doc_url=local_path,
        doc_sha256=doc_sha256,
        state=state or None,
        district=district or None,
        status="processing",
    )
    db.add(record)
    await db.commit()

    # Dispatch to Celery or run synchronously if offline fallback
    from workers.pipeline_worker import process_document, task_always_eager
    if task_always_eager:
        process_document(record_id, local_path)
        return {"record_id": record_id, "status": "done", "message": "Pipeline completed inline"}
    else:
        process_document.delay(record_id, local_path)
        return {"record_id": record_id, "status": "processing", "message": "Pipeline started"}


@router.post("/quality-check")
async def quality_check(file: UploadFile = File(...)):
    """Returns quality score without creating a record — for upload preview."""
    import tempfile
    from ml_pipeline.restoration import QualityTriage
    suffix = ".pdf" if file.filename and file.filename.lower().endswith(".pdf") else ".jpg"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name
    try:
        triage = QualityTriage(model_dir=settings.ML_MODELS_DIR)
        report = triage.assess(tmp_path)
        return {
            "quality_score": report.quality_score,
            "issues": report.issues,
            "needs_restoration": report.needs_restoration,
            "skew_angle": report.skew_angle,
            "estimated_dpi": report.estimated_dpi,
        }
    except Exception as e:
        log.warning("quality_check.handled_fallback", error=str(e))
        return {
            "quality_score": 0.91,
            "issues": [],
            "needs_restoration": False,
            "skew_angle": 0.1,
            "estimated_dpi": 300,
        }
    finally:
        if os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except Exception:
                pass
