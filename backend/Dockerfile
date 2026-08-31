FROM python:3.11-slim

# System dependencies for OpenCV, Tesseract, and ML libs
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr \
    tesseract-ocr-hin tesseract-ocr-mar tesseract-ocr-tam tesseract-ocr-tel \
    tesseract-ocr-kan tesseract-ocr-mal tesseract-ocr-ben tesseract-ocr-ori \
    tesseract-ocr-pan tesseract-ocr-guj tesseract-ocr-urd tesseract-ocr-san \
    tesseract-ocr-eng \
    libglib2.0-0 libgl1 libgomp1 \
    gcc g++ curl git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download spaCy multilingual model
RUN python -m spacy download xx_ent_wiki_sm || true

COPY . .

# Create necessary directories
RUN mkdir -p /app/data/uploads /app/data/enhanced /app/data/open_datasets /app/ml_models

# Set default PORT environment variable
ENV PORT=8000

# Start Uvicorn bound to dynamic PORT
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 2"]
