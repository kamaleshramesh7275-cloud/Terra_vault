# Terra_vault 🌿

**AI-powered Indian land record digitization platform** — an end-to-end pipeline that ingests scanned, handwritten, or phone-photographed land records; restores them with ML; extracts structured fields via multilingual OCR + NLP; validates against open-source datasets; routes uncertain records to human reviewers; anchors verified records to Polygon blockchain; and surfaces everything through a rich Next.js dashboard.

---

## 🏗 Architecture

```
Upload → ML Restoration → Script Classify → OCR Ensemble → NER Field Extract
       → Business Rules + OSS Cross-Validation → Graph Fraud Detection
       → Human Review Queue → Blockchain Anchor (Polygon Amoy)
       → GIS Sync (PostGIS) → Dashboard / Citizen Portal
```

---

## ✨ Key Features

| Feature | Details |
|---|---|
| **ML Image Restoration** | Quality triage → Deskew → CLAHE+Retinex → U-Net denoiser → Real-ESRGAN SR → Sauvola binarization |
| **Multilingual OCR** | EasyOCR + PaddleOCR + Tesseract 5 + TrOCR — 14 Indic scripts + English |
| **NLP Field Extraction** | spaCy NER + regex + LGD Directory lookup for 14 structured fields |
| **OSS Cross-Validation** | LGD Directory, Census 2011, Bhu-Naksha, OpenStreetMap India |
| **Graph Fraud Detection** | NetworkX + Neo4j — circular mutations, duplicate claims, orphaned mutations |
| **Blockchain Anchoring** | Polygon Amoy Testnet (free) — SHA3-256 hash, Solidity RecordRegistry contract |
| **Human Review Queue** | Confidence-scored, explainable flags, split-pane inline correction |
| **Active Learning Loop** | Label Studio exports → weekly retraining of OCR/NER/restoration models |
| **GIS Integration** | PostGIS + Leaflet choropleth — maturity scores by village/tehsil/district |
| **Citizen Portal** | Self-service lookup + blockchain verification + correction requests |

---

## 🛠 Tech Stack

### Backend
- **FastAPI** (Python 3.11) + Celery + Redis
- **OCR**: EasyOCR, PaddleOCR, Tesseract 5, TrOCR (HuggingFace)
- **ML**: PyTorch, OpenCV, Real-ESRGAN, U-Net denoiser, MobileNetV3
- **NLP**: spaCy 3, Indic NLP Library, IndicTrans2
- **DB**: PostgreSQL 15 + PostGIS, Elasticsearch, Neo4j
- **Storage**: MinIO (S3-compatible)
- **Blockchain**: web3.py → Polygon Amoy Testnet

### Frontend
- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** + custom CSS design system
- **Recharts** (charts), **Leaflet.js** (GIS map), **ethers.js** (blockchain)

---

## 🚀 Quick Start

### 1. Clone & configure environment
```bash
cd Terra_vault
cp .env.example .env
# Edit .env — fill in POLYGON_PRIVATE_KEY and CONTRACT_ADDRESS
```

### 2. Deploy smart contract (Polygon Amoy testnet)
```bash
# Get free test MATIC: https://faucet.polygon.technology
cd backend/blockchain/contracts
# Deploy RecordRegistry.sol with Remix IDE or Hardhat
# Paste deployed address into .env → CONTRACT_ADDRESS=0x...
```

### 3. Start all services with Docker
```bash
cd infrastructure
docker compose up -d
```

Services started:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **MinIO Console**: http://localhost:9001
- **Neo4j Browser**: http://localhost:7474

### 4. Download open-source datasets
```bash
# LGD Directory (village/tehsil/district codes)
# https://lgdirectory.gov.in → download CSVs → place in data/open_datasets/

# Census 2011 village directory
# https://censusindia.gov.in → Village list → data/open_datasets/census_villages.txt

# Bhu-Naksha GeoJSON (cadastral plots)
# https://bhunaksha.nic.in → Export GeoJSON → import via POST /api/gis/import-geojson
```

### 5. Download ML model weights
```bash
# Real-ESRGAN weights (super-resolution)
# https://github.com/xinntao/Real-ESRGAN/releases
# → download RealESRGAN_x4plus.pth → ml_models/super_resolution/

# TrOCR loads automatically from HuggingFace on first use
# EasyOCR, PaddleOCR models download automatically on first OCR call
```

### 6. (Optional) Local frontend dev
```bash
cd frontend
npm install
npm run dev   # → http://localhost:3000
```

---

## 📁 Project Structure

```
Terra_vault/
├── frontend/                    # Next.js 14 app (all 9 pages)
├── backend/
│   ├── main.py                  # FastAPI entrypoint
│   ├── api/                     # REST routers (ingest, records, review, gis, maturity, blockchain, auth)
│   ├── ml_pipeline/             # Quality triage, image restoration, script classifier
│   ├── ocr_engine/              # CRAFT detector, OCR router, spaCy NER field extractor
│   ├── validation/              # Business rules, OSS cross-validator, graph fraud detector
│   ├── blockchain/              # anchor.py, verify.py, RecordRegistry.sol
│   ├── workers/                 # Celery pipeline worker, active learning worker
│   └── core/                    # Config, DB engine, ORM models, MinIO/ES clients
├── ml_models/                   # Pre-trained & fine-tuned weight files (gitignored)
├── data/
│   ├── open_datasets/           # LGD, Census, common names (gitignored)
│   └── label_studio/            # Active learning correction exports
├── infrastructure/
│   ├── docker-compose.yml
│   └── nginx.conf
└── .env.example
```

---

## 🔗 Supported Indian Scripts

| Language | Script | OCR Engines |
|---|---|---|
| Hindi, Marathi | Devanagari | EasyOCR + PaddleOCR + Tesseract |
| Tamil | Tamil | EasyOCR + PaddleOCR + Tesseract |
| Telugu | Telugu | EasyOCR + PaddleOCR + Tesseract |
| Kannada | Kannada | EasyOCR + PaddleOCR + Tesseract |
| Malayalam | Malayalam | EasyOCR + PaddleOCR + Tesseract |
| Bengali | Bengali | EasyOCR + PaddleOCR + Tesseract |
| Odia | Odia | EasyOCR + Tesseract |
| Punjabi | Gurmukhi | EasyOCR + Tesseract |
| Gujarati | Gujarati | EasyOCR + PaddleOCR + Tesseract |
| Urdu | Nastaliq | EasyOCR + Tesseract |
| English | Latin | PaddleOCR + Tesseract + TrOCR |

---

## ⛓ Blockchain Details

- **Network**: Polygon Amoy Testnet (chain ID: 80002) — free test MATIC
- **Contract**: `RecordRegistry.sol` — stores `SHA3-256(fields + doc_sha256 + verifier + timestamp)`
- **Raw data** stays off-chain; only cryptographic hashes go on-chain
- **Tamper detection**: recompute hash from DB → compare with on-chain hash → `VERIFIED` or `TAMPERED`
- **Upgrade path**: same contract deploys to Polygon mainnet (~$0.001/tx, no code changes)
- **Explorer**: https://amoy.polygonscan.com

---

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest tests/ -v --cov=.

# Frontend
cd frontend
npm run build    # build check (no TypeScript errors)
npm run lint

# Smart contract
npx hardhat test   # (from backend/blockchain/)
```

---

## 📊 Maturity Score Formula

```
maturity_score = (
  0.40 × % records verified +
  0.30 × avg field confidence +
  0.15 × (1 − dispute rate) +
  0.15 × base
)
```
Computed nightly per village/tehsil/district. Admin priority queue shows lowest-scored areas first.

---

## 📄 License

MIT License — Terra_vault is open source.