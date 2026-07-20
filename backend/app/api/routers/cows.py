"""
SmartCattle Net
api/routers/cows.py

Purpose
-------
Cow registry router.

Provides endpoints to manage the farm's cows. Each cow is tied to the 
farm/user that created it.

Endpoints
---------
- GET  /cows          : List all cows for the logged-in user
- POST /cows          : Register a new cow
- GET  /cows/{cow_id} : Get details of a specific cow
"""

import uuid
from typing import Any, List

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.deps import CurrentUser, SessionDep
from app.database.models import Cow
from app.schemas.schemas.cow import CowCreate, CowResponse
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/cows", tags=["cows"])


@router.get("", response_model=List[CowResponse])
async def list_cows(
    db: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve all cows registered to the current user's farm.
    """
    stmt = (
        select(Cow)
        .where(Cow.user_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .order_by(Cow.label)
    )
    result = await db.execute(stmt)
    cows = result.scalars().all()
    
    return cows


@router.post("", response_model=CowResponse, status_code=status.HTTP_201_CREATED)
async def create_cow(
    db: SessionDep,
    current_user: CurrentUser,
    cow_in: CowCreate,
) -> Any:
    """
    Register a new cow into the system.
    """
    # Check for duplicate label within the same farm
    stmt = select(Cow).where(
        Cow.user_id == current_user.id,
        Cow.label == cow_in.label
    )
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A cow with label '{cow_in.label}' already exists on this farm.",
        )
        
    db_cow = Cow(
        user_id=current_user.id,
        label=cow_in.label,
        breed=cow_in.breed,
        birth_date=cow_in.birth_date,
    )
    db.add(db_cow)
    await db.commit()
    await db.refresh(db_cow)
    
    logger.info("New cow registered: %s (user: %s)", db_cow.label, current_user.id)
    return db_cow


@router.get("/{cow_id}", response_model=CowResponse)
async def get_cow(
    db: SessionDep,
    current_user: CurrentUser,
    cow_id: uuid.UUID,
) -> Any:
    """
    Get detailed information about a specific cow.
    """
    stmt = select(Cow).where(
        Cow.id == cow_id,
        Cow.user_id == current_user.id
    )
    result = await db.execute(stmt)
    cow = result.scalar_one_or_none()
    
    if not cow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cow not found",
        )
        
    return cow
