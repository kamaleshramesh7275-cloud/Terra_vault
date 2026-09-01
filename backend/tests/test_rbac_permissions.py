"""
Terra_vault — Pytest Suite for Tamil Nadu Revenue Hierarchy Role-Based Access Control (RBAC) & Territorial Bounds
"""
import pytest
from core.security_rbac import RevenueRole, PERMISSION_MATRIX, check_territorial_boundary


def test_permission_matrix_hierarchy():
    """Verifies statutory powers assigned to each revenue role."""
    citizen_perms = PERMISSION_MATRIX[RevenueRole.CITIZEN]
    assert "VIEW_OWN_PATTA" in citizen_perms
    assert "APPLY_MUTATION" in citizen_perms
    assert "ISSUE_PATTA_ORDER" not in citizen_perms

    vao_perms = PERMISSION_MATRIX[RevenueRole.VAO]
    assert "UPLOAD_GROUND_VERIFICATION" in vao_perms
    assert "UPDATE_ADANGAL_CROPS" in vao_perms

    ri_perms = PERMISSION_MATRIX[RevenueRole.RI]
    assert "APPROVE_VAO_FIR" in ri_perms
    assert "RECOMMEND_TAHSILDAR_SANCTION" in ri_perms

    tahsildar_perms = PERMISSION_MATRIX[RevenueRole.TAHSILDAR]
    assert "ISSUE_PATTA_ORDER" in tahsildar_perms
    assert "ANCHOR_BLOCKCHAIN" in tahsildar_perms

    rdo_perms = PERMISSION_MATRIX[RevenueRole.RDO]
    assert "HEAR_FIRST_APPEAL" in rdo_perms
    assert "ISSUE_STAY_ORDER" in rdo_perms

    collector_perms = PERMISSION_MATRIX[RevenueRole.DISTRICT_COLLECTOR]
    assert "APEX_REVISION_OVERRIDE" in collector_perms
    assert "INSPECT_SECURITY_AUDIT_LOGS" in collector_perms


def test_territorial_boundary_enforcement():
    """Verifies strict territorial scope limits."""
    # VAO scope: matching village code only
    vao_claims = {"village_code": "630401", "taluk": "Kinathukadavu", "district": "Coimbatore"}
    assert check_territorial_boundary(RevenueRole.VAO.value, vao_claims, "Coimbatore", "Kinathukadavu", "630401") is True
    assert check_territorial_boundary(RevenueRole.VAO.value, vao_claims, "Coimbatore", "Kinathukadavu", "630499") is False

    # Tahsildar scope: matching taluk only
    tahsildar_claims = {"taluk": "Kinathukadavu", "district": "Coimbatore"}
    assert check_territorial_boundary(RevenueRole.TAHSILDAR.value, tahsildar_claims, "Coimbatore", "Kinathukadavu") is True
    assert check_territorial_boundary(RevenueRole.TAHSILDAR.value, tahsildar_claims, "Coimbatore", "Pollachi") is False

    # District Collector scope: district level
    collector_claims = {"district": "Coimbatore"}
    assert check_territorial_boundary(RevenueRole.DISTRICT_COLLECTOR.value, collector_claims, "Coimbatore") is True
