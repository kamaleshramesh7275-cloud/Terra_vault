"""
Terra_vault — Tests for Title Lineage Engine & Title Search PDF Report Generator
"""
import pytest
from validation.title_lineage import TitleLineageEngine, TitleLineageReport
from services.pdf_generator import generate_title_search_pdf


class TestTitleLineageEngine:
    def test_clean_record_evaluation(self):
        engine = TitleLineageEngine()
        record = {
            "id": "rec-test-1",
            "khasra_no": "100/1",
            "village": "Rampur",
            "district": "Lucknow",
            "owner_name": "Sita Devi",
            "father_name": "Ram Lal",
            "area_value": 3.0,
            "area_unit": "acre",
            "encumbrance_status": "Clean / Nil Encumbrance",
            "overall_confidence": 0.95
        }

        report = engine.evaluate_record(record)
        assert isinstance(report, TitleLineageReport)
        assert report.cleanliness_score >= 80.0
        assert "A" in report.grade
        assert len(report.chain) >= 2
        assert report.record_id == "rec-test-1"

    def test_encumbrance_penalty(self):
        engine = TitleLineageEngine()
        record = {
            "id": "rec-test-2",
            "khasra_no": "200/2",
            "village": "Agra",
            "district": "Agra",
            "owner_name": "Vijay Kumar",
            "encumbrance_status": "MORTGAGED TO STATE BANK OF INDIA",
            "overall_confidence": 0.90
        }

        report = engine.evaluate_record(record)
        assert report.cleanliness_score < 90.0
        assert any(r["severity"] == "high" for r in report.risk_summary)

    def test_rapid_transfer_penalty(self):
        engine = TitleLineageEngine()
        record = {
            "id": "rec-test-3",
            "khasra_no": "300/3",
            "village": "Bhopal",
            "district": "Bhopal",
            "owner_name": "Buyer B",
            "encumbrance_status": "Clean",
            "mutation_history": [
                {"date": "2023-01-10", "deed_type": "Sale Deed", "seller": "Owner A", "buyer": "Intermediary X", "doc_no": "D1"},
                {"date": "2023-05-12", "deed_type": "Sale Deed", "seller": "Intermediary X", "buyer": "Buyer B", "doc_no": "D2"},
            ]
        }

        report = engine.evaluate_record(record)
        assert len(report.risk_summary) > 0
        assert any("Rapid transfer" in r["message"] for r in report.risk_summary)


class TestPDFGenerator:
    def test_generate_pdf_output(self):
        engine = TitleLineageEngine()
        record = {
            "id": "rec-pdf-1",
            "khasra_no": "505/B",
            "village": "Coimbatore",
            "district": "Coimbatore",
            "owner_name": "Karthik R",
            "area_value": 1.5,
            "area_unit": "acre",
            "encumbrance_status": "Clean / Nil Encumbrance"
        }
        report = engine.evaluate_record(record)
        pdf_bytes = generate_title_search_pdf(report.to_dict())

        assert isinstance(pdf_bytes, bytes)
        assert len(pdf_bytes) > 200
        # Check PDF header magic bytes %PDF or text header
        assert b"%PDF" in pdf_bytes or b"TERRA_VAULT" in pdf_bytes
