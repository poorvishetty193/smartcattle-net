from fastapi import HTTPException
from sqlalchemy import select

from app.database.models import Cow
from app.schemas.herd import (
    HerdItem,
    HerdResponse,
    CreateCowRequest,
    CreateCowResponse,
    CowDetailsResponse,
    UpdateCowRequest,
    UpdateCowResponse,
    DeleteCowResponse,
)


class HerdService:
    """
    Herd business logic.
    """

    @staticmethod
    async def get_all_cows(
        db,
        current_user,
    ) -> HerdResponse:

        stmt = (
            select(Cow)
            .where(
                Cow.owner_id == current_user.id,
                Cow.is_active == True,
            )
            .order_by(Cow.cow_id)
        )

        result = await db.execute(stmt)

        rows = result.scalars().all()

        cows = [
            HerdItem(
                cow_id=row.cow_id,
                breed=row.breed,
                parity=row.parity,
                days_in_milk=row.days_in_milk,
                is_active=row.is_active,
            )
            for row in rows
        ]

        return HerdResponse(cows=cows)

    @staticmethod
    async def create_cow(
        db,
        current_user,
        request: CreateCowRequest,
    ) -> CreateCowResponse:

        cow = Cow(
            cow_id=request.cow_id,
            owner_id=current_user.id,
            breed=request.breed,
            parity=request.parity,
            days_in_milk=request.days_in_milk,
            notes=request.notes,
            is_active=True,
        )

        db.add(cow)

        await db.commit()

        await db.refresh(cow)

        return CreateCowResponse(
            message="Cow added successfully",
            cow_id=cow.cow_id,
        )

    @staticmethod
    async def get_cow_by_id(
        db,
        current_user,
        cow_id: str,
    ) -> CowDetailsResponse:

        stmt = (
            select(Cow)
            .where(
                Cow.owner_id == current_user.id,
                Cow.cow_id == cow_id,
                Cow.is_active == True,
            )
        )

        result = await db.execute(stmt)

        cow = result.scalar_one_or_none()

        if cow is None:
            raise HTTPException(
                status_code=404,
                detail="Cow not found",
            )

        return CowDetailsResponse(
            cow_id=cow.cow_id,
            breed=cow.breed,
            parity=cow.parity,
            days_in_milk=cow.days_in_milk,
            notes=cow.notes,
            is_active=cow.is_active,
        )
    @staticmethod
    async def update_cow(
        db,
        current_user,
        cow_id: str,
        request: UpdateCowRequest,
    ) -> UpdateCowResponse:

        stmt = select(Cow).where(
            Cow.owner_id == current_user.id,
            Cow.cow_id == cow_id,
            Cow.is_active == True,
        )

        result = await db.execute(stmt)

        cow = result.scalar_one_or_none()

        if cow is None:
            raise HTTPException(
                status_code=404,
                detail="Cow not found",
            )

        if request.breed is not None:
            cow.breed = request.breed

        if request.parity is not None:
            cow.parity = request.parity

        if request.days_in_milk is not None:
            cow.days_in_milk = request.days_in_milk

        if request.notes is not None:
            cow.notes = request.notes

        await db.commit()

        await db.refresh(cow)

        return UpdateCowResponse(
            message="Cow updated successfully",
            cow_id=cow.cow_id,
        ) 
    @staticmethod
    async def delete_cow(
        db,
        current_user,
        cow_id: str,
    ) -> DeleteCowResponse:

        stmt = select(Cow).where(
            Cow.owner_id == current_user.id,
            Cow.cow_id == cow_id,
            Cow.is_active == True,
        )

        result = await db.execute(stmt)

        cow = result.scalar_one_or_none()

        if cow is None:
            raise HTTPException(
                status_code=404,
                detail="Cow not found",
            )

        # Soft delete
        cow.is_active = False

        await db.commit()

        return DeleteCowResponse(
            message="Cow deleted successfully",
            cow_id=cow.cow_id,
        )         
              