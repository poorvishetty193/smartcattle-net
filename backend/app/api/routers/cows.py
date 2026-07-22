"""
SmartCattle Net
api/routers/cows.py

Purpose
-------
Cow registry router.

Provides endpoints to manage the farm's cows.

Endpoints
---------
- GET  /cows
- POST /cows
- GET  /cows/{cow_id}
"""

import uuid
from typing import Any, List

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.deps import CurrentUser, SessionDep
from app.database.models import Cow
from app.schemas.schemas.cow import CowCreate, CowOut
from app.utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(
    prefix="/cows",
    tags=["cows"],
)


@router.get("", response_model=List[CowOut])
async def list_cows(
    db: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve all cows belonging to the current user.
    """

    stmt = (
        select(Cow)
        .where(Cow.owner_id == current_user.id)
        .offset(skip)
        .limit(limit)
    )

    result = await db.execute(stmt)
    cows = result.scalars().all()

    return cows


@router.post(
    "",
    response_model=CowOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_cow(
    db: SessionDep,
    current_user: CurrentUser,
    cow_in: CowCreate,
) -> Any:
    """
    Register a new cow.
    """

    stmt = select(Cow).where(
        Cow.owner_id == current_user.id,
        Cow.cow_id == cow_in.cow_id,
    )

    result = await db.execute(stmt)

    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cow '{cow_in.cow_id}' already exists.",
        )

    db_cow = Cow(
        owner_id=current_user.id,
        cow_id=cow_in.cow_id,
        breed=cow_in.breed,
        parity=cow_in.parity,
        days_in_milk=cow_in.days_in_milk,
        notes=cow_in.notes,
    )

    db.add(db_cow)

    await db.commit()
    await db.refresh(db_cow)

    logger.info(
        "Cow %s created by user %s",
        db_cow.cow_id,
        current_user.id,
    )

    return db_cow


@router.get(
    "/{cow_id}",
    response_model=CowOut,
)
async def get_cow(
    cow_id: uuid.UUID,
    db: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Retrieve one cow by UUID.
    """

    stmt = select(Cow).where(
        Cow.id == cow_id,
        Cow.owner_id == current_user.id,
    )

    result = await db.execute(stmt)

    cow = result.scalar_one_or_none()

    if cow is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cow not found.",
        )

    return cow