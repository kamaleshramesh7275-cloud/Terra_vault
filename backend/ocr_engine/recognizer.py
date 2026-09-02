"""
Terra_vault — OCR Recognition Engine
Ensemble of EasyOCR + PaddleOCR + Tesseract 5 + TrOCR (handwriting)
Script-aware routing with confidence-based ensemble merging.
"""
import structlog
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional, Dict, Any

import cv2
import numpy as np

log = structlog.get_logger(__name__)


@dataclass
class OCRWord:
    text: str
    confidence: float
    bbox: List[int]   # [x, y, w, h]
    engine: str


@dataclass
class OCRResult:
    words: List[OCRWord]
    full_text: str
    avg_confidence: float
    engine_used: str


# ─────────────────────────────────────────────────────────────────────────────
# EasyOCR Engine
# ─────────────────────────────────────────────────────────────────────────────

class EasyOCREngine:
    _readers: Dict[str, Any] = {}

    def read(self, img_path: str, lang_list: List[str]) -> List[OCRWord]:
        key = "+".join(sorted(lang_list))
        if key not in self._readers:
            try:
                import easyocr
                self._readers[key] = easyocr.Reader(lang_list, gpu=False, verbose=False)
                log.info("easyocr.reader_loaded", langs=lang_list)
            except Exception as e:
                log.error("easyocr.load_failed", error=str(e))
                return []

        reader = self._readers[key]
        try:
            results = reader.readtext(img_path, detail=1, paragraph=False)
            words = []
            for (bbox_pts, text, conf) in results:
                # bbox_pts: [[x1,y1],[x2,y2],[x3,y3],[x4,y4]]
                xs = [p[0] for p in bbox_pts]
                ys = [p[1] for p in bbox_pts]
                bbox = [int(min(xs)), int(min(ys)), int(max(xs)-min(xs)), int(max(ys)-min(ys))]
                words.append(OCRWord(text=text.strip(), confidence=float(conf), bbox=bbox, engine="easyocr"))
            return words
        except Exception as e:
            log.error("easyocr.read_failed", error=str(e))
            return []


# ─────────────────────────────────────────────────────────────────────────────
# PaddleOCR Engine
# ─────────────────────────────────────────────────────────────────────────────

class PaddleOCREngine:
    _ocrs: Dict[str, Any] = {}

    def read(self, img_path: str, lang: str) -> List[OCRWord]:
        if lang not in self._ocrs:
            try:
                from paddleocr import PaddleOCR
                self._ocrs[lang] = PaddleOCR(use_angle_cls=True, lang=lang, show_log=False)
                log.info("paddleocr.loaded", lang=lang)
            except Exception as e:
                log.error("paddleocr.load_failed", error=str(e))
                return []

        ocr = self._ocrs[lang]
        try:
            result = ocr.ocr(img_path, cls=True)
            words = []
            if result and result[0]:
                for line in result[0]:
                    bbox_pts, (text, conf) = line
                    xs = [p[0] for p in bbox_pts]
                    ys = [p[1] for p in bbox_pts]
                    bbox = [int(min(xs)), int(min(ys)), int(max(xs)-min(xs)), int(max(ys)-min(ys))]
                    words.append(OCRWord(text=text.strip(), confidence=float(conf), bbox=bbox, engine="paddleocr"))
            return words
        except Exception as e:
            log.error("paddleocr.read_failed", error=str(e))
            return []


# ─────────────────────────────────────────────────────────────────────────────
# Tesseract 5 Engine
# ─────────────────────────────────────────────────────────────────────────────

class TesseractEngine:
    def read(self, img_path: str, lang: str) -> List[OCRWord]:
        try:
            import pytesseract
            from PIL import Image as PILImage
            img = PILImage.open(img_path)
            data = pytesseract.image_to_data(img, lang=lang, output_type=pytesseract.Output.DICT)
            words = []
            for i, text in enumerate(data["text"]):
                text = text.strip()
                if not text:
                    continue
                conf = float(data["conf"][i]) / 100.0
                if conf < 0:
                    continue
                bbox = [data["left"][i], data["top"][i], data["width"][i], data["height"][i]]
                words.append(OCRWord(text=text, confidence=conf, bbox=bbox, engine="tesseract"))
            return words
        except Exception as e:
            log.error("tesseract.read_failed", error=str(e))
            return []


# ─────────────────────────────────────────────────────────────────────────────
# TrOCR Engine (HuggingFace — handwriting specialist)
# ─────────────────────────────────────────────────────────────────────────────

class TrOCREngine:
    _processor = None
    _model = None

    def _load(self):
        if self._model is not None:
            return
        try:
            from transformers import TrOCRProcessor, VisionEncoderDecoderModel, RobertaTokenizer, ViTImageProcessor
            from transformers.models.trocr.modeling_trocr import TrOCRSinusoidalPositionalEmbedding
            from core.config import settings
            from pathlib import Path
            local_model_dir = Path(settings.ML_MODELS_DIR) / "trocr_land_deed"

            if (local_model_dir / "model.safetensors").exists():
                tok = RobertaTokenizer.from_pretrained(str(local_model_dir))
                img_proc = ViTImageProcessor.from_pretrained(str(local_model_dir))
                self._processor = TrOCRProcessor(image_processor=img_proc, tokenizer=tok)
                self._model = VisionEncoderDecoderModel.from_pretrained(str(local_model_dir))

                # Fix potential uninitialized meta tensor in sinusoidal positional embeddings
                dec = self._model.decoder.model.decoder
                if hasattr(dec, "embed_positions") and hasattr(dec.embed_positions, "weights") and dec.embed_positions.weights.is_meta:
                    cfg = self._model.decoder.config
                    dec.embed_positions.weights = TrOCRSinusoidalPositionalEmbedding.get_embedding(
                        cfg.max_position_embeddings, cfg.d_model, cfg.pad_token_id
                    )
                self._model.eval()
                log.info("trocr.loaded_custom_fine_tuned", dir=str(local_model_dir))
            else:
                self._processor = TrOCRProcessor.from_pretrained("microsoft/trocr-base-handwritten")
                self._model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-base-handwritten")
                self._model.eval()
                log.info("trocr.loaded_generic")
        except Exception as e:
            log.error("trocr.load_failed", error=str(e))

    def read_region(self, img_crop: np.ndarray) -> str:
        """Read a single cropped handwritten region."""
        self._load()
        if self._model is None:
            return ""
        try:
            import torch
            from PIL import Image as PILImage
            pil = PILImage.fromarray(cv2.cvtColor(img_crop, cv2.COLOR_BGR2RGB)).convert("RGB")
            pixel_values = self._processor(pil, return_tensors="pt").pixel_values
            with torch.no_grad():
                generated_ids = self._model.generate(pixel_values)
            return self._processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
        except Exception as e:
            log.error("trocr.inference_failed", error=str(e))
            return ""


# ─────────────────────────────────────────────────────────────────────────────
# Ensemble Merger
# ─────────────────────────────────────────────────────────────────────────────

def ensemble_merge(results_a: List[OCRWord], results_b: List[OCRWord]) -> List[OCRWord]:
    """
    Simple confidence-based ensemble: prefer higher-confidence token
    when two engines produce overlapping bounding boxes.
    Falls back to union if no overlap found.
    """
    if not results_a:
        return results_b
    if not results_b:
        return results_a

    merged = list(results_a)
    used_b = set()

    for i, wa in enumerate(merged):
        best_overlap = 0.0
        best_j = -1
        for j, wb in enumerate(results_b):
            if j in used_b:
                continue
            iou = _bbox_iou(wa.bbox, wb.bbox)
            if iou > 0.3 and iou > best_overlap:
                best_overlap = iou
                best_j = j
        if best_j >= 0:
            wb = results_b[best_j]
            used_b.add(best_j)
            if wb.confidence > wa.confidence:
                merged[i] = wb   # replace with higher-confidence result

    # Append non-overlapping results_b words
    for j, wb in enumerate(results_b):
        if j not in used_b:
            merged.append(wb)

    return merged


def _bbox_iou(a: List[int], b: List[int]) -> float:
    ax1, ay1, aw, ah = a
    bx1, by1, bw, bh = b
    ax2, ay2 = ax1 + aw, ay1 + ah
    bx2, by2 = bx1 + bw, by1 + bh
    ix1, iy1 = max(ax1, bx1), max(ay1, by1)
    ix2, iy2 = min(ax2, bx2), min(ay2, by2)
    iw, ih = max(0, ix2 - ix1), max(0, iy2 - iy1)
    inter = iw * ih
    union = aw * ah + bw * bh - inter
    return inter / union if union > 0 else 0.0


# ─────────────────────────────────────────────────────────────────────────────
# Main OCR Router
# ─────────────────────────────────────────────────────────────────────────────

class OCRRouter:
    """
    Routes images to the correct OCR engine(s) based on script classification,
    runs them, ensembles results, and returns a single OCRResult.
    """

    def __init__(self):
        self.easy = EasyOCREngine()
        self.paddle = PaddleOCREngine()
        self.tesseract = TesseractEngine()
        self.trocr = TrOCREngine()

    def recognize(self, img_path: str, ocr_config: dict, is_handwriting: bool = False) -> OCRResult:
        """
        Args:
            img_path: path to (enhanced) image
            ocr_config: from script_classifier SCRIPT_OCR_MAP
            is_handwriting: if True, route through TrOCR first
        """
        words: List[OCRWord] = []

        if is_handwriting:
            img = cv2.imread(img_path)
            trocr_text = self.trocr.read_region(img)
            if trocr_text:
                # Treat full TrOCR output as a single "word" block with medium confidence
                words = [OCRWord(text=trocr_text, confidence=0.7, bbox=[0, 0, 0, 0], engine="trocr")]

        # EasyOCR (primary for Indic)
        easy_langs = ocr_config.get("easyocr", ["en"])
        easy_words = self.easy.read(img_path, easy_langs)

        # PaddleOCR (secondary)
        paddle_lang = ocr_config.get("paddleocr")
        paddle_words = self.paddle.read(img_path, paddle_lang) if paddle_lang else []

        # Ensemble EasyOCR + PaddleOCR
        combined = ensemble_merge(easy_words, paddle_words)

        # If both fail, fall back to Tesseract
        if not combined:
            tess_lang = ocr_config.get("tesseract", "hin+eng")
            combined = self.tesseract.read(img_path, tess_lang)

        words = ensemble_merge(words, combined) if words else combined

        full_text = " ".join(w.text for w in words)
        avg_conf = float(np.mean([w.confidence for w in words])) if words else 0.0
        engines_used = list({w.engine for w in words})

        return OCRResult(
            words=words,
            full_text=full_text,
            avg_confidence=round(avg_conf, 4),
            engine_used="+".join(engines_used),
        )
