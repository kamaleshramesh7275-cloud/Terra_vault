"""
Terra_vault — Celery Application + Full Ingestion Pipeline Worker
Orchestrates: Restoration → Script Classify → OCR → Field Extract → Validate → Fraud Check
"""
import asyncio
import hashlib
import structlog
import os
from pathlib import Path
from typing import List

from celery import Celery
from celery.schedules import crontab

from core.config import settings

log = structlog.get_logger(__name__)

# ── Celery app ────────────────────────────────────────────────────────────────
celery_app = Celery("terravault", broker=settings.REDIS_URL, backend=settings.REDIS_URL)

task_always_eager = False
try:
    import redis
    r = redis.Redis.from_url(settings.REDIS_URL, socket_connect_timeout=1)
    r.ping()
except Exception:
    print("[WARN] Redis is offline. Setting Celery task_always_eager = True to run pipeline inline.")
    task_always_eager = True

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_always_eager=task_always_eager,
    beat_schedule={
        # Nightly maturity score computation at 02:00 IST
        "compute-maturity-scores": {
            "task": "workers.pipeline_worker.compute_maturity_scores",
            "schedule": crontab(hour=2, minute=0),
        },
        # Weekly fraud scan
        "fraud-graph-scan": {
            "task": "workers.pipeline_worker.run_fraud_scan",
            "schedule": crontab(hour=3, minute=0, day_of_week=0),  # Monday 03:00
        },
        # Weekly active learning export
        "export-corrections-weekly": {
            "task": "workers.active_learning_worker.export_corrections",
            "schedule": crontab(hour=1, minute=0, day_of_week=0),  # Sunday 01:00 UTC
        },
    },
)

# Register active learning worker shared tasks
try:
    import workers.active_learning_worker  # noqa: F401
except ImportError:
    pass


# ── Helper: compute file SHA256 ───────────────────────────────────────────────
def _sha256_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


# ── Helper: convert PDF pages to image files ──────────────────────────────
def _pdf_to_images(pdf_path: str, output_dir: str, record_id: str) -> List[str]:
    """Convert each page of a PDF to a PNG file and return the list of paths.
    Uses PyMuPDF (fitz) if available for fast rendering, falling back to pdf2image.
    """
    try:
        import pymupdf
        doc = pymupdf.open(pdf_path)
        out = Path(output_dir)
        out.mkdir(parents=True, exist_ok=True)
        paths = []
        for i, page in enumerate(doc):
            pix = page.get_pixmap(dpi=200)
            img_path = str(out / f"{record_id}_page{i+1}.png")
            pix.save(img_path)
            paths.append(img_path)
        log.info("pdf_to_images.done_pymupdf", pages=len(paths), record_id=record_id)
        if paths:
            return paths
    except ImportError:
        pass
    except Exception as e:
        log.warning("pdf_to_images.pymupdf_failed", error=str(e), record_id=record_id)

    try:
        from pdf2image import convert_from_path  # requires poppler
        pages = convert_from_path(pdf_path, dpi=200, fmt="png")
        out = Path(output_dir)
        out.mkdir(parents=True, exist_ok=True)
        paths = []
        for i, page in enumerate(pages):
            img_path = str(out / f"{record_id}_page{i+1}.png")
            page.save(img_path, "PNG")
            paths.append(img_path)
        log.info("pdf_to_images.done_pdf2image", pages=len(paths), record_id=record_id)
        return paths
    except ImportError:
        log.warning("pdf_to_images.pdf2image_missing", record_id=record_id)
        return [pdf_path]
    except Exception as e:
        log.error("pdf_to_images.failed", error=str(e), record_id=record_id)
        return [pdf_path]


# ── Main pipeline task ────────────────────────────────────────────────────────
@celery_app.task(bind=True, name="workers.pipeline_worker.process_document",
                 max_retries=3, default_retry_delay=30)
def process_document(self, record_id: str, file_path: str):
    """
    Full pipeline for a single uploaded document:
      1. Image restoration
      2. Script classification
      3. OCR (EasyOCR / PaddleOCR / Tesseract / TrOCR)
      4. Field extraction (spaCy NER + regex)
      5. Business rule validation
      6. OSS cross-validation
      7. Graph fraud detection
      8. DB update + review queue routing
    """
    if self:
        orig_update = self.update_state
        def safe_update(state, meta=None):
            if self.request and self.request.id:
                return orig_update(state=state, meta=meta)
        self.update_state = safe_update

    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    from ml_pipeline.restoration import ImageRestorationPipeline
    from ml_pipeline.script_classifier import ScriptClassifier
    from ocr_engine.recognizer import OCRRouter
    from ocr_engine.field_extractor import FieldExtractor, parse_mutation_date
    from validation.rules_engine import RulesEngine, DatabaseValidator
    from core.models import LandRecord, FieldConfidence, ReviewTask
    from core.config import settings as cfg

    from core.database import sync_engine as engine
    Session = sessionmaker(bind=engine)
    session = Session()

    try:
        record = session.get(LandRecord, record_id)
        if not record:
            log.error("pipeline.record_not_found", record_id=record_id)
            return

        record.status = "processing"
        session.commit()

        # ── Step 1: Upload Gatekeeper Quality Triage & Inpainting ─────────────────────
        self.update_state(state="PROGRESS", meta={"step": "restoration", "pct": 10})
        from ml_pipeline.upload_gatekeeper import UploadGatekeeper
        from ml_pipeline.generative_inpainter import GenerativeInpainter

        # If PDF, render page 1 to image so OpenCV / restoration can process it
        eval_img_path = file_path
        if file_path.lower().endswith(".pdf"):
            pages_dir = str(Path(cfg.DATA_DIR) / "pages")
            pdf_imgs = _pdf_to_images(file_path, pages_dir, record_id)
            if pdf_imgs and pdf_imgs[0] != file_path:
                eval_img_path = pdf_imgs[0]

        gatekeeper = UploadGatekeeper()
        health_report = gatekeeper.assess_and_enhance(eval_img_path)

        inpainter = GenerativeInpainter()
        inpaint_report = inpainter.reconstruct_missing_parts(eval_img_path)

        pipeline = ImageRestorationPipeline(
            model_dir=cfg.ML_MODELS_DIR,
            output_dir=str(Path(cfg.DATA_DIR) / "enhanced"),
        )
        restoration_result = pipeline.process(inpaint_report.inpainted_path)
        record.quality_score = health_report.health_score / 100.0

        # Upload enhanced image to MinIO
        from core.minio_client import upload_file_sync
        enhanced_url = upload_file_sync(restoration_result.enhanced_path, f"enhanced/{record_id}.png")
        record.enhanced_doc_url = enhanced_url
        record.doc_sha256 = _sha256_file(file_path)
        session.commit()

        # ── Step 2: Script Classification ─────────────────────────────────────
        self.update_state(state="PROGRESS", meta={"step": "script_classify", "pct": 25})
        classifier = ScriptClassifier(model_dir=cfg.ML_MODELS_DIR)
        script_result = classifier.classify(restoration_result.enhanced_path)
        record.detected_script = script_result.script
        session.commit()

        # ── Step 3: Text Acquisition (Native PDF Stream + OCR Router) ─────────
        self.update_state(state="PROGRESS", meta={"step": "ocr", "pct": 45})
        
        full_text = ""
        words = []
        avg_conf = 0.0

        # If PDF, attempt native digital text extraction first
        if file_path.lower().endswith(".pdf"):
            try:
                import pypdf
                reader = pypdf.PdfReader(file_path)
                pdf_text_parts = []
                for p in reader.pages:
                    ptxt = p.extract_text() or ""
                    clean_ptxt = ptxt.replace("\x00", "")
                    if clean_ptxt.strip():
                        pdf_text_parts.append(clean_ptxt)
                if pdf_text_parts:
                    full_text = "\n\n".join(pdf_text_parts)
                    avg_conf = 0.96
                    record.page_count = len(reader.pages)
                    log.info("pipeline.pdf_native_text_extracted", pages=len(reader.pages), chars=len(full_text))
            except Exception as e:
                log.warning("pipeline.pdf_native_text_failed", error=str(e))

        # If not a PDF or if PDF has no digital text layer (scanned/raster), run OCR engines
        if not full_text or len(full_text.strip()) < 30:
            img_paths = [restoration_result.enhanced_path]
            if file_path.lower().endswith(".pdf"):
                img_paths = _pdf_to_images(restoration_result.enhanced_path, str(Path(cfg.DATA_DIR) / "pages"), record_id)

            router = OCRRouter()
            for img_path in img_paths:
                ocr_result = router.recognize(
                    img_path,
                    ocr_config=script_result.ocr_config,
                    is_handwriting=False,
                )
                full_text += ocr_result.full_text + "\n"
                words.extend(ocr_result.words)
                avg_conf = max(avg_conf, ocr_result.avg_confidence)

            record.page_count = len(img_paths)

        # ── Step 4: Field Extraction ──────────────────────────────────────────
        self.update_state(state="PROGRESS", meta={"step": "field_extraction", "pct": 65})
        extractor = FieldExtractor()
        fields = extractor.extract(full_text, avg_conf)

        # Write extracted fields to record
        record.owner_name       = fields.owner_name.value
        record.father_name      = fields.father_name.value
        record.khasra_no        = fields.khasra_no.value
        record.khata_no         = fields.khata_no.value or fields.patta_no.value
        record.patta_no         = fields.patta_no.value or fields.khata_no.value
        record.survey_no        = fields.survey_no.value
        record.survey_subdivision = fields.survey_no.value
        record.village          = fields.village.value
        record.tehsil           = fields.tehsil.value
        record.district         = fields.district.value
        record.state            = fields.state.value or record.state or "Tamil Nadu"
        record.village_lgd_code = fields.village_lgd_code.value
        record.area_value       = float(fields.area_value.value) if fields.area_value.value else None
        record.area_unit        = fields.area_unit.value
        record.land_type        = fields.land_type.value
        record.mutation_no      = fields.mutation_no.value
        # Parse mutation_date string → datetime to satisfy the DateTime column
        record.mutation_date    = parse_mutation_date(fields.mutation_date.value) if fields.mutation_date.value else None
        record.transaction_type = fields.transaction_type.value
        record.overall_confidence = fields.overall_confidence
        session.commit()

        # Save per-field confidence records (with bounding box when available)
        for fname in ["owner_name", "khasra_no", "khata_no", "survey_no",
                      "village", "tehsil", "district", "area_value",
                      "mutation_no", "mutation_date", "land_type", "transaction_type"]:
            ef = getattr(fields, fname)
            # Try to find the best-matching OCR word for bounding box
            bbox = None
            if ef.value and words:
                matched = [
                    w for w in words
                    if ef.value.lower() in w.text.lower() or w.text.lower() in ef.value.lower()
                ]
                if matched:
                    best = max(matched, key=lambda w: w.confidence)
                    bbox = best.bbox   # [x, y, w, h]
            fc = FieldConfidence(
                record_id=record_id,
                field_name=fname,
                raw_ocr_value=ef.value,
                confidence=ef.confidence,
                flags=ef.flags,
                bounding_box=bbox,
                is_corrected=False,
            )
            session.add(fc)
        session.commit()

        # ── Step 4b: Stamp & Ink Tamper Detection ─────────────────────────────
        try:
            from ocr_engine.stamp_detector import StampDetector
            from ocr_engine.ink_tampering_detector import InkTamperingDetector

            stamp_detector = StampDetector()
            tamper_detector = InkTamperingDetector()

            stamps = stamp_detector.detect(img_paths[0], state_code=(record.state or "TN")[:2].upper())
            tamper = tamper_detector.detect(img_paths[0])

            record.quality_issues = {
                "stamps": [s.to_dict() for s in stamps],
                "tamper": tamper.to_dict() if hasattr(tamper, "to_dict") else vars(tamper),
                "health_score": health_report.health_score if hasattr(health_report, "health_score") else None,
                "inpaint_steps": inpaint_report.steps_applied if hasattr(inpaint_report, "steps_applied") else [],
            }
            session.commit()
            log.info("pipeline.integrity_check_done",
                     record_id=record_id,
                     stamps=len(stamps),
                     tamper_risk=getattr(tamper, "risk_score", 0))
        except Exception as integrity_exc:
            log.warning("pipeline.integrity_check_failed", record_id=record_id, error=str(integrity_exc))
            # Non-fatal — don't block the pipeline

        # ── Step 5: Business Rule Validation ──────────────────────────────────
        self.update_state(state="PROGRESS", meta={"step": "validation", "pct": 78})
        rules = RulesEngine()
        fields_dict = {
            "owner_name": record.owner_name,
            "khasra_no": record.khasra_no,
            "village": record.village,
            "district": record.district,
            "area_value": str(record.area_value) if record.area_value else None,
            "area_unit": record.area_unit,
            "mutation_date": str(record.mutation_date) if record.mutation_date else None,
        }
        validation_report = rules.validate(fields_dict, state=record.state or "default")

        # ── Step 6: OSS Cross-Validation ──────────────────────────────────────
        db_validator = DatabaseValidator(data_dir=str(Path(cfg.DATA_DIR) / "open_datasets"))
        village_result = db_validator.validate_village(record.village or "")
        if not village_result["found"]:
            record.overall_confidence *= 0.90

        # ── Step 7: Review Queue Routing ──────────────────────────────────────
        self.update_state(state="PROGRESS", meta={"step": "review_routing", "pct": 90})
        needs_review = (
            record.overall_confidence < cfg.CONFIDENCE_THRESHOLD
            or not validation_report.is_valid
        )

        if needs_review:
            record.status = "review"
            priority = 1.0 - (record.overall_confidence or 0.5)
            flags = [{"field": i.field, "message": i.message, "severity": i.severity}
                     for i in validation_report.issues]
            task = ReviewTask(
                record_id=record_id,
                priority=priority,
                flags=flags,
                status="pending",
            )
            session.add(task)
        else:
            record.status = "verified"

        record.overall_confidence *= validation_report.confidence_adjustment
        session.commit()

        self.update_state(state="SUCCESS", meta={"step": "done", "pct": 100, "status": record.status})
        log.info("pipeline.complete", record_id=record_id, status=record.status,
                 confidence=record.overall_confidence)

    except Exception as exc:
        log.error("pipeline.failed", record_id=record_id, error=str(exc))
        if session:
            record = session.get(LandRecord, record_id)
            if record:
                record.status = "processing"  # will retry
                session.commit()
        raise self.retry(exc=exc)
    finally:
        session.close()


@celery_app.task(name="workers.pipeline_worker.compute_maturity_scores")
def compute_maturity_scores():
    """Nightly task: compute digitization maturity score per village/tehsil/district."""
    from sqlalchemy import create_engine, text
    from sqlalchemy.orm import sessionmaker
    from core.models import MaturityScore
    from core.config import settings as cfg
    from datetime import datetime

    from core.database import sync_engine as engine
    Session = sessionmaker(bind=engine)
    session = Session()
    try:
        rows = session.execute(text("""
            SELECT
                village AS geo_name, village_lgd_code AS lgd_code,
                COUNT(*) AS total,
                AVG(overall_confidence) AS avg_conf,
                SUM(CASE WHEN status='verified' THEN 1 ELSE 0 END)::float / COUNT(*) AS pct_verified,
                SUM(CASE WHEN status='disputed' THEN 1 ELSE 0 END)::float / COUNT(*) AS dispute_rate
            FROM land_records
            WHERE village IS NOT NULL
            GROUP BY village, village_lgd_code
        """)).fetchall()

        for row in rows:
            pct_v = float(row.pct_verified or 0)
            avg_c = float(row.avg_conf or 0)
            d_rate = float(row.dispute_rate or 0)
            score = round(0.40 * pct_v + 0.30 * avg_c + 0.15 * (1 - d_rate) + 0.15, 4)

            ms = MaturityScore(
                geo_level="village",
                geo_name=row.geo_name,
                lgd_code=row.lgd_code,
                pct_verified=pct_v,
                avg_confidence=avg_c,
                error_rate=0.0,
                dispute_rate=d_rate,
                maturity_score=score,
                total_records=row.total,
                computed_at=datetime.utcnow(),
            )
            session.add(ms)
        session.commit()
        log.info("maturity.computed", villages=len(rows))
    finally:
        session.close()


@celery_app.task(name="workers.pipeline_worker.run_fraud_scan")
def run_fraud_scan():
    """Weekly task: rebuild fraud graph from all records and detect patterns."""
    from sqlalchemy import create_engine, text
    from sqlalchemy.orm import sessionmaker
    from validation.graph_fraud_detector import FraudGraph
    from core.config import settings as cfg

    from core.database import sync_engine as engine
    Session = sessionmaker(bind=engine)
    session = Session()
    try:
        records = session.execute(text(
            "SELECT id, owner_name, khasra_no, village_lgd_code, village, mutation_no "
            "FROM land_records WHERE status IN ('verified', 'review')"
        )).fetchall()

        graph = FraudGraph()
        for r in records:
            graph.add_record({
                "id": str(r.id), "owner_name": r.owner_name,
                "khasra_no": r.khasra_no, "village_lgd_code": r.village_lgd_code,
                "village": r.village, "mutation_no": r.mutation_no,
            })

        alerts = graph.detect_fraud()
        from core.models import FraudAlert
        for alert in alerts:
            fa = FraudAlert(
                alert_type=alert.alert_type,
                severity=alert.severity,
                record_ids=alert.record_ids,
                description=alert.description,
                subgraph_nodes=alert.subgraph_nodes,
            )
            session.add(fa)
        session.commit()
        log.info("fraud_scan.complete", alerts=len(alerts), records=len(records))
        return {"alerts": len(alerts)}
    finally:
        session.close()
