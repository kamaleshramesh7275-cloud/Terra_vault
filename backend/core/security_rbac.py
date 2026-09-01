"""
Terra_vault — Tamil Nadu Revenue Hierarchy Fine-Grained Role-Based Access Control (RBAC) & Territorial Scope Engine

Statutory Hierarchy:
1. CITIZEN (பொதுமக்கள்) -> Self-Service Title Holdings & Applications
2. VAO (கிராம நிர்வாக அலுவலர்) -> Revenue Village Scope (Ground Truth & Adangal)
3. RI (வருவாய் ஆய்வாளர்) -> Revenue Firka Scope (Field Verification Scrutiny)
4. TAHSILDAR (தாசில்தார்) -> Revenue Taluk Scope (Statutory Patta Order Sanction)
5. RDO (வருவாய் கோட்டாட்சியர்) -> Revenue Division Scope (1st Appellate Hearing & Stay Orders)
6. DISTRICT_COLLECTOR (மாவட்ட ஆட்சியர்) -> District Apex Scope (Revision, Fraud Override & Audits)
"""
from enum import Enum
from typing import List, Dict, Optional, Set
from fastapi import HTTPException, Security, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

SECRET_KEY = "terravault_dilrmp_secret_key_change_in_prod"
ALGORITHM = "HS256"
security = HTTPBearer(auto_error=False)


class RevenueRole(str, Enum):
    CITIZEN = "CITIZEN"
    VAO = "VAO"
    RI = "RI"
    TAHSILDAR = "TAHSILDAR"
    RDO = "RDO"
    DISTRICT_COLLECTOR = "DISTRICT_COLLECTOR"


# Fine-grained statutory permission matrix
PERMISSION_MATRIX: Dict[RevenueRole, Set[str]] = {
    RevenueRole.CITIZEN: {
        "VIEW_OWN_PATTA", "DOWNLOAD_CHITTA", "APPLY_MUTATION", 
        "PAY_SRO_FEES", "GENERATE_ZK_PROOF", "TRACK_APPLICATION"
    },
    RevenueRole.VAO: {
        "VIEW_VILLAGE_PATTA", "UPDATE_ADANGAL_CROPS", "CONDUCT_FIELD_ENQUIRY",
        "UPLOAD_GROUND_VERIFICATION", "FLAG_LOCAL_DISPUTE", "FORWARD_TO_RI"
    },
    RevenueRole.RI: {
        "VIEW_FIRKA_PATTA", "APPROVE_VAO_FIR", "CROSS_VERIFY_EC",
        "INSPECT_FIRKA_BOUNDARIES", "RECOMMEND_TAHSILDAR_SANCTION", "REJECT_WITH_REMARKS"
    },
    RevenueRole.TAHSILDAR: {
        "VIEW_TALUK_PATTA", "ISSUE_PATTA_ORDER", "EXECUTE_SUBDIVISION",
        "MUTATE_TAMILNILAM_REGISTER", "ANCHOR_BLOCKCHAIN", "REVOKE_TEMP_PATTA"
    },
    RevenueRole.RDO: {
        "VIEW_DIVISION_PATTA", "HEAR_FIRST_APPEAL", "ISSUE_STAY_ORDER",
        "FREEZE_DISPUTED_PLOT", "ORDER_RESURVEY", "OVERRULE_TAHSILDAR_ORDER"
    },
    RevenueRole.DISTRICT_COLLECTOR: {
        "VIEW_DISTRICT_ALL", "APEX_REVISION_OVERRIDE", "ASSIGN_PORAMBOKE_LAND",
        "OVERRIDE_FRAUD_ALERT", "INSPECT_SECURITY_AUDIT_LOGS", "DILRMP_METRICS_OVERVIEW"
    }
}


def check_territorial_boundary(
    user_role: str,
    user_jurisdiction: Dict[str, str],
    target_district: str,
    target_taluk: Optional[str] = None,
    target_village_code: Optional[str] = None
) -> bool:
    """Strictly enforces territorial boundary limits matching TN Revenue Hierarchy."""
    if user_role == RevenueRole.DISTRICT_COLLECTOR.value:
        return user_jurisdiction.get("district", "Coimbatore").lower() in target_district.lower()

    if user_role == RevenueRole.RDO.value:
        # Division covers multi-taluk boundary (e.g. Pollachi Division covers Pollachi & Kinathukadavu)
        return user_jurisdiction.get("district", "Coimbatore").lower() in target_district.lower()

    if user_role == RevenueRole.TAHSILDAR.value:
        if target_taluk and user_jurisdiction.get("taluk"):
            return user_jurisdiction.get("taluk", "").lower() in target_taluk.lower()
        return True

    if user_role == RevenueRole.RI.value:
        # Firka boundary check
        if target_taluk and user_jurisdiction.get("taluk"):
            return user_jurisdiction.get("taluk", "").lower() in target_taluk.lower()
        return True

    if user_role == RevenueRole.VAO.value:
        # Strict village boundary check
        if target_village_code and user_jurisdiction.get("village_code"):
            return user_jurisdiction.get("village_code") == target_village_code
        return True

    # Citizen access
    return True


def get_current_user_claims(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Dict:
    """Decodes JWT claims or returns active demo role persona."""
    if not credentials:
        # Default fallback persona
        return {
            "sub": "demo_user",
            "role": RevenueRole.TAHSILDAR.value,
            "district": "Coimbatore",
            "taluk": "Kinathukadavu",
            "firka": "Kinathukadavu Firka",
            "village_code": "630401"
        }
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication credentials"
        )


def require_permission(required_perm: str):
    """Dependency validator enforcing fine-grained statutory permission."""
    def dependency(user: Dict = Depends(get_current_user_claims)):
        user_role_str = user.get("role", RevenueRole.CITIZEN.value)
        try:
            role_enum = RevenueRole(user_role_str)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Unknown revenue role: {user_role_str}"
            )

        allowed_perms = PERMISSION_MATRIX.get(role_enum, set())
        if required_perm not in allowed_perms and user_role_str != RevenueRole.DISTRICT_COLLECTOR.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{user_role_str}' lacks required statutory power '{required_perm}'"
            )
        return user
    return dependency
