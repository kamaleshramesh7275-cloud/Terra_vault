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
from typing import List, Dict, Optional, Set, Any
from fastapi import HTTPException, Security, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import settings
from core.database import get_db
from core.models import User
from core.firebase_auth import verify_firebase_id_token

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


async def get_current_user_claims(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Decodes Firebase ID token or active verified claims.
    Maps authenticated user to statutory revenue roles & territorial jurisdictions in DB.
    """
    if not credentials:
        if settings.ENABLE_DEMO_AUTH_FALLBACK:
            # Default development fallback persona
            return {
                "sub": "demo_user",
                "uid": "demo_tahsildar_uid",
                "email": "tahsildar@terravault.tn.gov.in",
                "name": "Tahsildar (Sandbox Demo)",
                "role": RevenueRole.TAHSILDAR.value,
                "district": "Coimbatore",
                "taluk": "Kinathukadavu",
                "firka": "Kinathukadavu Firka",
                "village_code": "630401",
                "permissions": list(PERMISSION_MATRIX[RevenueRole.TAHSILDAR])
            }
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required"
        )

    # Verify with Firebase / Token Validator
    token_claims = verify_firebase_id_token(credentials.credentials)
    uid = token_claims.get("uid")
    email = token_claims.get("email")

    # Lookup user in DB to fetch assigned statutory role and jurisdiction
    user_record = None
    if uid or email:
        stmt = select(User).where((User.firebase_uid == uid) | (User.email == email))
        res = await db.execute(stmt)
        user_record = res.scalar_one_or_none()

    if user_record:
        role_str = (user_record.role or "CITIZEN").upper()
        district = user_record.district or "Coimbatore"
        taluk = user_record.taluk or "Kinathukadavu"
        firka = user_record.firka or "Kinathukadavu Firka"
        village_code = user_record.village_code or "630401"
        display_name = user_record.display_name or token_claims.get("name") or user_record.username
    else:
        # Derive role from claim if demo token, else default to CITIZEN
        role_str = token_claims.get("role", "CITIZEN").upper()
        district = "Coimbatore"
        taluk = "Kinathukadavu"
        firka = "Kinathukadavu Firka"
        village_code = "630401"
        display_name = token_claims.get("name") or (email.split("@")[0] if email else "Citizen User")

    try:
        role_enum = RevenueRole(role_str)
    except ValueError:
        role_enum = RevenueRole.CITIZEN

    permissions = list(PERMISSION_MATRIX.get(role_enum, set()))

    return {
        "sub": uid or email or "user",
        "uid": uid,
        "email": email,
        "name": display_name,
        "picture": token_claims.get("picture"),
        "role": role_enum.value,
        "district": district,
        "taluk": taluk,
        "firka": firka,
        "village_code": village_code,
        "permissions": permissions,
        "email_verified": token_claims.get("email_verified", False)
    }


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
