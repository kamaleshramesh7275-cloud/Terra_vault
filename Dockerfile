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

# Install system dependencies, Node.js, Nginx, Tesseract Indic OCR and OpenCV libs
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

# Install Python backend requirements
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r ./backend/requirements.txt
RUN python -m spacy download xx_ent_wiki_sm || true

# Copy Backend codebase
COPY backend/ ./backend/

# Copy built Next.js standalone frontend
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
