"""
SmartCattle Net
core/security.py

Purpose
-------
All authentication and authorization primitives for the application:
- Password hashing and verification (bcrypt via passlib)
- JWT access-token creation and decoding (HS256 via python-jose)
- ``get_current_user`` — FastAPI async dependency that validates the
  Bearer token and returns the authenticated User ORM instance
- ``get_current_active_user`` — extends the above to enforce
  ``is_active == True``
- ``get_admin_user`` — further restricts to admin accounts

Design decisions
----------------
- HS256 is used instead of RS256 because the system is single-service.
  If a micro-service split is introduced, switch to RS256 and provide
  the public key to verifying services.
- ``ACCESS_TOKEN_EXPIRE_MINUTES`` defaults to 60 minutes.  Override via
  the ``ACCESS_TOKEN_EXPIRE_MINUTES`` env variable.
- The ``sub`` claim stores ``str(user.id)`` (UUID string) — not the email
  — so the claim remains stable even if the user changes their email.
- Token type ``"bearer"`` is validated in the decode step to guard
  against accidentally accepting refresh tokens on access-token routes.

Dependencies
------------
- python-jose[cryptography]
- passlib[bcrypt]
- fastapi
- sqlalchemy.ext.asyncio
- app.core.config  (settings.JWT_SECRET)
- app.database.session  (get_db)
- app.database.models  (User)
- app.utils.logger
"""

from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.database.models import User
from app.database.session import get_db
from app.utils.logger import get_logger

logger = get_logger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

_ALGORITHM: str = "HS256"
_TOKEN_TYPE: str = "bearer"
_DEFAULT_EXPIRE_MINUTES: int = 60

_ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
    getattr(settings, "ACCESS_TOKEN_EXPIRE_MINUTES", _DEFAULT_EXPIRE_MINUTES)
)

# ---------------------------------------------------------------------------
# Password context (bcrypt)
# ---------------------------------------------------------------------------

_pwd_context: CryptContext = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


def hash_password(plain_password: str) -> str:
    """
    Hash *plain_password* using bcrypt.

    Parameters
    ----------
    plain_password : str
        The raw user password.

    Returns
    -------
    str
        A bcrypt hash string safe to store in the database.
    """
    return _pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify *plain_password* against a stored bcrypt hash.

    Parameters
    ----------
    plain_password : str
        The raw password submitted by the user.
    hashed_password : str
        The stored bcrypt hash from the database.

    Returns
    -------
    bool
        ``True`` if the password matches, ``False`` otherwise.
    """
    return _pwd_context.verify(plain_password, hashed_password)


# ---------------------------------------------------------------------------
# JWT helpers
# ---------------------------------------------------------------------------


def create_access_token(
    user_id: uuid.UUID,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Create a signed JWT access token for *user_id*.

    Claims
    ------
    - ``sub``  : ``str(user_id)``  — stable user identifier
    - ``type`` : ``"bearer"``      — token type guard
    - ``iat``  : issued-at (UTC)
    - ``exp``  : expiry (UTC)

    Parameters
    ----------
    user_id : uuid.UUID
        The primary key of the authenticated user.
    expires_delta : timedelta | None
        Custom TTL.  Defaults to ``ACCESS_TOKEN_EXPIRE_MINUTES``.

    Returns
    -------
    str
        A compact, URL-safe JWT string.
    """
    now = datetime.now(tz=timezone.utc)
    delta = expires_delta or timedelta(minutes=_ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = now + delta

    payload = {
        "sub": str(user_id),
        "type": _TOKEN_TYPE,
        "iat": now,
        "exp": expire,
    }

    token = jwt.encode(payload, settings.JWT_SECRET, algorithm=_ALGORITHM)
    logger.debug("Access token created for user_id=%s exp=%s", user_id, expire)
    return token


def decode_access_token(token: str) -> str:
    """
    Decode and validate a JWT access token.

    Validates the signature, expiry, and ``type`` claim.

    Parameters
    ----------
    token : str
        Raw JWT string (without the ``"Bearer "`` prefix).

    Returns
    -------
    str
        The ``sub`` claim value (user UUID as a string).

    Raises
    ------
    HTTPException
        401 if the token is invalid, expired, or has the wrong type.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload: dict = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[_ALGORITHM],
        )
    except JWTError as exc:
        logger.warning("JWT decode failed: %s", exc)
        raise credentials_exception from exc

    # Validate token type claim
    if payload.get("type") != _TOKEN_TYPE:
        logger.warning("JWT rejected: wrong token type %r", payload.get("type"))
        raise credentials_exception

    sub: Optional[str] = payload.get("sub")
    if sub is None:
        logger.warning("JWT rejected: missing sub claim")
        raise credentials_exception

    return sub


# ---------------------------------------------------------------------------
# FastAPI dependencies
# ---------------------------------------------------------------------------

_bearer_scheme = HTTPBearer(auto_error=True)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    FastAPI dependency: validate Bearer token and return the User.

    Flow
    ----
    1. Extract the raw token from the ``Authorization: Bearer <token>`` header.
    2. Decode and validate the JWT.
    3. Look up the user by UUID in the database.
    4. Return the ``User`` ORM instance.

    Parameters
    ----------
    credentials : HTTPAuthorizationCredentials
        Injected by FastAPI's ``HTTPBearer`` scheme.
    db : AsyncSession
        Injected database session from ``get_db``.

    Returns
    -------
    User
        The authenticated user ORM object.

    Raises
    ------
    HTTPException
        401 if the token is invalid or the user does not exist.
    """
    token: str = credentials.credentials
    user_id_str: str = decode_access_token(token)

    try:
        user_uuid = uuid.UUID(user_id_str)
    except ValueError:
        logger.warning("JWT sub is not a valid UUID: %r", user_id_str)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    result = await db.execute(select(User).where(User.id == user_uuid))
    user: Optional[User] = result.scalars().first()

    if user is None:
        logger.warning("Authenticated user not found in DB: %s", user_uuid)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    FastAPI dependency: ensure the authenticated user is active.

    Parameters
    ----------
    current_user : User
        Injected from ``get_current_user``.

    Returns
    -------
    User
        The active, authenticated user.

    Raises
    ------
    HTTPException
        403 if ``user.is_active`` is ``False``.
    """
    if not current_user.is_active:
        logger.warning("Inactive user attempted access: %s", current_user.id)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive.",
        )
    return current_user


async def get_admin_user(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """
    FastAPI dependency: ensure the authenticated user is an admin.

    Parameters
    ----------
    current_user : User
        Injected from ``get_current_active_user``.

    Returns
    -------
    User
        The active admin user.

    Raises
    ------
    HTTPException
        403 if ``user.is_admin`` is ``False``.
    """
    if not current_user.is_admin:
        logger.warning("Non-admin user attempted admin access: %s", current_user.id)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required.",
        )
    return current_user
