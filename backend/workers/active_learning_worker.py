"""Terra_vault — Active Learning Worker: exports corrections to Label Studio format and triggers retraining."""
import json
import logging
from datetime import datetime, timedelta
from pathlib import Path

from celery import shared_task
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from core.config import settings

log = logging.getLogger(__name__)


@shared_task(name="workers.active_learning_worker.export_corrections")
def export_corrections():
    """Export reviewer corrections to Label Studio JSONL for retraining."""
    engine = create_engine(settings.SYNC_DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    try:
        since = datetime.utcnow() - timedelta(days=7)
        rows = session.execute(text("""
            SELECT fc.record_id, fc.field_name, fc.raw_ocr_value, fc.corrected_value,
                   fc.correction_reason, lr.enhanced_doc_url, lr.detected_script
            FROM field_confidence fc
            JOIN land_records lr ON lr.id = fc.record_id
            WHERE fc.is_corrected = TRUE AND fc.corrected_at > :since
        """), {"since": since}).fetchall()

        output_path = Path(settings.DATA_DIR) / "label_studio" / f"corrections_{datetime.utcnow().date()}.jsonl"
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, "w", encoding="utf-8") as f:
            for row in rows:
                record = {
                    "id": str(row.record_id),
                    "data": {
                        "image": row.enhanced_doc_url,
                        "script": row.detected_script,
                    },
                    "annotations": [{
                        "result": [{
                            "type": "textarea",
                            "value": {
                                "field": row.field_name,
                                "text": [row.corrected_value],
                                "original": row.raw_ocr_value,
                                "reason": row.correction_reason,
                            }
                        }]
                    }]
                }
                f.write(json.dumps(record, ensure_ascii=False) + "\n")

        log.info("active_learning.exported", corrections=len(rows), path=str(output_path))
        return {"exported": len(rows), "path": str(output_path)}
    finally:
        session.close()


@shared_task(name="workers.active_learning_worker.trigger_retraining")
def trigger_retraining(model_type: str = "all"):
    """
    Placeholder task that would invoke the model training scripts.
    In production, this launches a training job on GPU infrastructure.
    model_type: "ocr" | "ner" | "restoration" | "all"
    """
    log.info("active_learning.retraining_triggered", model_type=model_type)
    # In production: subprocess.run(["python", "ml_pipeline/training/train_ocr.py", ...])
    return {"status": "triggered", "model_type": model_type, "triggered_at": datetime.utcnow().isoformat()}
