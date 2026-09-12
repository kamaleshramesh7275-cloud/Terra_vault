# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: Build Next.js Frontend
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps

COPY frontend/ ./
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: Unified Runtime (Python 3.11 + Node.js 20 + Nginx + OCR/ML)
# ─────────────────────────────────────────────────────────────────────────────
FROM python:3.11-slim

# ── System dependencies ───────────────────────────────────────────────────────
# Layer is cached until this block changes (rarely).
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gnupg \
    nginx \
    gettext-base \
    tesseract-ocr \
    tesseract-ocr-hin tesseract-ocr-mar tesseract-ocr-tam tesseract-ocr-tel \
    tesseract-ocr-kan tesseract-ocr-mal tesseract-ocr-ben tesseract-ocr-ori \
    tesseract-ocr-pan tesseract-ocr-guj tesseract-ocr-urd tesseract-ocr-san \
    tesseract-ocr-eng \
    libglib2.0-0 libgl1 libgomp1 \
    gcc g++ git \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Pip toolchain upgrade ─────────────────────────────────────────────────────
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# ── Python dependencies ───────────────────────────────────────────────────────
# IMPORTANT: Copy requirements.txt BEFORE copying source code.
# This layer is only invalidated when requirements.txt changes, NOT on every
# code push. This is the #1 trick to cut deploy time for code-only changes.
COPY backend/requirements.txt ./backend/

# Install PyTorch CPU first (large, separate index-url) then the rest
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r ./backend/requirements.txt && \
    python -m spacy download xx_ent_wiki_sm || true

# ── Pre-bake OCR model weights into the image ─────────────────────────────────
# These layers are also cached until requirements.txt changes.
# By downloading weights here (build time) rather than at runtime, we guarantee:
#   1. All engines are available instantly on Render (no cold-start downloads)
#   2. Render's ephemeral filesystem limitation is bypassed completely
#   3. No network calls are needed at inference time

# 1. EasyOCR — Indic + English language model weights
#    Downloads to /root/.EasyOCR/ inside the image layer
RUN python -c "\
import easyocr; \
print('Pre-downloading EasyOCR weights...'); \
easyocr.Reader(['en'], gpu=False, verbose=False); \
easyocr.Reader(['en', 'hi'], gpu=False, verbose=False); \
easyocr.Reader(['en', 'ta'], gpu=False, verbose=False); \
easyocr.Reader(['en', 'te'], gpu=False, verbose=False); \
easyocr.Reader(['en', 'kn'], gpu=False, verbose=False); \
easyocr.Reader(['en', 'ml'], gpu=False, verbose=False); \
print('EasyOCR weights ready.')" || echo "[WARN] EasyOCR pre-download failed — will retry at runtime"

# 2. PaddleOCR — detection + recognition models (en + hi)
#    Downloads to /root/.paddleocr/ inside the image layer
RUN python -c "\
from paddleocr import PaddleOCR; \
print('Pre-downloading PaddleOCR weights...'); \
PaddleOCR(use_angle_cls=True, lang='en', show_log=False); \
PaddleOCR(use_angle_cls=True, lang='hi', show_log=False); \
print('PaddleOCR weights ready.')" || echo "[WARN] PaddleOCR pre-download failed — EasyOCR+Tesseract will be used as fallback"

# 3. TrOCR (HuggingFace) — microsoft/trocr-base-handwritten (~450 MB)
#    No fine-tuned model available; generic handwritten model is used.
#    Downloads to /root/.cache/huggingface/ inside the image layer.
#    recognizer.py uses local_files_only=True so NO network calls happen at runtime.
RUN python -c "\
from transformers import TrOCRProcessor, VisionEncoderDecoderModel; \
print('Pre-downloading TrOCR weights (microsoft/trocr-base-handwritten, ~450 MB)...'); \
TrOCRProcessor.from_pretrained('microsoft/trocr-base-handwritten'); \
VisionEncoderDecoderModel.from_pretrained('microsoft/trocr-base-handwritten'); \
print('TrOCR weights ready.')"

# ── Copy application source ───────────────────────────────────────────────────
# This COPY is intentionally AFTER all pip install + weight download layers.
# Changing source code only invalidates from here downward — pip/weights stay cached.
COPY backend/ ./backend/

# Copy built Next.js standalone output from Stage 1
COPY --from=frontend-builder /app/frontend/.next/standalone ./frontend/
COPY --from=frontend-builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=frontend-builder /app/frontend/public ./frontend/public

# Create required runtime data folders
RUN mkdir -p /app/data/uploads /app/data/enhanced /app/data/open_datasets /app/ml_models /app/backend/data

# Setup Nginx template and entrypoint
COPY scripts/nginx.conf.template /etc/nginx/nginx.conf.template
COPY scripts/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENV PORT=10000
EXPOSE 10000

CMD ["/bin/bash", "/app/entrypoint.sh"]
