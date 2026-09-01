"""
Terra_vault — Tests for Innovation 3 (ZK Privacy Blockchain) & Innovation 4 (Temporal Graph AI)
"""
import pytest
from blockchain.zk_proof_generator import ZKProofGenerator, ZKProofPayload
from blockchain.polygon_verifier import PolygonZKVerifier, PolygonVerificationResult
from validation.temporal_graph_ai import TemporalGraphAIEngine, BenamiRingAlert


class TestZKProofGenerator:
    def test_generate_clean_title_proof(self):
        generator = ZKProofGenerator()
        proof = generator.generate_title_cleanliness_proof(
            record_id="rec-demo-101",
            khasra_no="104/A",
            cleanliness_score=92.5,
            village_lgd="330412"
        )
        assert isinstance(proof, ZKProofPayload)
        assert proof.is_valid is True
        assert proof.proof_type == "TITLE_CLEANLINESS_PROOF"
        assert len(proof.public_inputs) == 2
        assert len(proof.pi_a) == 3


class TestPolygonZKVerifier:
    def test_verify_on_chain_polygon(self):
        generator = ZKProofGenerator()
        proof = generator.generate_title_cleanliness_proof("rec-101", "104/A", 88.0)

        verifier = PolygonZKVerifier()
        result = verifier.verify_on_chain(proof.to_dict())
        assert isinstance(result, PolygonVerificationResult)
        assert result.is_onchain_valid is True
        assert "amoy.polygonscan.com" in result.explorer_url


class TestTemporalGraphAIEngine:
    def test_scan_for_land_mafia_rings(self):
        engine = TemporalGraphAIEngine()
        alerts = engine.scan_for_land_mafia()
        assert isinstance(alerts, list)
        assert len(alerts) >= 2
        assert any(a.pattern_type == "CIRCULAR_PROPERTY_FLIP" for a in alerts)
        assert any(a.pattern_type == "BENAMI_SHELL_BUYER" for a in alerts)

    def test_get_record_subgraph(self):
        engine = TemporalGraphAIEngine()
        subgraph = engine.get_subgraph("rec-cbe-demo")
        assert "nodes" in subgraph
        assert "edges" in subgraph
        assert len(subgraph["nodes"]) >= 3
