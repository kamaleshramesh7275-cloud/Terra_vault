"""
Terra_vault — Active Learning Dataset Generator & Human-in-the-Loop Feedback Collector
Persists human reviewer corrections from /review into ground-truth datasets for automated OCR re-training.
"""
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
import json
import os


@dataclass
class ActiveLearningFeedback:
    task_id: str
    record_id: str
    field_name: str
    original_ocr_value: str
    corrected_value: str
    reviewer_id: str
    timestamp: str

    def to_dict(self) -> dict:
        return asdict(self)


class ActiveLearningManager:
    """Manages active learning dataset collection and export."""

    def __init__(self, data_dir: str = "/app/data"):
        self.dataset_dir = Path(data_dir) / "active_learning"
        self.dataset_dir.mkdir(parents=True, exist_ok=True)
        self.feedback_file = self.dataset_dir / "reviewer_corrections.jsonl"

    def record_feedback(self, task_id: str, record_id: str, field_name: str,
                        original_val: str, corrected_val: str, reviewer_id: str = "reviewer-1") -> ActiveLearningFeedback:
        """Persist a single field correction to the active learning dataset."""
        feedback = ActiveLearningFeedback(
            task_id=str(task_id),
            record_id=str(record_id),
            field_name=str(field_name),
            original_ocr_value=str(original_val),
            corrected_value=str(corrected_val),
            reviewer_id=str(reviewer_id),
            timestamp=datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
        )

        with open(self.feedback_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(feedback.to_dict()) + "\n")

        return feedback

    def get_dataset_stats(self) -> Dict:
        """Return dataset size and counts per field for active learning re-training."""
        if not self.feedback_file.exists():
            return {"total_samples": 0, "fields_breakdown": {}, "ready_for_retraining": False}

        count = 0
        breakdown = {}
        with open(self.feedback_file, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    count += 1
                    try:
                        data = json.loads(line)
                        f_name = data.get("field_name", "unknown")
                        breakdown[f_name] = breakdown.get(f_name, 0) + 1
                    except Exception:
                        pass

        return {
            "total_samples": count,
            "fields_breakdown": breakdown,
            "ready_for_retraining": count >= 10,
            "last_updated": datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
        }
