"""
Terra_vault — Auth API (Firebase Authentication & Statutory RBAC Engine)
"""
import bcrypt
if not hasattr(bcrypt, "__about__"):
    class DummyAbout:
        __version__ = getattr(bcrypt, "__version__", "4.0.0")
    bcrypt.__about__ = DummyAbout()

original_hashpw = bcrypt.hashpw
def patched_hashpw(password, salt):
    if isinstance(password, str):
        password = password.encode("utf-8")
    if len(password) > 72:
        password = password[:72]
    return original_hashpw(password, salt)
bcrypt.hashpw = patched_hashpw

from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List

from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.models import User
from core.config import settings
from core.firebase_auth import verify_firebase_id_token
from core.security_rbac import get_current_user_claims, RevenueRole, PERMISSION_MATRIX

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token", auto_error=False)

ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8 hours


class Token(BaseModel):
    access_token: str
    token_type: str
    role: str


class SyncProfileRequest(BaseModel):
    firebase_uid: str
    email: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    email_verified: Optional[bool] = False
    requested_role: Optional[str] = None


class UserProfileResponse(BaseModel):
    uid: Optional[str]
    username: str
    email: str
    display_name: Optional[str]
    avatar_url: Optional[str]
    role: str
    designation: Optional[str]
    district: str
    taluk: str
    firka: str
    village_code: str
    permissions: List[str]
    email_verified: bool


def _hash_password(password: str) -> str:
    return pwd_context.hash(password)


def _verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def _create_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode["exp"] = expire
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")


async def get_current_user(token: Optional[str] = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    """
    Resolves user from token (Firebase or legacy local JWT).
    """
    if not token:
        if settings.ENABLE_DEMO_AUTH_FALLBACK:
            # Fallback admin/tahsildar in dev
            user = (await db.execute(select(User).where(User.username == "tahsildar_kinathukadavu"))).scalar_one_or_none()
            if user:
                return user
            # Create transient demo user
            return User(
                username="tahsildar_kinathukadavu",
                email="tahsildar@terravault.tn.gov.in",
                role="TAHSILDAR",
                district="Coimbatore",
                taluk="Kinathukadavu"
            )
        raise HTTPException(status_code=401, detail="Authentication token required")

    # Try Firebase verification first
    try:
        fb_claims = verify_firebase_id_token(token)
        uid = fb_claims.get("uid")
        email = fb_claims.get("email")
        if uid or email:
            stmt = select(User).where((User.firebase_uid == uid) | (User.email == email))
            user = (await db.execute(stmt)).scalar_one_or_none()
            if user:
                return user
            # JIT provision user
            new_user = User(
                firebase_uid=uid,
                username=email.split("@")[0] if email else f"user_{uid[:8]}",
                email=email or f"{uid}@firebase.user",
                display_name=fb_claims.get("name"),
                avatar_url=fb_claims.get("picture"),
                email_verified=fb_claims.get("email_verified", False),
                role=fb_claims.get("role", "CITIZEN"),
                district="Coimbatore",
                taluk="Kinathukadavu",
                firka="Kinathukadavu Firka",
                village_code="630401"
            )
            db.add(new_user)
            await db.commit()
            await db.refresh(new_user)
            return new_user
    except Exception:
        pass

    # Legacy JWT verification
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        username: str = payload.get("sub")
        if username:
            user = (await db.execute(select(User).where(User.username == username))).scalar_one_or_none()
            if user:
                return user
    except Exception:
        pass

    raise HTTPException(status_code=401, detail="Invalid authentication credentials")


@router.get("/me", response_model=UserProfileResponse)
async def get_me(claims: Dict[str, Any] = Depends(get_current_user_claims)):
    """
    Returns current authenticated user profile, statutory role, territorial jurisdiction and permissions.
    """
    return UserProfileResponse(
        uid=claims.get("uid"),
        username=claims.get("sub") or claims.get("email", "user"),
        email=claims.get("email") or "",
        display_name=claims.get("name"),
        avatar_url=claims.get("picture"),
        role=claims.get("role", "CITIZEN"),
        designation=f"{claims.get('role', 'CITIZEN')} Officer",
        district=claims.get("district", "Coimbatore"),
        taluk=claims.get("taluk", "Kinathukadavu"),
        firka=claims.get("firka", "Kinathukadavu Firka"),
        village_code=claims.get("village_code", "630401"),
        permissions=claims.get("permissions", []),
        email_verified=claims.get("email_verified", False)
    )


@router.post("/sync-profile")
async def sync_firebase_profile(
    body: SyncProfileRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Synchronizes Firebase user profile (from Google / Email login) into the database.
    Performs Just-In-Time (JIT) provisioning and updates login timestamp.
    """
    stmt = select(User).where((User.firebase_uid == body.firebase_uid) | (User.email == body.email))
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if user:
        user.firebase_uid = body.firebase_uid
        if body.display_name:
            user.display_name = body.display_name
        if body.avatar_url:
            user.avatar_url = body.avatar_url
        user.email_verified = body.email_verified or user.email_verified
        user.last_login_at = datetime.utcnow()
        if body.requested_role and user.role == "CITIZEN":
            # Allow initial role assignment if not privileged
            user.role = body.requested_role.upper()
    else:
        # Determine initial role: Check if government official email
        initial_role = "CITIZEN"
        if body.requested_role:
            initial_role = body.requested_role.upper()
        elif body.email.endswith("@tn.gov.in") or "official" in body.email:
            initial_role = "TAHSILDAR"

        username = body.email.split("@")[0] if body.email else f"user_{body.firebase_uid[:8]}"
        user = User(
            firebase_uid=body.firebase_uid,
            username=username,
            email=body.email,
            display_name=body.display_name or username,
            avatar_url=body.avatar_url,
            email_verified=body.email_verified or False,
            role=initial_role,
            district="Coimbatore",
            taluk="Kinathukadavu",
            firka="Kinathukadavu Firka",
            village_code="630401",
            last_login_at=datetime.utcnow()
        )
        db.add(user)

    await db.commit()
    await db.refresh(user)

    role_enum = RevenueRole.CITIZEN
    try:
        role_enum = RevenueRole(user.role.upper())
    except ValueError:
        pass

    return {
        "status": "synchronized",
        "user_id": user.id,
        "role": user.role,
        "jurisdiction": {
            "district": user.district,
            "taluk": user.taluk,
            "firka": user.firka,
            "village_code": user.village_code
        },
        "permissions": list(PERMISSION_MATRIX.get(role_enum, set()))
    }


DEMO_ACCOUNTS: Dict[str, Dict[str, Any]] = {
    "citizen@terravault.gov.in": {
        "username": "pattadar_citizen",
        "role": "CITIZEN",
        "name": "Thiru. S. Arumugam (Pattadar)",
        "district": "Coimbatore",
        "taluk": "Kinathukadavu",
        "firka": "Kinathukadavu Firka",
        "village_code": "630401"
    },
    "vao.kinathukadavu@tn.gov.in": {
        "username": "vao_kinathukadavu",
        "role": "VAO",
        "name": "K. Selvaraj (Village Administrative Officer)",
        "district": "Coimbatore",
        "taluk": "Kinathukadavu",
        "firka": "Kinathukadavu Firka",
        "village_code": "630401"
    },
    "ri.kinathukadavu@tn.gov.in": {
        "username": "ri_kinathukadavu",
        "role": "RI",
        "name": "M. Thangavel (Revenue Inspector)",
        "district": "Coimbatore",
        "taluk": "Kinathukadavu",
        "firka": "Kinathukadavu Firka",
        "village_code": "630401"
    },
    "tahsildar.kinathukadavu@tn.gov.in": {
        "username": "tahsildar_kinathukadavu",
        "role": "TAHSILDAR",
        "name": "R. Soundararajan (Tahsildar)",
        "district": "Coimbatore",
        "taluk": "Kinathukadavu",
        "firka": "Kinathukadavu Firka",
        "village_code": "630401"
    },
    "rdo.pollachi@tn.gov.in": {
        "username": "rdo_pollachi",
        "role": "RDO",
        "name": "Dr. P. Meenakshi, IAS (Revenue Divisional Officer)",
        "district": "Coimbatore",
        "taluk": "Kinathukadavu",
        "firka": "Pollachi Division",
        "village_code": "630401"
    },
    "collector.coimbatore@tn.gov.in": {
        "username": "collector_coimbatore",
        "role": "DISTRICT_COLLECTOR",
        "name": "Thiru Kranthi Kumar Pati, IAS (District Collector)",
        "district": "Coimbatore",
        "taluk": "Coimbatore HQ",
        "firka": "Apex District Command",
        "village_code": "630401"
    },
    "commercial.bank@sbi.co.in": {
        "username": "commercial_bank",
        "role": "BUSINESS",
        "name": "State Bank of India (Mortgage & Title Audit Desk)",
        "district": "Coimbatore",
        "taluk": "Commercial Branch",
        "firka": "Institutional Banking",
        "village_code": "630401"
    },
    "admin@terravault.gov.in": {
        "username": "admin",
        "role": "ADMIN",
        "name": "Terra_vault System Administrator",
        "district": "National HQ",
        "taluk": "Apex Tech Center",
        "firka": "DILRMP Command",
        "village_code": "000000"
    }
}

# Also map username keys for quick lookup
for _email, _info in list(DEMO_ACCOUNTS.items()):
    DEMO_ACCOUNTS[_info["username"]] = _info


@router.get("/roles")
def list_revenue_roles():
    """Returns statutory revenue hierarchy and metadata."""
    return [
        {"role": "CITIZEN", "title": "Citizen / Pattadar Desk", "desc": "Self-Service Patta, Mutation Requests & ZK Proofs"},
        {"role": "VAO", "title": "Village Administrative Officer (VAO)", "desc": "Ground Truth Verification & Adangal Records"},
        {"role": "RI", "title": "Revenue Inspector (RI)", "desc": "Firka Inspection & Encumbrance Cross-Check"},
        {"role": "TAHSILDAR", "title": "Tahsildar / Sub-Tahsildar", "desc": "Statutory Patta Orders & Blockchain Seal"},
        {"role": "RDO", "title": "Revenue Divisional Officer (RDO)", "desc": "1st Appellate Authority & Dispute Freezes"},
        {"role": "DISTRICT_COLLECTOR", "title": "District Collector Desk", "desc": "Apex Command, Fraud Overrides & Security Audits"},
        {"role": "BUSINESS", "title": "Commercial / Banking Title Desk", "desc": "Institutional Mortgage Clearance & Bulk Title Verification"},
        {"role": "ADMIN", "title": "System Administrator", "desc": "Full System Access, Blockchain Audits & User Management"}
    ]


@router.post("/token", response_model=Token)
async def login(form: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    # 1. Check DB first
    user = (await db.execute(select(User).where((User.username == form.username) | (User.email == form.username)))).scalar_one_or_none()
    if user and user.hashed_password and _verify_password(form.password, user.hashed_password):
        token = _create_token({
            "sub": user.username,
            "role": user.role,
            "district": user.district or "Coimbatore",
            "taluk": user.taluk or "Kinathukadavu",
            "village_code": user.village_code or "630401"
        }, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
        return Token(access_token=token, token_type="bearer", role=user.role)

    # 2. Check Demo Accounts fallback (Uniform password: TerraVault@2026)
    clean_user = form.username.lower().strip()
    if clean_user in DEMO_ACCOUNTS and (form.password == "TerraVault@2026" or form.password == "password123"):
        demo = DEMO_ACCOUNTS[clean_user]
        token = _create_token({
            "sub": demo["username"],
            "email": clean_user if "@" in clean_user else f"{demo['username']}@terravault.gov.in",
            "name": demo["name"],
            "role": demo["role"],
            "district": demo["district"],
            "taluk": demo["taluk"],
            "firka": demo["firka"],
            "village_code": demo["village_code"]
        }, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
        return Token(access_token=token, token_type="bearer", role=demo["role"])

    raise HTTPException(
        status_code=401,
        detail="Incorrect username or password. For demo testing, use password: TerraVault@2026",
        headers={"WWW-Authenticate": "Bearer"}
    )


@router.post("/persona-token")
async def get_persona_token(role: str = "TAHSILDAR", username: Optional[str] = None):
    """Generates JWT token with territorial claims for demo persona testing."""
    role_upper = role.upper()
    role_map = {
        "CITIZEN": {"sub": username or "pattadar_citizen", "email": "citizen@terravault.gov.in", "name": "Thiru. S. Arumugam (Pattadar)", "district": "Coimbatore", "taluk": "Kinathukadavu", "village_code": "630401"},
        "VAO": {"sub": username or "vao_kinathukadavu", "email": "vao.kinathukadavu@tn.gov.in", "name": "K. Selvaraj (VAO)", "district": "Coimbatore", "taluk": "Kinathukadavu", "firka": "Kinathukadavu Firka", "village_code": "630401"},
        "RI": {"sub": username or "ri_kinathukadavu", "email": "ri.kinathukadavu@tn.gov.in", "name": "M. Thangavel (RI)", "district": "Coimbatore", "taluk": "Kinathukadavu", "firka": "Kinathukadavu Firka", "village_code": "630401"},
        "TAHSILDAR": {"sub": username or "tahsildar_kinathukadavu", "email": "tahsildar.kinathukadavu@tn.gov.in", "name": "R. Soundararajan (Tahsildar)", "district": "Coimbatore", "taluk": "Kinathukadavu", "firka": "Kinathukadavu Firka", "village_code": "630401"},
        "RDO": {"sub": username or "rdo_pollachi", "email": "rdo.pollachi@tn.gov.in", "name": "Dr. P. Meenakshi, IAS (RDO)", "district": "Coimbatore", "division": "Pollachi Division", "taluk": "Kinathukadavu", "village_code": "630401"},
        "COLLECTOR": {"sub": username or "collector_coimbatore", "email": "collector.coimbatore@tn.gov.in", "name": "Thiru Kranthi Kumar Pati, IAS (Collector)", "district": "Coimbatore", "taluk": "Coimbatore HQ", "village_code": "630401"},
        "DISTRICT_COLLECTOR": {"sub": username or "collector_coimbatore", "email": "collector.coimbatore@tn.gov.in", "name": "Thiru Kranthi Kumar Pati, IAS (Collector)", "district": "Coimbatore", "taluk": "Coimbatore HQ", "village_code": "630401"},
        "BUSINESS": {"sub": username or "commercial_bank", "email": "commercial.bank@sbi.co.in", "name": "State Bank of India Audit Desk", "district": "Coimbatore", "taluk": "Commercial Branch", "village_code": "630401"},
        "ADMIN": {"sub": username or "admin", "email": "admin@terravault.gov.in", "name": "Terra_vault System Administrator", "district": "National HQ", "taluk": "Apex Command", "village_code": "000000"},
    }
    claims = role_map.get(role_upper, role_map["TAHSILDAR"]).copy()
    claims["role"] = role_upper
    
    token = _create_token(claims, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": role_upper,
        "claims": claims
    }
