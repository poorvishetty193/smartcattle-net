"""
SmartCattle Net
api/routers/auth.py

Authentication Router
"""

from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select

from app.api.deps import CurrentUser, SessionDep
from app.core.config import settings
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.database.models import User
from app.schemas.schemas.auth import (
    Token,
    UserCreate,
    UserOut,
)
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


@router.post("/login", response_model=Token)
async def login_access_token(
    db: SessionDep,
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> Any:
    """
    Login and return JWT access token.
    """

    logger.info("Login attempt for email: %s", form_data.username)

    stmt = select(User).where(User.email == form_data.username)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if user is None or not verify_password(
        form_data.password,
        user.hashed_password,
    ):
        logger.warning("Invalid login: %s", form_data.username)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )

    access_token_expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    access_token = create_access_token(
        user_id=user.id,
        expires_delta=access_token_expires,
    )

    logger.info("User logged in: %s", user.email)

    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/signup", response_model=UserOut)
async def register_user(
    db: SessionDep,
    user_in: UserCreate,
) -> Any:
    """
    Register a new user.
    """

    stmt = select(User).where(User.email == user_in.email)
    result = await db.execute(stmt)

    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered.",
        )

    db_user = User(
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name,
        is_active=True,
        is_admin=False,
    )

    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)

    logger.info("New user registered: %s", db_user.email)

    return db_user


@router.get("/me", response_model=UserOut)
async def read_current_user(
    current_user: CurrentUser,
) -> Any:
    """
    Return the authenticated user's profile.
    """
    return current_user