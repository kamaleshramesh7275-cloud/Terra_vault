"""Terra_vault — Initial Neon DB Migration (v0001)
Auto-generated: creates all tables from core/models.py
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '0001_initial_neon_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── uuid-ossp extension ──────────────────────────────────────────────────
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    # ── users ────────────────────────────────────────────────────────────────
    op.create_table(
        'users',
        sa.Column('id', sa.String(), nullable=False, server_default=sa.text("gen_random_uuid()::text")),
        sa.Column('username', sa.String(length=100), nullable=False),
        sa.Column('email', sa.String(length=200), nullable=False),
        sa.Column('hashed_password', sa.String(length=200), nullable=False),
        sa.Column('role', sa.String(length=20), nullable=True, server_default='viewer'),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('username'),
    )

    # ── land_records ─────────────────────────────────────────────────────────
    op.create_table(
        'land_records',
        sa.Column('id', sa.String(), nullable=False, server_default=sa.text("gen_random_uuid()::text")),
        sa.Column('raw_doc_url', sa.Text(), nullable=True),
        sa.Column('enhanced_doc_url', sa.Text(), nullable=True),
        sa.Column('doc_sha256', sa.String(length=64), nullable=True),
        sa.Column('thumbnail_url', sa.Text(), nullable=True),
        sa.Column('owner_name', sa.Text(), nullable=True),
        sa.Column('father_name', sa.Text(), nullable=True),
        sa.Column('khasra_no', sa.Text(), nullable=True),
        sa.Column('khata_no', sa.Text(), nullable=True),
        sa.Column('survey_no', sa.Text(), nullable=True),
        sa.Column('village', sa.Text(), nullable=True),
        sa.Column('tehsil', sa.Text(), nullable=True),
        sa.Column('district', sa.Text(), nullable=True),
        sa.Column('state', sa.Text(), nullable=True),
        sa.Column('village_lgd_code', sa.String(length=10), nullable=True),
        sa.Column('area_value', sa.Float(), nullable=True),
        sa.Column('area_unit', sa.String(length=20), nullable=True),
        sa.Column('land_type', sa.String(length=50), nullable=True),
        sa.Column('mutation_no', sa.Text(), nullable=True),
        sa.Column('mutation_date', sa.DateTime(), nullable=True),
        sa.Column('transaction_type', sa.String(length=50), nullable=True),
        sa.Column('patta_no', sa.Text(), nullable=True),
        sa.Column('survey_subdivision', sa.Text(), nullable=True),
        sa.Column('co_owners', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('guideline_value', sa.Float(), nullable=True),
        sa.Column('encumbrance_status', sa.String(length=50), nullable=True, server_default='Clean / Nil Encumbrance'),
        sa.Column('mutation_history', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('inheritance_tree', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('detected_script', sa.String(length=30), nullable=True),
        sa.Column('quality_score', sa.Float(), nullable=True),
        sa.Column('quality_issues', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('overall_confidence', sa.Float(), nullable=True),
        sa.Column('page_count', sa.Integer(), nullable=True, server_default='1'),
        sa.Column('status', sa.String(length=20), nullable=True, server_default='processing'),
        sa.Column('blockchain_anchored', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(), nullable=True, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('idx_land_records_village', 'land_records', ['village'])
    op.create_index('idx_land_records_patta', 'land_records', ['patta_no'])
    op.create_index('idx_land_records_survey', 'land_records', ['survey_no'])
    op.create_index('idx_land_records_district', 'land_records', ['district'])
    op.create_index('idx_land_records_status', 'land_records', ['status'])

    # ── field_confidence ──────────────────────────────────────────────────────
    op.create_table(
        'field_confidence',
        sa.Column('id', sa.String(), nullable=False, server_default=sa.text("gen_random_uuid()::text")),
        sa.Column('record_id', sa.String(), nullable=True),
        sa.Column('field_name', sa.String(length=50), nullable=False),
        sa.Column('raw_ocr_value', sa.Text(), nullable=True),
        sa.Column('confidence', sa.Float(), nullable=True),
        sa.Column('flags', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('bounding_box', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('is_corrected', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('corrected_value', sa.Text(), nullable=True),
        sa.Column('corrected_by', sa.String(length=100), nullable=True),
        sa.Column('correction_reason', sa.Text(), nullable=True),
        sa.Column('corrected_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['record_id'], ['land_records.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

    # ── review_tasks ──────────────────────────────────────────────────────────
    op.create_table(
        'review_tasks',
        sa.Column('id', sa.String(), nullable=False, server_default=sa.text("gen_random_uuid()::text")),
        sa.Column('record_id', sa.String(), nullable=True),
        sa.Column('priority', sa.Float(), nullable=True, server_default='0.5'),
        sa.Column('assigned_to', sa.String(length=100), nullable=True),
        sa.Column('flags', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=True, server_default='pending'),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('NOW()')),
        sa.Column('resolved_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['record_id'], ['land_records.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

    # ── blockchain_anchors ────────────────────────────────────────────────────
    op.create_table(
        'blockchain_anchors',
        sa.Column('id', sa.String(), nullable=False, server_default=sa.text("gen_random_uuid()::text")),
        sa.Column('record_id', sa.String(), nullable=True),
        sa.Column('record_hash', sa.String(length=66), nullable=True),
        sa.Column('tx_hash', sa.String(length=66), nullable=True),
        sa.Column('block_number', sa.BigInteger(), nullable=True),
        sa.Column('verifier_id', sa.String(length=100), nullable=True),
        sa.Column('network', sa.String(length=30), nullable=True, server_default='polygon-amoy'),
        sa.Column('anchored_at', sa.DateTime(), nullable=True, server_default=sa.text('NOW()')),
        sa.ForeignKeyConstraint(['record_id'], ['land_records.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('record_id'),
    )

    # ── gis_plots ─────────────────────────────────────────────────────────────
    op.create_table(
        'gis_plots',
        sa.Column('id', sa.String(), nullable=False, server_default=sa.text("gen_random_uuid()::text")),
        sa.Column('khasra_no', sa.Text(), nullable=True),
        sa.Column('survey_no', sa.Text(), nullable=True),
        sa.Column('patta_no', sa.Text(), nullable=True),
        sa.Column('owner_name', sa.Text(), nullable=True),
        sa.Column('village_lgd_code', sa.String(length=10), nullable=True),
        sa.Column('district', sa.String(length=100), nullable=True),
        sa.Column('state', sa.String(length=100), nullable=True, server_default='Tamil Nadu'),
        sa.Column('geojson_str', sa.Text(), nullable=True),
        sa.Column('area_sqm', sa.Float(), nullable=True),
        sa.Column('extra_metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('source', sa.String(length=50), nullable=True, server_default='tamilnadu-eservices'),
        sa.Column('imported_at', sa.DateTime(), nullable=True, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('idx_gis_plots_patta', 'gis_plots', ['patta_no'])
    op.create_index('idx_gis_plots_survey', 'gis_plots', ['survey_no'])

    # ── maturity_scores ───────────────────────────────────────────────────────
    op.create_table(
        'maturity_scores',
        sa.Column('id', sa.String(), nullable=False, server_default=sa.text("gen_random_uuid()::text")),
        sa.Column('geo_level', sa.String(length=20), nullable=True),
        sa.Column('geo_name', sa.Text(), nullable=True),
        sa.Column('lgd_code', sa.String(length=10), nullable=True),
        sa.Column('pct_verified', sa.Float(), nullable=True, server_default='0.0'),
        sa.Column('avg_confidence', sa.Float(), nullable=True, server_default='0.0'),
        sa.Column('error_rate', sa.Float(), nullable=True, server_default='0.0'),
        sa.Column('dispute_rate', sa.Float(), nullable=True, server_default='0.0'),
        sa.Column('maturity_score', sa.Float(), nullable=True, server_default='0.0'),
        sa.Column('total_records', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('computed_at', sa.DateTime(), nullable=True, server_default=sa.text('NOW()')),
        sa.PrimaryKeyConstraint('id'),
    )

    # ── fraud_alerts ──────────────────────────────────────────────────────────
    op.create_table(
        'fraud_alerts',
        sa.Column('id', sa.String(), nullable=False, server_default=sa.text("gen_random_uuid()::text")),
        sa.Column('alert_type', sa.String(length=60), nullable=False),
        sa.Column('severity', sa.String(length=20), nullable=False),
        sa.Column('record_ids', postgresql.JSONB(astext_type=sa.Text()), nullable=True, server_default='[]'),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('subgraph_nodes', postgresql.JSONB(astext_type=sa.Text()), nullable=True, server_default='[]'),
        sa.Column('detected_at', sa.DateTime(), nullable=True, server_default=sa.text('NOW()')),
        sa.Column('resolved', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('resolved_by', sa.String(length=100), nullable=True),
        sa.Column('resolved_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('idx_fraud_alerts_type', 'fraud_alerts', ['alert_type'])

    # ── system_config ─────────────────────────────────────────────────────────
    op.create_table(
        'system_config',
        sa.Column('key', sa.String(length=100), nullable=False),
        sa.Column('value', sa.Text(), nullable=False),
        sa.Column('value_type', sa.String(length=20), nullable=True, server_default='string'),
        sa.Column('updated_at', sa.DateTime(), nullable=True, server_default=sa.text('NOW()')),
        sa.Column('updated_by', sa.String(length=100), nullable=True),
        sa.PrimaryKeyConstraint('key'),
    )


def downgrade() -> None:
    op.drop_table('system_config')
    op.drop_index('idx_fraud_alerts_type', table_name='fraud_alerts')
    op.drop_table('fraud_alerts')
    op.drop_table('maturity_scores')
    op.drop_index('idx_gis_plots_survey', table_name='gis_plots')
    op.drop_index('idx_gis_plots_patta', table_name='gis_plots')
    op.drop_table('gis_plots')
    op.drop_table('blockchain_anchors')
    op.drop_table('review_tasks')
    op.drop_table('field_confidence')
    op.drop_index('idx_land_records_status', table_name='land_records')
    op.drop_index('idx_land_records_district', table_name='land_records')
    op.drop_index('idx_land_records_survey', table_name='land_records')
    op.drop_index('idx_land_records_patta', table_name='land_records')
    op.drop_index('idx_land_records_village', table_name='land_records')
    op.drop_table('land_records')
    op.drop_table('users')
