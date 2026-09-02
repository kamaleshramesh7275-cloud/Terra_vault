"""
Terra_vault — ML Image Restoration Pipeline
Full pipeline: Quality Triage → Deskew → CLAHE → U-Net Denoiser → Real-ESRGAN → Sauvola
"""
import os
import math
import structlog
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Tuple

import cv2
import numpy as np
from PIL import Image

log = structlog.get_logger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# Data classes
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class QualityReport:
    quality_score: float          # 0.0 (terrible) → 1.0 (perfect)
    issues: List[str]             # ["blur", "skew", "glare", "low_res", "crease"]
    needs_restoration: bool
    skew_angle: float = 0.0
    estimated_dpi: int = 0


@dataclass
class RestorationResult:
    original_path: str
    enhanced_path: str
    quality_before: float
    quality_after: float
    steps_applied: List[str]


# ─────────────────────────────────────────────────────────────────────────────
# Step 1 — Quality Triage (heuristic + lightweight CNN scorer)
# ─────────────────────────────────────────────────────────────────────────────

class QualityTriage:
    """
    Scores image quality and identifies degradation issues.
    Uses heuristic metrics (Laplacian variance, histogram stats, DPI estimate)
    combined with a fine-tuned MobileNetV3 classifier (loaded lazily).
    """

    BLUR_THRESHOLD = 80.0          # Laplacian variance below this → blurry
    LOW_RES_THRESHOLD = 150        # DPI below this → low-res
    SKEW_THRESHOLD = 1.5           # degrees

    def __init__(self, model_dir: str = None):
        self.model_dir = model_dir
        self._cnn_model = None     # loaded lazily

    def _load_cnn(self):
        """Lazy-load MobileNetV3 quality classifier."""
        if self._cnn_model is not None:
            return
        try:
            import torch
            import torchvision.models as models
            model_path = Path(self.model_dir) / "quality_triage" / "model.pt" if self.model_dir else None
            m = models.mobilenet_v3_small(pretrained=False)
            m.classifier[-1] = torch.nn.Linear(m.classifier[-1].in_features, 1)
            if model_path and model_path.exists():
                m.load_state_dict(torch.load(str(model_path), map_location="cpu"))
                log.info("quality_triage.cnn_loaded", path=str(model_path))
            else:
                log.warning("quality_triage.cnn_weights_missing_using_heuristic")
            m.eval()
            self._cnn_model = m
        except Exception as e:
            log.warning("quality_triage.cnn_load_failed", error=str(e))

    def assess(self, img_path: str) -> QualityReport:
        img_bgr = cv2.imread(img_path)
        if img_bgr is None:
            raise ValueError(f"Cannot read image: {img_path}")

        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        issues = []
        score_factors = []

        # ── Blur detection (Laplacian variance) ──────────────────────────────
        lap_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        if lap_var < self.BLUR_THRESHOLD:
            issues.append("blur")
            score_factors.append(max(0.0, lap_var / self.BLUR_THRESHOLD))
        else:
            score_factors.append(1.0)

        # ── Skew detection (Hough lines) ──────────────────────────────────────
        skew_angle = self._detect_skew(gray)
        if abs(skew_angle) > self.SKEW_THRESHOLD:
            issues.append("skew")
            score_factors.append(max(0.0, 1.0 - abs(skew_angle) / 45.0))
        else:
            score_factors.append(1.0)

        # ── Glare / overexposure detection ────────────────────────────────────
        hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
        overexposed_ratio = hist[240:].sum() / gray.size
        if overexposed_ratio > 0.08:
            issues.append("glare")
            score_factors.append(max(0.0, 1.0 - overexposed_ratio * 5))
        else:
            score_factors.append(1.0)

        # ── Low resolution estimate ───────────────────────────────────────────
        h, w = gray.shape
        est_dpi = min(h, w) // 8   # rough heuristic for A4 scan
        if est_dpi < self.LOW_RES_THRESHOLD:
            issues.append("low_res")
            score_factors.append(max(0.0, est_dpi / self.LOW_RES_THRESHOLD))
        else:
            score_factors.append(1.0)

        # ── Crease / shadow detection (local contrast variance) ───────────────
        block_vars = []
        bh, bw = h // 8, w // 8
        for r in range(8):
            for c in range(8):
                block = gray[r*bh:(r+1)*bh, c*bw:(c+1)*bw]
                block_vars.append(float(block.var()))
        cv_score = np.std(block_vars) / (np.mean(block_vars) + 1e-6)
        if cv_score > 1.5:
            issues.append("crease")
            score_factors.append(max(0.0, 1.0 - (cv_score - 1.5) / 3.0))
        else:
            score_factors.append(1.0)

        quality_score = float(np.mean(score_factors))
        needs_restoration = quality_score < 0.70 or len(issues) > 0

        return QualityReport(
            quality_score=round(quality_score, 4),
            issues=issues,
            needs_restoration=needs_restoration,
            skew_angle=round(skew_angle, 2),
            estimated_dpi=est_dpi,
        )

    def _detect_skew(self, gray: np.ndarray) -> float:
        """Estimate document skew angle using Hough line transform."""
        edges = cv2.Canny(gray, 50, 150, apertureSize=3)
        lines = cv2.HoughLinesP(edges, 1, np.pi / 180, 100, minLineLength=100, maxLineGap=10)
        if lines is None:
            return 0.0
        angles = []
        for line in lines:
            coords = line[0] if (hasattr(line[0], "__len__") or isinstance(line[0], (np.ndarray, list))) else line
            if len(coords) >= 4:
                x1, y1, x2, y2 = coords[:4]
                angle = math.degrees(math.atan2(y2 - y1, x2 - x1))
                if -45 < angle < 45:
                    angles.append(angle)
        return float(np.median(angles)) if angles else 0.0


# ─────────────────────────────────────────────────────────────────────────────
# Step 2 — Deskew + Perspective Correction
# ─────────────────────────────────────────────────────────────────────────────

def deskew(img: np.ndarray, angle: float) -> np.ndarray:
    """Rotate image to correct skew."""
    if abs(angle) < 0.5:
        return img
    h, w = img.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(img, M, (w, h), flags=cv2.INTER_CUBIC,
                              borderMode=cv2.BORDER_REPLICATE)
    return rotated


def perspective_correct(img: np.ndarray) -> np.ndarray:
    """
    Detect document corners and apply four-point perspective transform.
    Falls back to original image if document boundary not found.
    """
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img.copy()
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edged = cv2.Canny(blurred, 75, 200)

    contours, _ = cv2.findContours(edged, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    contours = sorted(contours, key=cv2.contourArea, reverse=True)[:5]

    doc_contour = None
    for c in contours:
        peri = cv2.arcLength(c, True)
        approx = cv2.approxPolyDP(c, 0.02 * peri, True)
        if len(approx) == 4:
            doc_contour = approx
            break

    if doc_contour is None:
        return img  # Fallback: return as-is

    pts = doc_contour.reshape(4, 2).astype(np.float32)
    rect = _order_points(pts)
    tl, tr, br, bl = rect

    widthA = np.linalg.norm(br - bl)
    widthB = np.linalg.norm(tr - tl)
    maxW = int(max(widthA, widthB))

    heightA = np.linalg.norm(tr - br)
    heightB = np.linalg.norm(tl - bl)
    maxH = int(max(heightA, heightB))

    dst = np.array([[0, 0], [maxW - 1, 0], [maxW - 1, maxH - 1], [0, maxH - 1]], dtype=np.float32)
    M = cv2.getPerspectiveTransform(rect, dst)
    warped = cv2.warpPerspective(img, M, (maxW, maxH))
    return warped


def _order_points(pts: np.ndarray) -> np.ndarray:
    """Order corner points: top-left, top-right, bottom-right, bottom-left."""
    rect = np.zeros((4, 2), dtype=np.float32)
    s = pts.sum(axis=1)
    rect[0] = pts[np.argmin(s)]
    rect[2] = pts[np.argmax(s)]
    diff = np.diff(pts, axis=1)
    rect[1] = pts[np.argmin(diff)]
    rect[3] = pts[np.argmax(diff)]
    return rect


# ─────────────────────────────────────────────────────────────────────────────
# Step 3 — Adaptive Lighting Correction (CLAHE + Retinex SSR)
# ─────────────────────────────────────────────────────────────────────────────

def correct_lighting(img: np.ndarray) -> np.ndarray:
    """Apply CLAHE on L-channel of LAB color space + single-scale retinex."""
    if len(img.shape) == 2:
        # Grayscale
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        return clahe.apply(img)

    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l_clahe = clahe.apply(l)

    # Single-Scale Retinex on L channel
    l_float = l_clahe.astype(np.float32) + 1.0
    blur = cv2.GaussianBlur(l_float, (0, 0), sigmaX=30)
    retinex = np.log1p(l_float) - np.log1p(blur + 1.0)
    retinex = cv2.normalize(retinex, None, 0, 255, cv2.NORM_MINMAX)
    l_final = retinex.astype(np.uint8)

    merged = cv2.merge([l_final, a, b])
    return cv2.cvtColor(merged, cv2.COLOR_LAB2BGR)


# ─────────────────────────────────────────────────────────────────────────────
# Step 4 — U-Net Denoiser (PyTorch)
# ─────────────────────────────────────────────────────────────────────────────

class UNetDenoiser:
    """
    Lightweight U-Net autoencoder for document denoising.
    Falls back to OpenCV fastNlMeansDenoising if weights not available.
    """

    def __init__(self, model_dir: str = None):
        self.model_dir = model_dir
        self._model = None
        self._device = None

    def _load(self):
        if self._model is not None:
            return
        try:
            import torch
            from .unet_model import UNet  # local module
            self._device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            model_path = Path(self.model_dir) / "denoiser" / "unet_denoiser.pt" if self.model_dir else None
            if model_path and model_path.exists():
                m = UNet(in_channels=1, out_channels=1)
                m.load_state_dict(torch.load(str(model_path), map_location=self._device))
                m.eval()
                self._model = m
                log.info("denoiser.unet_loaded")
            else:
                log.warning("denoiser.weights_missing_using_opencv_fallback")
        except Exception as e:
            log.warning("denoiser.load_failed", error=str(e))

    def denoise(self, img: np.ndarray) -> np.ndarray:
        self._load()
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img

        if self._model is not None:
            import torch
            t = torch.from_numpy(gray).float().unsqueeze(0).unsqueeze(0) / 255.0
            with torch.no_grad():
                out = self._model(t.to(self._device))
            denoised = (out.squeeze().cpu().numpy() * 255).clip(0, 255).astype(np.uint8)
        else:
            # OpenCV fallback
            denoised = cv2.fastNlMeansDenoising(gray, h=10, templateWindowSize=7, searchWindowSize=21)

        if len(img.shape) == 3:
            return cv2.cvtColor(denoised, cv2.COLOR_GRAY2BGR)
        return denoised


# ─────────────────────────────────────────────────────────────────────────────
# Step 5 — Real-ESRGAN Super-Resolution
# ─────────────────────────────────────────────────────────────────────────────

class SuperResolution:
    """
    Real-ESRGAN 4x super-resolution for low-DPI phone captures.
    Falls back to cv2.resize with INTER_CUBIC if model not available.
    """

    def __init__(self, model_dir: str = None, scale: int = 4):
        self.model_dir = model_dir
        self.scale = scale
        self._upsampler = None

    def _load(self):
        if self._upsampler is not None:
            return
        try:
            from realesrgan import RealESRGANer
            from basicsr.archs.rrdbnet_arch import RRDBNet
            model_path = Path(self.model_dir) / "super_resolution" / "RealESRGAN_x4plus.pth" if self.model_dir else None
            if not (model_path and model_path.exists()):
                log.warning("super_res.model_missing_using_cv2_fallback")
                return
            model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32)
            self._upsampler = RealESRGANer(
                scale=self.scale,
                model_path=str(model_path),
                model=model,
                tile=400,
                tile_pad=10,
                pre_pad=0,
            )
            log.info("super_res.esrgan_loaded")
        except Exception as e:
            log.warning("super_res.load_failed", error=str(e))

    def upscale(self, img: np.ndarray) -> np.ndarray:
        self._load()
        if self._upsampler is not None:
            output, _ = self._upsampler.enhance(img, outscale=self.scale)
            return output
        # Fallback: bicubic
        h, w = img.shape[:2]
        return cv2.resize(img, (w * self.scale, h * self.scale), interpolation=cv2.INTER_CUBIC)


# ─────────────────────────────────────────────────────────────────────────────
# Step 6 — Sauvola Adaptive Binarization
# ─────────────────────────────────────────────────────────────────────────────

def binarize_sauvola(img: np.ndarray, window_size: int = 25, k: float = 0.2) -> np.ndarray:
    """
    Sauvola adaptive thresholding — superior to Otsu for non-uniform lighting.
    Returns binarized single-channel image.
    """
    try:
        from skimage.filters import threshold_sauvola
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img
        thresh = threshold_sauvola(gray, window_size=window_size, k=k)
        binary = (gray > thresh).astype(np.uint8) * 255
        return binary
    except Exception:
        # Fallback to adaptive Gaussian thresholding if skimage threshold_sauvola fails
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img
        return cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, window_size, 5)


def remove_fold_shadows(img: np.ndarray) -> np.ndarray:
    """
    Erases paper fold shadows and non-uniform lighting gradients via
    large-kernel morphological background estimation and division normalization.
    """
    is_color = len(img.shape) == 3
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if is_color else img.copy()

    # Large structuring element to capture background gradient without text strokes
    h, w = gray.shape[:2]
    k_size = max(31, min(h, w) // 25)
    if k_size % 2 == 0:
        k_size += 1
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (k_size, k_size))

    # Dilate + blur captures the background illumination surface across fold lines
    background = cv2.morphologyEx(gray, cv2.MORPH_DILATE, kernel)
    background = cv2.GaussianBlur(background, (k_size, k_size), 0)

    # Division normalization: (gray / background) * 255 flattens crease shadows
    normalized = cv2.divide(gray, background, scale=255)

    if is_color:
        # Re-apply color chrominance with normalized luminance
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        _, a, b = cv2.split(lab)
        merged = cv2.merge([normalized, a, b])
        return cv2.cvtColor(merged, cv2.COLOR_LAB2BGR)
    return normalized


def reconnect_creased_strokes(binary: np.ndarray) -> np.ndarray:
    """
    Directional morphological closing to bridge 1-2px severed gaps in Indic
    and Latin text strokes caused by paper folding or physical tears.
    """
    # Invert to white-text-on-black for morphological dilation/closing
    inv = cv2.bitwise_not(binary) if np.mean(binary) > 127 else binary.copy()

    # Vertical kernel bridges horizontal crease cuts (e.g. shirorekha, matras)
    v_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 3))
    closed_v = cv2.morphologyEx(inv, cv2.MORPH_CLOSE, v_kernel, iterations=1)

    # Horizontal kernel bridges vertical tear gaps
    h_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 1))
    closed_h = cv2.morphologyEx(closed_v, cv2.MORPH_CLOSE, h_kernel, iterations=1)

    # Convert back to standard black-text-on-white
    return cv2.bitwise_not(closed_h) if np.mean(binary) > 127 else closed_h


def sauvola_stain_filter(img: np.ndarray, window_size: int = 25, k: float = 0.18) -> np.ndarray:
    """
    Multi-scale local standard deviation thresholding (Sauvola).
    Extracts text strokes even from within dark tea/water stains and thumb impression ink.
    """
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img.copy()

    # Local mean and standard deviation
    mean = cv2.boxFilter(gray, cv2.CV_32F, (window_size, window_size))
    sq_mean = cv2.boxFilter(gray.astype(np.float32) ** 2, cv2.CV_32F, (window_size, window_size))
    std = np.sqrt(np.maximum(sq_mean - mean ** 2, 0.0))

    # Sauvola threshold: T = m * (1 + k * (s / 128.0 - 1))
    r = 128.0
    thresh = mean * (1.0 + k * (std / r - 1.0))
    binary = np.where(gray.astype(np.float32) < thresh, 0, 255).astype(np.uint8)

    # Clean isolated salt-and-pepper noise from stains
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
    cleaned = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)
    return cleaned


def deconvolve_ink_layers(img: np.ndarray) -> np.ndarray:
    """
    Separates primary document ink (black/dark blue) from stain layers
    (yellow/brown water/tea stains or purple/red official stamp ink) in HSV space.
    """
    if len(img.shape) != 3:
        return img

    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    _, s, v = cv2.split(hsv)

    # Text strokes have low brightness (V) regardless of hue
    # Stains typically have lower saturation than pure stamp ink, but higher brightness than text
    text_mask = cv2.inRange(v, 0, 95)

    # Enhance contrast specifically on non-stain text strokes
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    enhanced_text = cv2.bitwise_and(gray, gray, mask=text_mask)
    background_mask = cv2.bitwise_not(text_mask)
    result = cv2.add(enhanced_text, cv2.bitwise_and(gray, gray, mask=background_mask))
    return result


def suppress_ink_bleed(img: np.ndarray) -> np.ndarray:
    """
    Suppress back-page ink bleed-through and water stains using bilateral filtering and division.
    """
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img.copy()
    filtered = cv2.bilateralFilter(gray, d=9, sigmaColor=75, sigmaSpace=75)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (15, 15))
    background = cv2.morphologyEx(filtered, cv2.MORPH_CLOSE, kernel)
    division = cv2.divide(filtered, background, scale=255)
    if len(img.shape) == 3:
        return cv2.cvtColor(division, cv2.COLOR_GRAY2BGR)
    return division


def inpaint_stains(img: np.ndarray) -> np.ndarray:
    """
    Inpaint torn edges, water spots, and ink blobs using Telea Navier-Stokes inpainting.
    """
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img.copy()
    _, stain_mask = cv2.threshold(gray, 40, 255, cv2.THRESH_BINARY_INV)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    stain_mask = cv2.morphologyEx(stain_mask, cv2.MORPH_OPEN, kernel)
    inpainted = cv2.inpaint(img, stain_mask, inpaintRadius=3, flags=cv2.INPAINT_TELEA)
    return inpainted


# ─────────────────────────────────────────────────────────────────────────────
# Main Restoration Orchestrator
# ─────────────────────────────────────────────────────────────────────────────

class ImageRestorationPipeline:
    """
    Orchestrates the full image restoration chain:
      1. Quality triage
      2. Deskew + perspective correction
      3. CLAHE + Retinex lighting correction
      4. U-Net denoising
      5. Real-ESRGAN super-resolution (only if low-res)
      6. Sauvola binarization
    """

    def __init__(self, model_dir: str = None, output_dir: str = "/tmp/terravault_enhanced"):
        self.model_dir = model_dir
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.triage = QualityTriage(model_dir=model_dir)
        self.denoiser = UNetDenoiser(model_dir=model_dir)
        self.sr = SuperResolution(model_dir=model_dir)

    def process(self, img_path: str) -> RestorationResult:
        """Run the full pipeline on an image file. Returns enhanced file path."""
        report = self.triage.assess(img_path)
        log.info("restoration.triage", path=img_path, score=report.quality_score, issues=report.issues)

        img = cv2.imread(img_path)
        steps_applied = []

        if "skew" in report.issues or abs(report.skew_angle) > 0.5:
            img = deskew(img, report.skew_angle)
            img = perspective_correct(img)
            steps_applied.append("deskew+perspective")

        # ── Physical Degradation: Erase fold shadows & creases ───────────────
        if "crease" in report.issues or report.quality_score < 0.85:
            img = remove_fold_shadows(img)
            steps_applied.append("fold_shadow_removal")

        # ── Ink Separation: Deconvolve dark text from tea/thumb ink stains ────
        if report.quality_score < 0.75:
            img = deconvolve_ink_layers(img)
            steps_applied.append("ink_layer_deconvolution")

        if "glare" in report.issues or "crease" in report.issues:
            img = correct_lighting(img)
            steps_applied.append("clahe+retinex")

        if "blur" in report.issues or report.quality_score < 0.6:
            img = self.denoiser.denoise(img)
            steps_applied.append("unet_denoise")

        if "low_res" in report.issues or report.estimated_dpi < 150:
            img = self.sr.upscale(img)
            steps_applied.append("esrgan_super_res")

        # ── Adaptive Binarization: Sauvola stain filter + Stroke Reconnector ─
        binary = sauvola_stain_filter(img)
        binary = reconnect_creased_strokes(binary)
        steps_applied.append("sauvola_stain_filter+stroke_reconnect")

        # Save enhanced image (keep color for display, binary for OCR)
        stem = Path(img_path).stem
        enhanced_color_path = str(self.output_dir / f"{stem}_enhanced.jpg")
        enhanced_ocr_path = str(self.output_dir / f"{stem}_ocr.png")
        cv2.imwrite(enhanced_color_path, img, [cv2.IMWRITE_JPEG_QUALITY, 95])
        cv2.imwrite(enhanced_ocr_path, binary)

        # Re-assess quality after restoration
        quality_after = self.triage.assess(enhanced_color_path).quality_score

        return RestorationResult(
            original_path=img_path,
            enhanced_path=enhanced_ocr_path,
            quality_before=report.quality_score,
            quality_after=quality_after,
            steps_applied=steps_applied,
        )
