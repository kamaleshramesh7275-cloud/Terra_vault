"""
Terra_vault — Self-Learning AI Engine & Continuous Fine-Tuning Worker
Feeds human reviewer corrections into active training datasets and manages model weight fine-tuning.
"""
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
import json


from dataclasses import dataclass, asdict
from datetime import datetime, timezone
import hashlib
from pathlib import Path
from typing import Dict, List, Optional
import json
from core.config import settings


@dataclass
class SelfLearningSample:
    sample_id: str
    field_name: str
    original_ocr_value: str
    human_corrected_value: str
    is_inpainted_region: bool
    confidence_delta: float
    dedup_hash: str             # SHA-256 dedup hash
    sample_weight: float        # Weighted sample (high-conf corrections = ×2.0)
    timestamp: str

    def to_dict(self) -> dict:
        return asdict(self)


class SelfLearningEngine:
    """Self-learning AI engine that updates model training datasets on every human correction.
    Fine-tuned: SHA-256 deduplication, Hugging Face dataset export (80/10/10), env-configurable retrain threshold.
    """

    def __init__(self, data_dir: str = "/app/data"):
        self.base_dir = Path(data_dir) / "self_learning"
        self.base_dir.mkdir(parents=True, exist_ok=True)
        self.dataset_file = self.base_dir / "self_learning_samples.jsonl"

    def _compute_dedup_hash(self, field_name: str, original_ocr: str, human_corrected: str) -> str:
        """Compute SHA-256 hash for sample deduplication."""
        raw = f"{field_name}:{original_ocr.strip().lower()}:{human_corrected.strip().lower()}"
        return hashlib.sha256(raw.encode()).hexdigest()

    def record_learning_pair(self, field_name: str, original_ocr: str,
                             human_corrected: str, is_inpainted: bool = False) -> SelfLearningSample:
        """Records a human correction pair to the self-learning model dataset with SHA-256 deduplication."""
        dedup_h = self._compute_dedup_hash(field_name, original_ocr, human_corrected)

        # SHA-256 Deduplication check
        if self.dataset_file.exists():
            with open(self.dataset_file, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip():
                        try:
                            data = json.loads(line)
                            if data.get("dedup_hash") == dedup_h:
                                # Duplicate found — return existing sample representation
                                return SelfLearningSample(
                                    sample_id=data.get("sample_id", f"sl_dup_{dedup_h[:8]}"),
                                    field_name=data.get("field_name", field_name),
                                    original_ocr_value=data.get("original_ocr_value", original_ocr),
                                    human_corrected_value=data.get("human_corrected_value", human_corrected),
                                    is_inpainted_region=data.get("is_inpainted_region", is_inpainted),
                                    confidence_delta=data.get("confidence_delta", 0.08),
                                    dedup_hash=dedup_h,
                                    sample_weight=data.get("sample_weight", 1.0),
                                    timestamp=data.get("timestamp", datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")),
                                )
                        except Exception:
                            pass

        now = datetime.now(timezone.utc)
        sample_id = f"sl_{int(now.timestamp() * 1000)}"
        weight = settings.SELF_LEARNING_HIGH_CONF_WEIGHT if is_inpainted else 1.0

        sample = SelfLearningSample(
            sample_id=sample_id,
            field_name=str(field_name),
            original_ocr_value=str(original_ocr),
            human_corrected_value=str(human_corrected),
            is_inpainted_region=is_inpainted,
            confidence_delta=0.15 if is_inpainted else 0.08,
            dedup_hash=dedup_h,
            sample_weight=weight,
            timestamp=now.strftime("%Y-%m-%d %H:%M UTC")
        )

        with open(self.dataset_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(sample.to_dict()) + "\n")

        return sample

    def trigger_model_retrain_check(self) -> Dict:
        """Checks if enough self-learning samples have accumulated to trigger automated fine-tuning."""
        if not self.dataset_file.exists():
            return {"total_samples": 0, "status": "accumulating", "recommended_action": "none"}

        count = 0
        inpainted_count = 0
        with open(self.dataset_file, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    count += 1
                    try:
                        data = json.loads(line)
                        if data.get("is_inpainted_region"):
                            inpainted_count += 1
                    except Exception:
                        pass

        # Environment-configurable threshold
        env = settings.ENVIRONMENT.lower()
        if "prod" in env:
            threshold = settings.SELF_LEARNING_RETRAIN_THRESHOLD_PROD
        elif "stag" in env:
            threshold = settings.SELF_LEARNING_RETRAIN_THRESHOLD_STAGING
        else:
            threshold = settings.SELF_LEARNING_RETRAIN_THRESHOLD_DEV

        ready = count >= threshold
        return {
            "total_samples": count,
            "inpainted_samples": inpainted_count,
            "threshold_required": threshold,
            "ready_for_fine_tuning": ready,
            "status": "READY_FOR_RETRAINING" if ready else "accumulating_samples",
            "last_checked": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
        }

    def export_huggingface_dataset(self) -> Dict[str, List[Dict]]:
        """Exports collected self-learning samples in Hugging Face dataset format with train/val/test splits."""
        samples = []
        if self.dataset_file.exists():
            with open(self.dataset_file, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip():
                        try:
                            samples.append(json.loads(line))
                        except Exception:
                            pass

        n = len(samples)
        train_idx = int(n * settings.SELF_LEARNING_HF_TRAIN_SPLIT)
        val_idx = train_idx + int(n * settings.SELF_LEARNING_HF_VAL_SPLIT)

        return {
            "train": samples[:train_idx],
            "validation": samples[train_idx:val_idx],
            "test": samples[val_idx:],
        }
