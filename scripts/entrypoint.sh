#!/bin/bash
set -e

# Default PORT if not provided
PORT="${PORT:-10000}"

echo "================================================="
echo "   Starting Terra_vault Unified Service          "
echo "   Port: ${PORT}                                 "
echo "================================================="

# Generate nginx configuration from template
envsubst '${PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# ── 0. OCR Engine Health Check ────────────────────────────────────────────────
# Weights are pre-baked into the Docker image (downloaded at build time).
# This step only verifies imports succeed — no network calls are made here.
echo "0. Verifying OCR engine availability (weights pre-baked in image)..."
cd /app/backend
python -c "
import sys
errors = []

# Check EasyOCR
try:
    import easyocr
    print('  [OK] EasyOCR import successful')
except Exception as e:
    errors.append(f'EasyOCR: {e}')
    print(f'  [WARN] EasyOCR import failed: {e}')

# Check PaddleOCR
try:
    from paddleocr import PaddleOCR
    print('  [OK] PaddleOCR import successful')
except Exception as e:
    errors.append(f'PaddleOCR: {e}')
    print(f'  [WARN] PaddleOCR import failed: {e}')

# Check TrOCR — must be local_files_only (weights baked into image at build time)
try:
    from transformers import TrOCRProcessor, VisionEncoderDecoderModel
    TrOCRProcessor.from_pretrained('microsoft/trocr-base-handwritten', local_files_only=True)
    print('  [OK] TrOCR weights found in image cache')
except Exception as e:
    errors.append(f'TrOCR: {e}')
    print(f'  [WARN] TrOCR cache miss: {e}')

# Check Tesseract (always available via apt install)
try:
    import pytesseract
    version = pytesseract.get_tesseract_version()
    print(f'  [OK] Tesseract {version} ready')
except Exception as e:
    errors.append(f'Tesseract: {e}')
    print(f'  [WARN] Tesseract check failed: {e}')

# Summary
if errors:
    print(f'')
    print(f'  [WARN] {len(errors)} OCR engine(s) degraded — Tesseract will be used as fallback')
    for err in errors:
        print(f'    - {err}')
else:
    print('  [OK] All 4 OCR engines (EasyOCR, PaddleOCR, TrOCR, Tesseract) are ready')
" || echo "[WARN] OCR health check script failed — continuing startup (non-fatal)"

# ── 1. Start FastAPI backend ───────────────────────────────────────────────────
echo "1. Starting FastAPI Backend on 127.0.0.1:8000..."
cd /app/backend
PYTHONUNBUFFERED=1 uvicorn main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# ── 2. Start Next.js frontend ──────────────────────────────────────────────────
echo "2. Starting Next.js Frontend on 127.0.0.1:3000..."
cd /app/frontend
PORT=3000 HOSTNAME=0.0.0.0 node server.js &
FRONTEND_PID=$!

# ── 3. Wait for both services to be ready ─────────────────────────────────────
echo "3. Waiting for services to initialize..."
for i in $(seq 1 45); do
  BACKEND_UP=0
  FRONTEND_UP=0
  
  if curl -s -f http://127.0.0.1:8000/health > /dev/null 2>&1; then
    BACKEND_UP=1
  fi
  
  if curl -s -f http://127.0.0.1:3000 > /dev/null 2>&1; then
    FRONTEND_UP=1
  fi

  if [ $BACKEND_UP -eq 1 ] && [ $FRONTEND_UP -eq 1 ]; then
    echo "✓ Both FastAPI Backend (8000) and Next.js Frontend (3000) are READY!"
    break
  fi

  echo "  Waiting for services to warm up... ($i/45s) [Backend: $BACKEND_UP, Frontend: $FRONTEND_UP]"
  sleep 1
done

# ── 4. Start Nginx in foreground (keeps container alive) ──────────────────────
echo "4. Starting Nginx Reverse Proxy on 0.0.0.0:${PORT}..."
exec nginx -g "daemon off;"
