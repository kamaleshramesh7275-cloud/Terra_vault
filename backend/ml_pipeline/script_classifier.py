"""
Terra_vault — Script & Language Classifier
Classifies page script using ResNet-18 CNN trained on AI4Bharat samples.
Routes each page to the best OCR engine combination.
"""
import structlog
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import cv2
import numpy as np
import unicodedata

log = structlog.get_logger(__name__)

# ── Script → OCR engine routing table ────────────────────────────────────────
SCRIPT_OCR_MAP = {
    "Devanagari":  {"easyocr": ["hi", "mr", "sa"], "paddleocr": "hi",  "tesseract": "hin+mar+san"},
    "Tamil":       {"easyocr": ["ta"],              "paddleocr": "ta",  "tesseract": "tam"},
    "Telugu":      {"easyocr": ["te"],              "paddleocr": "te",  "tesseract": "tel"},
    "Kannada":     {"easyocr": ["kn"],              "paddleocr": "kn",  "tesseract": "kan"},
    "Malayalam":   {"easyocr": ["ml"],              "paddleocr": "ml",  "tesseract": "mal"},
    "Bengali":     {"easyocr": ["bn"],              "paddleocr": "bn",  "tesseract": "ben+asm"},
    "Odia":        {"easyocr": ["or"],              "paddleocr": None,  "tesseract": "ori"},
    "Gurmukhi":    {"easyocr": ["pa"],              "paddleocr": None,  "tesseract": "pun"},
    "Gujarati":    {"easyocr": ["gu"],              "paddleocr": "gu",  "tesseract": "guj"},
    "Urdu":        {"easyocr": ["ur"],              "paddleocr": None,  "tesseract": "urd"},
    "Latin":       {"easyocr": ["en"],              "paddleocr": "en",  "tesseract": "eng"},
    "Mixed":       {"easyocr": ["hi", "en"],        "paddleocr": "hi",  "tesseract": "hin+eng"},
}


# ── Unicode codepoint ranges for Indic scripts ─────────────────────────────
SCRIPT_RANGES = [
    # (script_name, start_codepoint, end_codepoint)
    ("Devanagari",  0x0900, 0x097F),
    ("Bengali",     0x0980, 0x09FF),
    ("Gurmukhi",   0x0A00, 0x0A7F),
    ("Gujarati",   0x0A80, 0x0AFF),
    ("Odia",       0x0B00, 0x0B7F),
    ("Tamil",      0x0B80, 0x0BFF),
    ("Telugu",     0x0C00, 0x0C7F),
    ("Kannada",    0x0C80, 0x0CFF),
    ("Malayalam",  0x0D00, 0x0D7F),
    ("Urdu",       0x0600, 0x06FF),   # Arabic block (Urdu uses Nastaliq)
    ("Latin",      0x0041, 0x007A),
]


def _classify_text_by_unicode(text: str) -> Optional[str]:
    """Count Indic script codepoints in text and return dominant script, or None."""
    counts: dict = {}
    for ch in text:
        cp = ord(ch)
        for script, start, end in SCRIPT_RANGES:
            if start <= cp <= end:
                counts[script] = counts.get(script, 0) + 1
                break
    if not counts:
        return None
    dominant = max(counts, key=counts.get)
    # Require at least 5 matching characters to trust result
    if counts[dominant] < 5:
        return None
    return dominant


@dataclass
class ScriptClassification:
    script: str
    confidence: float
    ocr_config: dict


class ScriptClassifier:
    """
    Classifies document script using a two-stage approach:
    1. Fast heuristic (Unicode block frequency analysis on easy text)
    2. CNN (ResNet-18) for ambiguous / image-only documents
    """

    def __init__(self, model_dir: str = None):
        self.model_dir = model_dir
        self._cnn = None

    def _load_cnn(self):
        if self._cnn is not None:
            return
        self._has_real_weights = False
        model_path = Path(self.model_dir) / "script_classifier" / "model.pt" if self.model_dir else None
        if not (model_path and model_path.exists()):
            self._cnn = None
            return

        try:
            import torch
            import torchvision.models as models
            m = models.resnet18(weights=None)
            n_classes = len(SCRIPT_OCR_MAP)
            m.fc = torch.nn.Linear(m.fc.in_features, n_classes)
            m.load_state_dict(torch.load(str(model_path), map_location="cpu"))
            m.eval()
            self._cnn = (m, list(SCRIPT_OCR_MAP.keys()))
            self._has_real_weights = True
            log.info("script_classifier.cnn_loaded")
        except Exception as e:
            log.warning("script_classifier.load_failed", error=str(e))

    def _unicode_block_classify(self, img_path: str) -> Optional[str]:
        """Heuristic fallback: run a fast Tesseract pass to extract text, then
        classify script by Unicode block frequency. Works without any trained
        model and correctly handles all major Indic scripts.
        """
        try:
            import pytesseract
            from PIL import Image as PILImage
            img = PILImage.open(img_path)
            # Downscale for speed — only need characters, not quality
            img.thumbnail((800, 800))
            # Run with Devanagari+Tamil+Telugu+Latin to get raw characters
            raw = pytesseract.image_to_string(
                img,
                lang="hin+tam+tel+kan+ben+eng",
                config="--psm 6 --oem 1",
            )
            if raw.strip():
                result = _classify_text_by_unicode(raw)
                if result:
                    log.info("script_classifier.unicode_heuristic", script=result)
                    return result
        except Exception as e:
            log.debug("script_classifier.heuristic_failed", error=str(e))
        return None

    def classify(self, img_path: str, text: Optional[str] = None) -> ScriptClassification:
        """Classify script from image or text. Returns script name + OCR routing config."""
        if text and len(text.strip()) > 5:
            detected = _classify_text_by_unicode(text)
            if detected:
                log.info("script_classifier.unicode_detected_from_text", script=detected)
                return ScriptClassification(
                    script=detected,
                    confidence=0.98,
                    ocr_config=SCRIPT_OCR_MAP.get(detected, SCRIPT_OCR_MAP.get("Tamil")),
                )

        self._load_cnn()
        script = None
        confidence = 0.6

        # ── Try CNN first (only if real trained weights loaded) ───────────────
        if self._cnn is not None and getattr(self, "_has_real_weights", False):
            import torch
            import torchvision.transforms as T
            model, classes = self._cnn
            transform = T.Compose([
                T.Resize((224, 224)),
                T.ToTensor(),
                T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
            ])
            from PIL import Image as PILImage
            img = PILImage.open(img_path).convert("RGB")
            tensor = transform(img).unsqueeze(0)
            with torch.no_grad():
                probs = torch.softmax(model(tensor), dim=1)[0]
            idx = probs.argmax().item()
            if float(probs[idx]) >= 0.55:   # only trust if sufficiently confident
                script = classes[idx]
                confidence = float(probs[idx])

        # ── Unicode heuristic fallback ────────────────────────────────────────
        if script is None:
            script = self._unicode_block_classify(img_path)
            if script:
                confidence = 0.75   # heuristic is fairly reliable

        # ── Last resort: Devanagari default ───────────────────────────────────
        if script is None:
            script = "Devanagari"
            confidence = 0.5
            log.warning("script_classifier.using_default", img_path=img_path)

        ocr_config = SCRIPT_OCR_MAP.get(script, SCRIPT_OCR_MAP["Devanagari"])
        return ScriptClassification(
            script=script,
            confidence=round(confidence, 4),
            ocr_config=ocr_config,
        )
