from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.schemas.herd import (
    HerdResponse,
    CreateCowRequest,
    CreateCowResponse,
    CowDetailsResponse,
    UpdateCowRequest,
    UpdateCowResponse,
    DeleteCowResponse,
)
from app.services.herd_service import HerdService

from app.core.security import get_current_user
router = APIRouter(
    prefix="/herd",
    tags=["Herd"],
)


@router.get(
    "",
    response_model=HerdResponse,
)
async def get_all_cows(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await HerdService.get_all_cows(
        db,
        current_user,
    )
@router.post(
    "",
    response_model=CreateCowResponse,
)
async def create_cow(
    request: CreateCowRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await HerdService.create_cow(
        db,
        current_user,
        request,
    )   
    
@router.get(
    "/{cow_id}",
    response_model=CowDetailsResponse,
)
async def get_cow(
    cow_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await HerdService.get_cow_by_id(
        db,
        current_user,
        cow_id,
    )  
@router.put(
    "/{cow_id}",
    response_model=UpdateCowResponse,
)
async def update_cow(
    cow_id: str,
    request: UpdateCowRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await HerdService.update_cow(
        db,
        current_user,
        cow_id,
        request,
    ) 
@router.delete(
    "/{cow_id}",
    response_model=DeleteCowResponse,
)
async def delete_cow(
    cow_id: str,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await HerdService.delete_cow(
        db,
        current_user,
        cow_id,
    )          