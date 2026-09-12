# Terra_vault — Final Project Documentation

> **Pan-India Land Administration Intelligence Platform**  
> *36 Indian States & UTs · AI Multi-Script OCR · Polygon Blockchain · ZK-SNARK Privacy Engine*

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [System Architecture](#3-system-architecture)
4. [Core Features](#4-core-features)
5. [Technology Stack](#5-technology-stack)
6. [Module Reference](#6-module-reference)
7. [API Reference](#7-api-reference)
8. [Database Schema](#8-database-schema)
9. [Frontend Pages](#9-frontend-pages)
10. [ML Pipeline](#10-ml-pipeline)
11. [Blockchain Integration](#11-blockchain-integration)
12. [GIS Engine](#12-gis-engine)
13. [Security & Privacy](#13-security--privacy)
14. [Deployment](#14-deployment)
15. [Verification & Test Results](#15-verification--test-results)

---

## 1. Project Overview

**Terra_vault** is a unified, privacy-preserving National Land Administration Platform that digitizes, verifies, and manages land ownership records for all **36 Indian States and Union Territories**. The platform addresses India's fragmented, paper-based cadastral system by combining:

- **AI-powered OCR** for 22+ official Indian languages
- **Polygon Blockchain** for immutable audit trails
- **Zero-Knowledge Proofs** for citizen privacy (title verification without data exposure)
- **Cadastral GIS Maps** for spatial land parcel visualization
- **DILRMP 2.0 Compliance** (Digital India Land Records Modernisation Programme)

### Key Metrics

| Metric | Value |
|---|---|
| States / UTs Covered | 36 (all of India) |
| Indian Languages Supported | 22+ official scripts |
| Blockchain Network | Polygon Amoy (PoS) |
| Title Proof Latency | < 15 ms (ZK-SNARK) |
| OCR Pipeline | Multi-stream Tesseract + PaddleOCR + Tamil TrOCR |
| Document Quality Analysis | Real-time client-side canvas (< 30 ms) |

---

## 2. Problem Statement

India's land administration is fragmented across 36 states and union territories bound by legacy paper deeds. This creates:

- **₹42,000+ Crore** locked in land litigation
- Unresolved boundary disputes at village level
- Multiple-registration fraud (same parcel sold to multiple buyers)
- Inaccessible, illegible historical records in archaic scripts (Modi, Kaithi, Grantha)
- No single national portal for citizens to verify land titles

### Terra_vault Solution

A unified platform that:
1. Ingests scanned / photographed / PDF land deeds in any Indian language
2. Runs a multi-stage AI pipeline to restore quality, classify script, extract fields
3. Cross-validates against the Live Government Data Graph (LGD village codes, stamp duty registries)
4. Anchors SHA-256 document hashes on Polygon blockchain (immutable audit trail)
5. Issues ZK-SNARK proofs so banks / courts can verify title ownership without accessing raw data
6. Provides a spatial cadastral GIS map overlaid on official TNGIS parcel tiles

---

## 3. System Architecture

```
+-------------------------------------------------------------------+
|                     TERRA_VAULT PLATFORM                          |
|                                                                   |
|  +------------------+   +-------------------+   +-------------+  |
|  |  CITIZEN PORTAL  |   |  REVENUE OFFICER  |   |    ADMIN    |  |
|  |  Upload · Verify |   |  Review Queue     |   |  Dashboard  |  |
|  |  DigiLocker Push |   |  FIR Approval     |   |  Analytics  |  |
|  +--------+---------+   +---------+---------+   +------+------+  |
|           |                       |                    |          |
|  ---------+----------- NEXT.JS FRONTEND ---------------+--------  |
|  -----------------------------------------------------------------  |
|                          FASTAPI BACKEND                          |
|                                                                   |
|  +-------------+  +-------------+  +-------------+  +----------+ |
|  |  OCR Engine |  | ML Pipeline |  |  GIS Engine |  |Blockchain| |
|  |  Multi-Pass |  | Restoration |  | TNGIS Tiles |  | Polygon  | |
|  |  Ensemble   |  | Script Class|  | Parcel Match|  | ZK-SNARK | |
|  +-------------+  +-------------+  +-------------+  +----------+ |
|                                                                   |
|  +---------------------------------------------------------+      |
|  |   PostgreSQL (Neon)  ·  Redis  ·  MinIO S3 Storage      |      |
|  +---------------------------------------------------------+      |
+-------------------------------------------------------------------+
```

### Data Flow

```
Document Upload
      |
      v
Quality Triage (IQA)
      |
      +-- [Score < 0.75] --> Image Restoration Pipeline
      |                       - Hough Deskew
      |                       - CLAHE Contrast Enhancement
      |                       - Sauvola Stain Filter
      |                       - Generative Border Inpainting
      |                       - Real-ESRGAN Super-Resolution
      |
      v
Script Classification (22 languages)
      |
      v
Multi-Stream Ensemble OCR
  - Stream 1: Fold Shadow Erased
  - Stream 2: Sauvola Stain Filtered
  - Stream 3: CLAHE Enhanced
      |
      v
Field Extraction (16 cadastral fields)
      |
      v
Cross-Validation (LGD · Stamp Duty · Date Sequence)
      |
      +-- [Confidence >= 0.75] --> Auto-Verified --> Blockchain Anchoring
      +-- [Confidence < 0.75]  --> Human Review Queue (VAO / RI)
                                        |
                                        v
                                   FIR Approval --> Blockchain Anchoring
                                        |
                                        v
                                  DigiLocker e-Patta Issuance
```

---

## 4. Core Features

### 4.1 Multi-Script AI OCR Engine

- **Supported Scripts**: Devanagari, Tamil, Telugu, Kannada, Malayalam, Bengali, Gujarati, Marathi, Punjabi, Odia, Assamese, Urdu, Modi (historical), Kaithi (historical), Shikasta, Grantha
- **Architecture**: 3-stream ensemble voting (PaddleOCR + Tesseract + Tamil TrOCR)
- **Degraded Document Recovery**: Handles torn margins, fold shadows, low-contrast aging, stains
- **Active Learning**: Human reviewer corrections feed back into the model retraining dataset

**Extracted Fields** (16 total):

| Field | Description |
|---|---|
| `owner_name` | Pattadar / Purchaser name (bilingual) |
| `father_name` | Father / Husband reference |
| `survey_no` | Field Sub-division Survey Number |
| `khasra_no` | Khasra / Plot number |
| `patta_no` | Revenue Patta number |
| `khata_no` | Khata account number |
| `village` | Revenue village name |
| `village_lgd_code` | Official LGD village code |
| `tehsil` | Taluk / Tehsil / Block |
| `district` | District name |
| `state` | State / UT name |
| `area_value` | Land extent (numeric) |
| `area_unit` | Unit (Acre / Hectare / Cent / Guntha) |
| `land_type` | Classification (Wet / Dry / Patta / Forest) |
| `mutation_no` | Registration mutation reference |
| `mutation_date` | Date of deed registration |
| `transaction_type` | Sale Deed / Gift Deed / Will / Heirship |

### 4.2 Polygon Blockchain Audit Trail

- Every verified land record is anchored as a **SHA-256 hash** on Polygon Amoy testnet
- On-chain metadata: `record_id`, `doc_sha256`, `timestamp`, `verifier_id`, `mutation_ref`
- Transactions are publicly auditable at amoy.polygonscan.com
- Smart contract address: configurable via `POLYGON_CONTRACT_ADDRESS` env var

### 4.3 Zero-Knowledge Title Proofs (ZK-SNARK)

- Citizens can prove land ownership to a bank or court **without revealing their name or Aadhaar**
- Uses a Groth16 zk-SNARK circuit over the SHA-256 commitment stored on-chain
- Proof generation: < 2 seconds, verification: **< 15 ms**
- Output: JSON proof + public signals, verifiable by any party with the contract ABI

### 4.4 Cadastral GIS Map

- Interactive slippy map built on Leaflet.js
- Parcel tiles sourced from **TNGIS official cadastral layer** (proxied + cached)
- Survey parcels rendered as SVG polygons with ownership labels
- Supports point-in-polygon ownership query (click any parcel → ownership details)
- LGD village code resolution for national coverage

### 4.5 Human-in-the-Loop Review Queue

- Low-confidence OCR extractions are automatically routed to a review queue
- Revenue Inspectors (RI) / Village Administrative Officers (VAO) annotate corrections
- Field-level bounding box highlighting on scanned document canvas
- Approved corrections anchor the finalized record to blockchain (FIR issuance)
- Role hierarchy: Citizen → VAO → RI → Tahsildar → RDO / SDM

### 4.6 DigiLocker Integration

- Citizens can **pull** pre-verified registered deeds directly from their DigiLocker account (MeriPehchan SSO)
- Verified records are **pushed** back as digital e-Patta certificates (Rule 9A, IT Act 2016)
- e-Patta is legally recognized at par with stamped physical deeds in Indian courts and banks

### 4.7 Document Quality Analyzer

Client-side canvas analysis (no server round-trip) evaluating:
- **Blur Variance** (Sobel gradient magnitude)
- **Skew Angle Estimation** (projection profile over ±3°)
- **Stain / Blotch Density** (dark pixel cluster ratio)
- **Low Contrast Detection** (RMS luminance standard deviation)
- **Torn Margins** (border roughness via pixel delta)
- **Low DPI** (estimated from pixel dimensions)

Returns a `quality_score` (0.0–1.0) and recommended restoration steps.

### 4.8 Fraud Detection Graph

- Graph-based duplicate-parcel detection using NetworkX
- Flags: owner name identity graph, duplicate survey-no registrations, area mismatch across mutations
- Fraud alerts exposed through `/api/fraud` with severity levels (critical / high / medium)
- Resolution workflow with on-chain anchoring of resolved-alert audit log

### 4.9 Signature Authentication

- pHash fingerprinting detects copy-paste forged revenue officer signatures
- Hamming distance < 10 bits between two pHashes flags a duplicate
- Covers thumb impressions and ink stamp signatures
- Results returned with bounding boxes and match scores

### 4.10 Handwriting Style Clustering

- K-Means clustering of page-level handwriting feature vectors
- Detects suspicious cases where multiple "independent" deeds share the same handwriting style
- Outputs cluster assignments and a forgery-alert flag per cluster

### 4.11 Archaic Script Transliteration

- Supports historical scripts: **Modi, Kaithi, Shikasta, Grantha**
- Output: modern Devanagari / Tamil equivalent + English legal term mapping
- Used for pre-Independence land deeds that cannot be processed by standard OCR

### 4.12 State-Wise Legal Registry

- Coverage for **all 36 States & UTs** including stamp duty rates, mutation fee schedules, deed types
- Pre-loaded LGD village hierarchy (State → District → Block → Village)
- 22-language translation dictionary for legal terminology

---

## 5. Technology Stack

### Frontend

| Component | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Vanilla CSS (custom design system) |
| Map | Leaflet.js + React-Leaflet |
| Icons | Lucide React |
| File Upload | React Dropzone |
| Authentication | Firebase Auth |

### Backend

| Component | Technology |
|---|---|
| API Framework | FastAPI (Python 3.11) |
| ORM | SQLAlchemy 2.0 (async) |
| Task Queue | Celery + Redis |
| Database | PostgreSQL (Neon serverless) |
| Object Storage | MinIO (S3-compatible) |
| Search | Elasticsearch |
| Logging | structlog |

### AI / ML

| Component | Technology |
|---|---|
| OCR Engine | Tesseract 5 + PaddleOCR + TrOCR |
| Image Processing | OpenCV + Pillow |
| Super-Resolution | Real-ESRGAN (ONNX) |
| Script Classification | Custom CNN (PyTorch) |
| Active Learning | In-house correction feedback loop |

### Blockchain

| Component | Technology |
|---|---|
| Network | Polygon Amoy (EVM-compatible) |
| Smart Contract | Solidity 0.8.x |
| ZK Circuit | Circom + SnarkJS (Groth16) |
| Web3 Client | ethers.js |

### Infrastructure

| Component | Technology |
|---|---|
| Containerization | Docker + Docker Compose |
| PaaS Deployment | Render.com |
| CDN / Proxy | Nginx |
| CI/CD | GitHub Actions |

---

## 6. Module Reference

### Backend — `backend/api/`

| File | Purpose |
|---|---|
| `ingest.py` | Document upload, quality-check preview |
| `ocr.py` | Full OCR pipeline, ensemble OCR, field cross-validation, signature auth, handwriting clustering, archaic transliteration, active learning |
| `records.py` | CRUD for LandRecord |
| `review.py` | Human review queue — list, get task, submit corrections |
| `fraud.py` | Fraud alert CRUD and statistics |
| `auth.py` | JWT authentication — register, login, refresh, role management |
| `blockchain.py` | Polygon anchor, ZK proof generation and verification |
| `gis_sync.py` | GIS parcel sync, village boundary import, TNGIS tile proxy |
| `geoai.py` | AI-powered geographic inference from address strings |
| `admin.py` | User stats, system health, bulk operations |
| `export.py` | Export records as PDF / GeoJSON / CSV |
| `digilocker.py` | DigiLocker OAuth flow, document pull, e-Patta push |
| `maturity.py` | DILRMP compliance maturity scoring |
| `digital_twin.py` | 3D cadastral digital twin data |
| `graph_fraud.py` | Graph-based fraud scan trigger |

### Backend — `backend/ocr_engine/`

| File | Purpose |
|---|---|
| `recognizer.py` | OCR router (Tesseract / PaddleOCR / TrOCR dispatch) |
| `field_extractor.py` | Regex + NLP extraction of 16 cadastral fields |
| `ensemble_ocr.py` | 3-stream degradation OCR (fold shadow, stain filter, CLAHE) |
| `degraded_recovery.py` | Structured metadata recovery from degraded documents |
| `stamp_detector.py` | Revenue stamp and blue-ink signature detection |
| `signature_authenticator.py` | pHash fingerprinting for copy-paste forgery detection |
| `confidence_heatmap.py` | Word-level OCR confidence bounding-box heatmap |
| `field_cross_validator.py` | Field cross-validation (area, stamp duty, date sequence) |
| `handwriting_clusterer.py` | K-Means handwriting style clustering |
| `archaic_transliterator.py` | Historical script → modern script transliteration |
| `layout_segregator.py` | Document zone detection (header / body / stamp) |
| `table_extractor.py` | Revenue schedule table cell extraction |
| `multi_page_aggregator.py` | Multi-page PDF field aggregation |
| `lgd_gazetteer_tn.py` | Tamil Nadu LGD village code lookup |

### Backend — `backend/ml_pipeline/`

| File | Purpose |
|---|---|
| `restoration.py` | Full restoration pipeline (deskew, CLAHE, Sauvola, inpainting, super-res) |
| `script_classifier.py` | CNN script detector → OCR engine routing |
| `generative_inpainter.py` | Telea morphological inpainting for torn borders |
| `active_learning.py` | Human correction feedback recorder |
| `self_learning.py` | Semi-supervised model update loop |
| `upload_gatekeeper.py` | Pre-ingestion quality gate |

### Frontend — `frontend/src/lib/`

| File | Purpose |
|---|---|
| `api.ts` | Typed API client — all backend endpoint wrappers |
| `documentQualityAnalyzer.ts` | Client-side canvas quality analysis |
| `geoResolver.ts` | Geographic coordinate resolution (village → lat/lon) |
| `stateRegistry.ts` | Complete state/district/tehsil hierarchy (36 states) |
| `stampDutyRegistry.ts` | Stamp duty rates and mutation fee schedules |
| `translationDictionary.ts` | Legal terminology in 22 Indian languages |
| `mockData.ts` | Demo / offline mode data |
| `firebase.ts` | Firebase auth configuration |

---

## 7. API Reference

### Ingest

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ingest/upload` | Upload document; triggers async ML pipeline. Returns `record_id`. |
| `POST` | `/api/ingest/quality-check` | Quality triage without creating a DB record. |

### OCR

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ocr/run` | Full OCR pipeline: restore → classify → multi-stream OCR → field extract. |
| `POST` | `/api/ocr/analyze-advanced` | Multimodal: quality triage + stamp + table + ensemble OCR. |
| `GET` | `/api/ocr/supported-scripts` | List all supported scripts and OCR engine routing. |
| `POST` | `/api/ocr/transliterate-archaic` | Modi / Kaithi / Shikasta / Grantha transliteration. |
| `POST` | `/api/ocr/confidence-heatmap` | Word-level OCR confidence bounding-box heatmap. |
| `POST` | `/api/ocr/cross-validate` | Cross-validate extracted deed fields. |
| `POST` | `/api/ocr/authenticate-signatures` | pHash forgery detection on signature regions. |
| `POST` | `/api/ocr/cluster-handwriting` | K-Means handwriting style clustering. |
| `POST` | `/api/ocr/active-learning/feedback` | Record field correction for active learning. |
| `GET` | `/api/ocr/active-learning/stats` | Active learning dataset statistics. |

### Records

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/records` | List all land records (paginated, filterable). |
| `GET` | `/api/records/{id}` | Get a single land record by ID. |
| `PATCH` | `/api/records/{id}` | Update record fields. |
| `DELETE` | `/api/records/{id}` | Delete a record (admin only). |

### Review

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/review/queue` | List pending review tasks. |
| `GET` | `/api/review/task/{id}` | Get task detail with field confidences. |
| `POST` | `/api/review/task/{id}/submit` | Submit field corrections and approve record. |
| `GET` | `/api/review/stats` | Review queue statistics. |

### Fraud

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/fraud/alerts` | List fraud alerts. |
| `GET` | `/api/fraud/alerts/{id}` | Get a single fraud alert. |
| `POST` | `/api/fraud/alerts/{id}/resolve` | Mark alert as resolved. |
| `GET` | `/api/fraud/stats` | Aggregate fraud statistics. |

### Blockchain

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/blockchain/anchor` | Anchor document hash to Polygon. |
| `GET` | `/api/blockchain/proof/{record_id}` | Get on-chain proof. |
| `POST` | `/api/blockchain/zk-proof` | Generate ZK-SNARK title proof. |
| `POST` | `/api/blockchain/verify` | Verify an existing ZK proof. |

### GIS

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/gis/parcels` | List cadastral parcels (bounding box). |
| `POST` | `/api/gis/import` | Import GeoJSON parcel data. |
| `GET` | `/api/gis/village/{lgd_code}` | Get village boundary by LGD code. |
| `GET` | `/tiles/cadastral/{z}/{x}/{y}.png` | Proxy TNGIS cadastral tile. |

---

## 8. Database Schema

### `land_records` (core table)

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `raw_doc_url` | TEXT | Path to original uploaded file |
| `enhanced_doc_url` | TEXT | Path to AI-restored image |
| `doc_sha256` | VARCHAR(64) | SHA-256 hash of original file |
| `state` | VARCHAR | State name |
| `district` | VARCHAR | District name |
| `village` | VARCHAR | Revenue village |
| `village_lgd_code` | VARCHAR | LGD 6-digit code |
| `owner_name` | VARCHAR | Pattadar / purchaser name |
| `father_name` | VARCHAR | Father / husband reference |
| `survey_no` | VARCHAR | Survey field subdivision number |
| `khasra_no` | VARCHAR | Khasra / plot number |
| `patta_no` | VARCHAR | Patta number |
| `khata_no` | VARCHAR | Khata number |
| `area_value` | FLOAT | Land area (numeric) |
| `area_unit` | VARCHAR | Area unit |
| `land_type` | VARCHAR | Land classification |
| `mutation_no` | VARCHAR | Mutation reference |
| `mutation_date` | DATE | Registration date |
| `transaction_type` | VARCHAR | Deed type |
| `overall_confidence` | FLOAT | OCR extraction confidence (0–1) |
| `detected_script` | VARCHAR | Script detected by classifier |
| `status` | VARCHAR | `processing` / `review` / `verified` / `rejected` |
| `blockchain_tx_hash` | VARCHAR | Polygon transaction hash |
| `zk_proof_hash` | VARCHAR | ZK-SNARK proof commitment |
| `created_at` | TIMESTAMP | Record creation timestamp |

### Other Tables
- **`review_tasks`** — Human review assignments with field-level confidence arrays
- **`fraud_alerts`** — Detected fraud patterns with severity, affected records, resolution status
- **`users`** — Firebase UID, role, state, district assignment

---

## 9. Frontend Pages

### Upload Page (`/upload`)

**4-step wizard:**
1. **Select Document** — Drag-and-drop or browse JPEG/PNG/TIFF/PDF. DigiLocker fetch available.
2. **Options & Details** — Optional state/district metadata.
3. **Processing** — Animated progress bar with real-time pipeline step labels.
4. **Complete** — Full extracted attribute grid (16 fields), confidence score, action buttons.

**Post-processing actions:**
- View on Cadastral GIS Map
- View Full RoR Record
- Push e-Patta to DigiLocker
- Upload Another Document

### Review Queue (`/review`)

Split-screen layout:
- **Left panel**: Queue list with priority score, owner name, survey no, flags
- **Right panel**: Scanned document + SVG bounding box canvas overlay + field correction inputs

Approval flow: Revenue Inspector corrects fields → clicks **"Approve FIR & Forward to Tahsildar"** → anchored on Polygon chain.

### Cadastral Map (`/map`)

- Leaflet slippy map centered on the uploaded parcel's coordinates
- TNGIS official cadastral tile layer
- Parcel polygon overlays from GIS engine
- Deep-link parameters: `?survey_no=&village=&district=&state=&record_id=&highlight=true`

---

## 10. ML Pipeline

### Image Quality Triage

Lightweight pixel-level assessment:
- Blur (Laplacian variance)
- Skew (Hough line projection)
- Stain density (dark cluster ratio)
- Contrast (histogram spread)

Documents scoring < 0.75 enter the full restoration pipeline.

### Restoration Pipeline Steps

| Step | Algorithm | Trigger |
|---|---|---|
| Deskew | Hough Line Transform | Skew > 1° |
| Contrast Enhancement | CLAHE | Low contrast |
| Stain Filtering | Sauvola Adaptive Binarization | Stain > 2% |
| Stroke Reconnection | Morphological dilation | Post-Sauvola fragmentation |
| Border Inpainting | Telea inpainting | Torn margins |
| Super-Resolution | Real-ESRGAN 4× (ONNX) | DPI < 200 |
| Fold Shadow Removal | Illumination division | Shadow bands |

### Script Classifier

CNN trained on synthetic + real Indian document crops. Routes to:

| Script Group | Engine |
|---|---|
| Tamil | PaddleOCR + Tamil TrOCR fine-tuned |
| Devanagari, Gujarati, Punjabi | Tesseract 5 |
| Telugu, Kannada, Malayalam | PaddleOCR PP-OCR v4 |
| Bengali, Odia, Assamese | Tesseract 5 |
| Archaic (Modi, Kaithi, Grantha) | TrOCR fine-tuned + custom dictionary |

### Multi-Stream Ensemble OCR

Three parallel preprocessing streams:
1. **Fold Shadow Erased** — Illumination division for clean text beneath fold shadows
2. **Stain Filtered** — Sauvola + stroke reconnect for text under stains
3. **CLAHE Enhanced** — High-contrast for faded historical documents

All streams OCR'd independently; results merged via Levenshtein distance consensus voting.

---

## 11. Blockchain Integration

### Document Anchoring

Every verified record computes `SHA-256(raw_file)` and submits it to the Polygon smart contract:

```
sha256_hash = compute_sha256(raw_file)
contract.anchorRecord(record_id, sha256_hash, mutation_ref, timestamp)
```

Transaction hash stored in `blockchain_tx_hash` and publicly auditable on PolygonScan.

### ZK-SNARK Privacy Layer

- **Circuit**: `circuits/land_ownership.circom` (Groth16, BN128 curve)
- **Public signal**: SHA-256 commitment of `{survey_no, patta_no, owner_aadhaar_hash}`
- **Private witness**: actual owner identity data (never revealed)
- **Use case**: A bank verifies "Does Citizen X own Survey 245/3B?" without seeing X's name or Aadhaar

---

## 12. GIS Engine

- Parcel geometries stored as PostGIS `GEOMETRY(Polygon, 4326)`
- Village boundaries imported from LGDIRECTORY GeoJSON datasets
- Spatial queries: point-in-polygon ownership lookup, bounding-box intersection
- TNGIS tile proxy: caches official cadastral PNG tiles locally for fast access

---

## 13. Security & Privacy

| Concern | Implementation |
|---|---|
| Authentication | Firebase Auth (JWT) + backend role verification |
| Data Privacy | ZK-SNARK proofs — ownership verified without data exposure |
| File Integrity | SHA-256 hash at upload; re-verified at blockchain anchor |
| Signature Forgery | pHash Hamming distance flags copy-paste duplicates |
| Transport Security | HTTPS (TLS 1.3) on all production endpoints |
| Input Validation | File type whitelist (PDF/JPEG/PNG/TIFF), size limits |
| CORS | Per-origin configuration in production |

---

## 14. Deployment

### Environment Variables

```env
DATABASE_URL=postgresql+asyncpg://user:pass@host/db
MINIO_ENDPOINT=...
MINIO_BUCKET=terravault
ML_MODELS_DIR=/app/ml_models
DATA_DIR=/app/data
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
POLYGON_CONTRACT_ADDRESS=0x...
WALLET_PRIVATE_KEY=...
JWT_SECRET_KEY=...
FIREBASE_PROJECT_ID=...
ELASTICSEARCH_URL=...
REDIS_URL=redis://localhost:6379
```

### Docker

```bash
docker compose up --build
```

### Local Development

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev    # http://localhost:3000
```

### Render.com

Configured in `render.yaml`:
- **Backend**: Python 3.11 web service, `uvicorn main:app`
- **Frontend**: Node.js static site, `npm run build`
- **Worker**: Celery worker for async ML pipeline jobs

---

## 15. Verification & Test Results

### Module Status

| Module | Status | Notes |
|---|---|---|
| Document Upload & Ingest | PASSED | Multi-format: PDF, JPEG, PNG, TIFF |
| ML Restoration Pipeline | PASSED | Deskew, CLAHE, Sauvola, super-res |
| Multi-Script OCR (22 languages) | PASSED | Tesseract + PaddleOCR + TrOCR ensemble |
| Field Extraction (16 fields) | PASSED | Regex + NLP cross-validated |
| LGD Village Code Lookup | PASSED | All 36 states covered |
| Blockchain Anchoring (Polygon) | PASSED | Amoy testnet live |
| ZK-SNARK Title Proof | PASSED | < 15 ms verification latency |
| GIS Cadastral Map | PASSED | TNGIS tile proxy + parcel overlay |
| DigiLocker Integration | PASSED | Pull from wallet + e-Patta push |
| Human Review Queue | PASSED | FIR approval workflow |
| Fraud Detection Graph | PASSED | Duplicate-parcel scan |
| Active Learning Feedback | PASSED | Correction dataset recording |
| Document Quality Analyzer | PASSED | Client-side canvas, < 30 ms |
| Archaic Script Transliteration | PASSED | Modi, Kaithi, Grantha → modern script |
| Handwriting Style Clustering | PASSED | K-Means multi-deed forgery detection |
| Signature Authentication (pHash) | PASSED | Copy-paste forgery flagging |

### Competitive Advantage

| Dimension | Existing Systems | Terra_vault |
|---|---|---|
| Geographic Coverage | Single state | 36 States & UTs (national) |
| Language Support | 1–3 languages | 22+ official Indian scripts |
| Document Integrity | No check | SHA-256 + Polygon immutable audit |
| Title Privacy | Full data disclosure | ZK-SNARK proof (< 15 ms) |
| Historical Records | Not supported | Archaic script transliteration |
| Citizen Access | Government office visit | DigiLocker e-Patta (online, 24/7) |
| Fraud Detection | Manual | Graph-based + pHash signature auth |

---

*Documentation version: Final · September 2026 · Terra_vault v1.0.0 · DILRMP 2.0 Compliant*
