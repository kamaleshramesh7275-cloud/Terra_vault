"""
Feature 1: OCR Confidence Heat-Map Generator
Assigns per-word confidence scores and generates color-coded heatmap JSON
for visual overlay on scanned land record document images.
Fine-tuned: per-field adaptive thresholds (critical fields 95%, standard 90%, amber 70%).
"""
from dataclasses import dataclass, asdict
from typing import List, Tuple
import random
from core.config import settings


@dataclass
class WordConfidenceBox:
    word: str
    bbox: dict          # {x, y, w, h} in pixels
    confidence: float   # 0.0 – 1.0
    color_hex: str      # green / amber / red
    label: str          # "HIGH" / "MODERATE" / "LOW"

    def to_dict(self) -> dict:
        return asdict(self)


# Fields that require stricter confidence for a green label
CRITICAL_FIELDS = {"khasra_no", "owner_name", "survey_no", "village", "registration_date"}


def _conf_to_color(conf: float, field_name: str = "") -> Tuple[str, str]:
    """Per-field adaptive color thresholding.
    Critical fields (khasra, owner) require 95%+ for green.
    Standard fields require 90%+.
    """
    is_critical = field_name.lower() in CRITICAL_FIELDS
    green_threshold = settings.OCR_CRITICAL_FIELD_CONF_THRESHOLD if is_critical else settings.OCR_STANDARD_FIELD_CONF_THRESHOLD
    amber_threshold = settings.OCR_HEATMAP_AMBER_THRESHOLD

    if conf >= green_threshold:
        return "#10b981", "HIGH"
    elif conf >= amber_threshold:
        return "#f59e0b", "MODERATE"
    else:
        return "#ef4444", "LOW"


class ConfidenceHeatmapGenerator:
    """Generates word-level OCR confidence heatmap for document image overlay."""

    def generate(self, ocr_words: List[dict]) -> List[WordConfidenceBox]:
        """
        Args:
            ocr_words: List of {word, bbox: {x,y,w,h}, confidence, field_name?} dicts from OCR engine.
        Returns:
            List of WordConfidenceBox with per-field color-coded confidence labels.
        """
        results = []
        for w in ocr_words:
            conf = float(w.get("confidence", 0.85))
            field_name = str(w.get("field_name", ""))
            color, label = _conf_to_color(conf, field_name)
            results.append(WordConfidenceBox(
                word=str(w.get("word", "")),
                bbox=w.get("bbox", {"x": 0, "y": 0, "w": 60, "h": 20}),
                confidence=round(conf, 3),
                color_hex=color,
                label=label,
            ))
        return results

    def generate_demo(self, image_width: int = 800, image_height: int = 1000) -> List[WordConfidenceBox]:
        """Generates a realistic 60-word demo heatmap for a Khasra 7-12 + Sale Deed layout."""
        random.seed(42)
        demo_words = [
            # Header block
            ("राज्य", 0.96, "header"), ("सरकार", 0.94, "header"), ("तमिलनाडु", 0.89, "header"),
            ("भूमि", 0.91, "header"), ("अभिलेख", 0.87, "header"), ("विभाग", 0.93, "header"),
            # Khasra fields (critical)
            ("खसरा", 0.98, "khasra_no"), ("नंबर", 0.97, "khasra_no"), ("104/A", 0.96, "khasra_no"),
            ("ग्राम", 0.88, "village"), ("Coimbatore", 0.94, "village"), ("तहसील", 0.85, "tehsil"),
            # Owner fields (critical)
            ("Owner:", 0.96, "owner_name"), ("Suresh", 0.93, "owner_name"), ("Kumar", 0.91, "owner_name"),
            ("S/O", 0.95, "owner_name"), ("Ram", 0.89, "owner_name"), ("Kumar", 0.88, "owner_name"),
            # Area fields
            ("क्षेत्रफल", 0.72, "area"), ("1.00", 0.68, "area"), ("हेक्टेयर", 0.61, "area"),
            ("4046", 0.75, "area"), ("sq.m", 0.80, "area"),
            # Mutation fields
            ("Mutation", 0.93, "mutation"), ("No:", 0.90, "mutation"), ("MUT-2024-1842", 0.87, "mutation"),
            # Date fields
            ("दिनांक", 0.55, "date"), ("Registration", 0.92, "registration_date"),
            ("14/05/2018", 0.96, "registration_date"), ("Mutation", 0.88, "mutation_date"),
            ("22/06/2018", 0.94, "mutation_date"),
            # Financial fields
            ("Stamp", 0.91, "stamp_duty"), ("Duty", 0.89, "stamp_duty"),
            ("₹", 0.84, "stamp_duty"), ("35,000", 0.62, "stamp_duty"),
            ("Sale", 0.88, "sale_consideration"), ("Consideration", 0.85, "sale_consideration"),
            ("₹", 0.91, "sale_consideration"), ("2,80,000", 0.79, "sale_consideration"),
            # Signature block
            ("Registrar", 0.90, "signature"), ("Signature", 0.48, "signature"),
            ("Sub-Registrar", 0.86, "signature"), ("Seal", 0.79, "seal"),
            # Legal text
            ("This", 0.93, "body"), ("deed", 0.91, "body"), ("executed", 0.88, "body"),
            ("between", 0.90, "body"), ("the", 0.94, "body"), ("parties", 0.89, "body"),
            ("hereinafter", 0.72, "body"), ("referred", 0.85, "body"), ("to", 0.96, "body"),
            ("as", 0.97, "body"), ("vendor", 0.91, "body"), ("and", 0.96, "body"),
            ("vendee", 0.83, "body"), ("respectively", 0.67, "body"),
        ]
        results = []
        x, y = 60, 80
        for word, conf, field in demo_words:
            w = len(word) * 9 + 10
            color, label = _conf_to_color(conf, field)
            results.append(WordConfidenceBox(
                word=word, bbox={"x": x, "y": y, "w": w, "h": 22},
                confidence=conf, color_hex=color, label=label,
            ))
            x += w + 12
            if x > image_width - 120:
                x = 60
                y += 40
        return results

    def summary(self, boxes: List[WordConfidenceBox]) -> dict:
        if not boxes:
            return {"total": 0, "high": 0, "moderate": 0, "low": 0, "avg_confidence": 0.0, "low_confidence_critical_fields": []}
        total = len(boxes)
        high = sum(1 for b in boxes if b.label == "HIGH")
        mod  = sum(1 for b in boxes if b.label == "MODERATE")
        low  = sum(1 for b in boxes if b.label == "LOW")
        avg  = round(sum(b.confidence for b in boxes) / total, 3)
        # List critical field words that have low confidence
        low_critical = [b.word for b in boxes if b.label == "LOW" and b.confidence < 0.70]
        return {
            "total": total, "high": high, "moderate": mod, "low": low,
            "avg_confidence": avg,
            "low_confidence_critical_fields": low_critical[:10],  # top 10 worst words
        }
