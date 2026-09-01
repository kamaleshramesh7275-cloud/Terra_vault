"""Terra_vault — Auth API (JWT)"""
# Monkeypatch passlib bcrypt compatibility issue
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
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from core.models import User
from core.config import settings

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8 hours


class Token(BaseModel):
    access_token: str
    token_type: str
    role: str


def _hash_password(password: str) -> str:
    return pwd_context.hash(password)


def _verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def _create_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode["exp"] = expire
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")


async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(status_code=401, detail="Invalid credentials",
                                          headers={"WWW-Authenticate": "Bearer"})
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = (await db.execute(select(User).where(User.username == username))).scalar_one_or_none()
    if user is None:
        raise credentials_exception
    return user


@router.post("/token", response_model=Token)
async def login(form: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user = (await db.execute(select(User).where(User.username == form.username))).scalar_one_or_none()
    if not user or not _verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password",
                            headers={"WWW-Authenticate": "Bearer"})
    token = _create_token({"sub": user.username, "role": user.role},
                          timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return Token(access_token=token, token_type="bearer", role=user.role)


@router.post("/persona-token")
async def get_persona_token(role: str = "TAHSILDAR", username: Optional[str] = None):
    """Generates JWT token with territorial claims for demo persona testing."""
    role_upper = role.upper()
    role_map = {
        "CITIZEN": {"sub": username or "pattadar_citizen", "district": "Coimbatore", "taluk": "Kinathukadavu", "village_code": "630401"},
        "VAO": {"sub": username or "vao_kinathukadavu", "district": "Coimbatore", "taluk": "Kinathukadavu", "firka": "Kinathukadavu Firka", "village_code": "630401"},
        "RI": {"sub": username or "ri_kinathukadavu", "district": "Coimbatore", "taluk": "Kinathukadavu", "firka": "Kinathukadavu Firka"},
        "TAHSILDAR": {"sub": username or "tahsildar_kinathukadavu", "district": "Coimbatore", "taluk": "Kinathukadavu"},
        "RDO": {"sub": username or "rdo_pollachi", "district": "Coimbatore", "division": "Pollachi Division"},
        "DISTRICT_COLLECTOR": {"sub": username or "collector_coimbatore", "district": "Coimbatore"},
    }
    claims = role_map.get(role_upper, role_map["TAHSILDAR"])
    claims["role"] = role_upper
    
    token = _create_token(claims, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": role_upper,
        "claims": claims
    }
