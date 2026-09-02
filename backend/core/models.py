"""Terra_vault — SQLAlchemy ORM Models"""
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean, Column, DateTime, Float, ForeignKey,
    Integer, String, Text, BigInteger, JSON, func
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from core.database import Base


def new_uuid():
    return str(uuid.uuid4())


class LandRecord(Base):
    __tablename__ = "land_records"

    id = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    raw_doc_url = Column(Text)
    enhanced_doc_url = Column(Text)
    doc_sha256 = Column(String(64))
    thumbnail_url = Column(Text)

    # Extracted fields
    owner_name = Column(Text)
    father_name = Column(Text)
    khasra_no = Column(Text)
    khata_no = Column(Text)
    survey_no = Column(Text)
    village = Column(Text)
    tehsil = Column(Text)
    district = Column(Text)
    state = Column(Text)
    village_lgd_code = Column(String(10))

    area_value = Column(Float)
    area_unit = Column(String(20))
    land_type = Column(String(50))

    mutation_no = Column(Text)
    mutation_date = Column(DateTime)
    transaction_type = Column(String(50))
    patta_no = Column(Text)
    survey_subdivision = Column(Text)
    co_owners = Column(JSON)          # List[str]
    guideline_value = Column(Float)
    encumbrance_status = Column(String(50), default="Clean / Nil Encumbrance")
    mutation_history = Column(JSON)   # List[{date, deed_type, seller, buyer, doc_no, consideration}]
    inheritance_tree = Column(JSON)   # {ancestor, generation, heirs: [...]}

    # ML metadata
    detected_script = Column(String(30))
    quality_score = Column(Float)
    quality_issues = Column(JSON)     # List[str]
    overall_confidence = Column(Float)
    page_count = Column(Integer, default=1)

    # Status
    status = Column(String(20), default="processing")
    # processing | review | verified | disputed | rejected

    # Blockchain
    blockchain_anchored = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    field_confidences = relationship("FieldConfidence", back_populates="record", cascade="all, delete-orphan")
    review_tasks = relationship("ReviewTask", back_populates="record", cascade="all, delete-orphan")
    blockchain_anchor = relationship("BlockchainAnchor", back_populates="record", uselist=False)


class FieldConfidence(Base):
    __tablename__ = "field_confidence"

    id = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    record_id = Column(UUID(as_uuid=False), ForeignKey("land_records.id", ondelete="CASCADE"))
    field_name = Column(String(50), nullable=False)
    raw_ocr_value = Column(Text)
    confidence = Column(Float)
    flags = Column(JSON)          # List[{reason: str, severity: str}]
    bounding_box = Column(JSON)   # {x, y, w, h} on original image

    is_corrected = Column(Boolean, default=False)
    corrected_value = Column(Text)
    corrected_by = Column(String(100))
    correction_reason = Column(Text)
    corrected_at = Column(DateTime)

    record = relationship("LandRecord", back_populates="field_confidences")


class ReviewTask(Base):
    __tablename__ = "review_tasks"

    id = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    record_id = Column(UUID(as_uuid=False), ForeignKey("land_records.id", ondelete="CASCADE"))
    priority = Column(Float, default=0.5)
    assigned_to = Column(String(100))
    flags = Column(JSON)
    status = Column(String(20), default="pending")  # pending|in_progress|resolved
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime)

    record = relationship("LandRecord", back_populates="review_tasks")


class BlockchainAnchor(Base):
    __tablename__ = "blockchain_anchors"

    id = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    record_id = Column(UUID(as_uuid=False), ForeignKey("land_records.id", ondelete="CASCADE"), unique=True)
    record_hash = Column(String(66))  # 0x + 64 hex chars
    tx_hash = Column(String(66))
    block_number = Column(BigInteger)
    verifier_id = Column(String(100))
    network = Column(String(30), default="polygon-amoy")
    anchored_at = Column(DateTime, default=datetime.utcnow)

    record = relationship("LandRecord", back_populates="blockchain_anchor")


class GISPlot(Base):
    __tablename__ = "gis_plots"

    id = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    khasra_no = Column(Text)
    survey_no = Column(Text)
    patta_no = Column(Text)
    owner_name = Column(Text)
    village_lgd_code = Column(String(10))
    district = Column(String(100))
    state = Column(String(100), default="Tamil Nadu")
    geojson_str = Column(Text)  # GeoJSON cache for quick retrieval without PostGIS dependency
    area_sqm = Column(Float)
    extra_metadata = Column(JSON)  # For storing mutation, inheritance, land_type, value
    source = Column(String(50), default="tamilnadu-eservices")
    imported_at = Column(DateTime, default=datetime.utcnow)


class MaturityScore(Base):
    __tablename__ = "maturity_scores"

    id = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    geo_level = Column(String(20))   # village|tehsil|district
    geo_name = Column(Text)
    lgd_code = Column(String(10))
    pct_verified = Column(Float, default=0.0)
    avg_confidence = Column(Float, default=0.0)
    error_rate = Column(Float, default=0.0)
    dispute_rate = Column(Float, default=0.0)
    maturity_score = Column(Float, default=0.0)
    total_records = Column(Integer, default=0)
    computed_at = Column(DateTime, default=datetime.utcnow)


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(200), unique=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    role = Column(String(20), default="viewer")   # admin|reviewer|viewer|citizen
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class FraudAlert(Base):
    """Stores alerts produced by the weekly FraudGraph scan."""
    __tablename__ = "fraud_alerts"

    id             = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    alert_type     = Column(String(60), nullable=False)
    # "duplicate_claim" | "circular_mutation" | "orphaned_mutation" | "area_expansion"
    severity       = Column(String(20), nullable=False)
    # "critical" | "high" | "medium"
    record_ids     = Column(JSON, default=list)    # List[str]
    description    = Column(Text)
    subgraph_nodes = Column(JSON, default=list)    # List[str] — for UI graph view
    detected_at    = Column(DateTime, default=datetime.utcnow)
    resolved       = Column(Boolean, default=False)
    resolved_by    = Column(String(100))
    resolved_at    = Column(DateTime)


class SystemConfig(Base):
    """Key-value runtime configuration store. Mirrors DATA_DIR/config.json."""
    __tablename__ = "system_config"

    key        = Column(String(100), primary_key=True)
    value      = Column(Text, nullable=False)
    value_type = Column(String(20), default="string")
    # "string" | "float" | "int" | "bool"
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(String(100))
