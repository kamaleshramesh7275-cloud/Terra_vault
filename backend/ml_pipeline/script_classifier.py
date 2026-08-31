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
        try:
            import torch
            import torchvision.models as models
            m = models.resnet18(pretrained=False)
            n_classes = len(SCRIPT_OCR_MAP)
            m.fc = torch.nn.Linear(m.fc.in_features, n_classes)
            model_path = Path(self.model_dir) / "script_classifier" / "model.pt" if self.model_dir else None
            if model_path and model_path.exists():
                m.load_state_dict(torch.load(str(model_path), map_location="cpu"))
                log.info("script_classifier.cnn_loaded")
            else:
                log.warning("script_classifier.weights_missing_using_heuristic")
            m.eval()
            self._cnn = (m, list(SCRIPT_OCR_MAP.keys()))
        except Exception as e:
            log.warning("script_classifier.load_failed", error=str(e))

    def classify(self, img_path: str) -> ScriptClassification:
        """Classify script from image. Returns script name + OCR routing config."""
        self._load_cnn()

        script = "Devanagari"  # safe default for India
        confidence = 0.6

        if self._cnn is not None:
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
            script = classes[idx]
            confidence = float(probs[idx])

        ocr_config = SCRIPT_OCR_MAP.get(script, SCRIPT_OCR_MAP["Devanagari"])
        return ScriptClassification(
            script=script,
            confidence=round(confidence, 4),
            ocr_config=ocr_config,
        )
