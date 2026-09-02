"""
Terra_vault — Direct Neon table creator (no ML deps needed)
Run: python create_neon_tables.py
Creates all tables on Neon PostgreSQL using raw psycopg2.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

SYNC_DB_URL = os.getenv(
    "SYNC_DATABASE_URL",
    "postgresql://neondb_owner:npg_W3YAeE8kFfdZ@ep-young-bonus-ave5hy11-pooler.c-11.us-east-1.aws.neon.tech/neondb?sslmode=require"
)

DDL = """
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    username    VARCHAR(100) UNIQUE NOT NULL,
    email       VARCHAR(200) UNIQUE NOT NULL,
    hashed_password VARCHAR(200) NOT NULL,
    role        VARCHAR(20) DEFAULT 'viewer',
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS land_records (
    id                   TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    raw_doc_url          TEXT,
    enhanced_doc_url     TEXT,
    doc_sha256           VARCHAR(64),
    thumbnail_url        TEXT,

    owner_name           TEXT,
    father_name          TEXT,
    khasra_no            TEXT,
    khata_no             TEXT,
    survey_no            TEXT,
    village              TEXT,
    tehsil               TEXT,
    district             TEXT,
    state                TEXT,
    village_lgd_code     VARCHAR(10),

    area_value           FLOAT,
    area_unit            VARCHAR(20),
    land_type            VARCHAR(50),

    mutation_no          TEXT,
    mutation_date        TIMESTAMP,
    transaction_type     VARCHAR(50),
    patta_no             TEXT,
    survey_subdivision   TEXT,
    co_owners            JSONB,
    guideline_value      FLOAT,
    encumbrance_status   VARCHAR(50) DEFAULT 'Clean / Nil Encumbrance',
    mutation_history     JSONB,
    inheritance_tree     JSONB,

    detected_script      VARCHAR(30),
    quality_score        FLOAT,
    quality_issues       JSONB,
    overall_confidence   FLOAT,
    page_count           INTEGER DEFAULT 1,

    status               VARCHAR(20) DEFAULT 'processing',
    blockchain_anchored  BOOLEAN DEFAULT FALSE,

    created_at           TIMESTAMP DEFAULT NOW(),
    updated_at           TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS field_confidence (
    id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    record_id        TEXT REFERENCES land_records(id) ON DELETE CASCADE,
    field_name       VARCHAR(50) NOT NULL,
    raw_ocr_value    TEXT,
    confidence       FLOAT,
    flags            JSONB,
    bounding_box     JSONB,
    is_corrected     BOOLEAN DEFAULT FALSE,
    corrected_value  TEXT,
    corrected_by     VARCHAR(100),
    correction_reason TEXT,
    corrected_at     TIMESTAMP
);

CREATE TABLE IF NOT EXISTS review_tasks (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    record_id   TEXT REFERENCES land_records(id) ON DELETE CASCADE,
    priority    FLOAT DEFAULT 0.5,
    assigned_to VARCHAR(100),
    flags       JSONB,
    status      VARCHAR(20) DEFAULT 'pending',
    created_at  TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blockchain_anchors (
    id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    record_id    TEXT UNIQUE REFERENCES land_records(id) ON DELETE CASCADE,
    record_hash  VARCHAR(66),
    tx_hash      VARCHAR(66),
    block_number BIGINT,
    verifier_id  VARCHAR(100),
    network      VARCHAR(30) DEFAULT 'polygon-amoy',
    anchored_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gis_plots (
    id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    khasra_no         TEXT,
    survey_no         TEXT,
    patta_no          TEXT,
    owner_name        TEXT,
    village_lgd_code  VARCHAR(10),
    district          VARCHAR(100),
    state             VARCHAR(100) DEFAULT 'Tamil Nadu',
    geojson_str       TEXT,
    area_sqm          FLOAT,
    extra_metadata    JSONB,
    source            VARCHAR(50) DEFAULT 'tamilnadu-eservices',
    imported_at       TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS maturity_scores (
    id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    geo_level      VARCHAR(20),
    geo_name       TEXT,
    lgd_code       VARCHAR(10),
    pct_verified   FLOAT DEFAULT 0.0,
    avg_confidence FLOAT DEFAULT 0.0,
    error_rate     FLOAT DEFAULT 0.0,
    dispute_rate   FLOAT DEFAULT 0.0,
    maturity_score FLOAT DEFAULT 0.0,
    total_records  INTEGER DEFAULT 0,
    computed_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fraud_alerts (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    alert_type      VARCHAR(60) NOT NULL,
    severity        VARCHAR(20) NOT NULL,
    record_ids      JSONB DEFAULT '[]',
    description     TEXT,
    subgraph_nodes  JSONB DEFAULT '[]',
    detected_at     TIMESTAMP DEFAULT NOW(),
    resolved        BOOLEAN DEFAULT FALSE,
    resolved_by     VARCHAR(100),
    resolved_at     TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_config (
    key        VARCHAR(100) PRIMARY KEY,
    value      TEXT NOT NULL,
    value_type VARCHAR(20) DEFAULT 'string',
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by VARCHAR(100)
);

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_land_records_village  ON land_records(village);
CREATE INDEX IF NOT EXISTS idx_land_records_patta    ON land_records(patta_no);
CREATE INDEX IF NOT EXISTS idx_land_records_survey   ON land_records(survey_no);
CREATE INDEX IF NOT EXISTS idx_land_records_district ON land_records(district);
CREATE INDEX IF NOT EXISTS idx_land_records_status   ON land_records(status);
CREATE INDEX IF NOT EXISTS idx_gis_plots_patta       ON gis_plots(patta_no);
CREATE INDEX IF NOT EXISTS idx_gis_plots_survey      ON gis_plots(survey_no);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_type     ON fraud_alerts(alert_type);
"""

def main():
    import psycopg2
    print(f"Connecting to Neon at: {SYNC_DB_URL.split('@')[1].split('/')[0]}")
    conn = psycopg2.connect(SYNC_DB_URL)
    conn.autocommit = True
    cur = conn.cursor()
    print("Connected! Creating tables...")
    cur.execute(DDL)
    print("\n[OK] All tables created successfully on Neon!\n")

    # List created tables
    cur.execute("""
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public' ORDER BY table_name;
    """)
    tables = cur.fetchall()
    print("Tables in Neon database:")
    for t in tables:
        print(f"   - {t[0]}")

    cur.close()
    conn.close()
    print("\n[DONE] Neon database is ready!")

if __name__ == "__main__":
    main()
