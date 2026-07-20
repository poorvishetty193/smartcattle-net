"""
SmartCattle Net
api/routers/auth.py

Purpose
-------
Authentication router handling user login, JWT token generation, 
and current user profile retrieval.

Endpoints
---------
- POST /login : OAuth2 password flow (returns JWT)
- GET  /me    : Retrieve current authenticated user profile
- POST /signup: Register a new user (admin only in production, but open here for testing)
"""

from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select

from app.api.deps import CurrentUser, SessionDep
from app.core.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.database.models import User
from app.schemas.schemas.auth import Token, UserCreate, UserResponse
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
async def login_access_token(
    db: SessionDep,
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> Any:
    """
    OAuth2 compatible token login, getting an access token for future requests.
    """
    logger.info("Login attempt for email: %s", form_data.username)
    
    stmt = select(User).where(User.email == form_data.username)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not verify_password(form_data.password, user.hashed_password):
        logger.warning("Failed login for email: %s", form_data.username)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not user.is_active:
        logger.warning("Inactive user login attempt: %s", form_data.username)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Inactive user"
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=str(user.id), expires_delta=access_token_expires
    )
    
    logger.info("Successful login for user: %s", user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.post("/signup", response_model=UserResponse)
async def register_user(
    db: SessionDep,
    user_in: UserCreate,
) -> Any:
    """
    Register a new farm/user account.
    """
    # Check if user exists
    stmt = select(User).where(User.email == user_in.email)
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system.",
        )
    
    # Create new user
    db_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        farm_name=user_in.farm_name,
        is_active=True,
        is_superuser=False,
    )
    
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    
    logger.info("New user registered: %s (farm: %s)", db_user.email, db_user.farm_name)
    return db_user


@router.get("/me", response_model=UserResponse)
async def read_current_user(
    current_user: CurrentUser,
) -> Any:
    """
    Get current logged in user profile details.
    """
    return current_user
