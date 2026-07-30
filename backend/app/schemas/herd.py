from pydantic import BaseModel
from typing import Optional


class HerdItem(BaseModel):
    cow_id: str
    breed: Optional[str]
    parity: Optional[int]
    days_in_milk: Optional[int]
    is_active: bool


class HerdResponse(BaseModel):
    cows: list[HerdItem]
from pydantic import BaseModel
from typing import Optional


class CreateCowRequest(BaseModel):
    cow_id: str
    breed: Optional[str] = None
    parity: Optional[int] = None
    days_in_milk: Optional[int] = None
    notes: Optional[str] = None


class CreateCowResponse(BaseModel):
    message: str
    cow_id: str
class CowDetailsResponse(BaseModel):
    cow_id: str
    breed: str | None = None
    parity: int | None = None
    days_in_milk: int | None = None
    notes: str | None = None
    is_active: bool
class UpdateCowRequest(BaseModel):
    breed: str | None = None
    parity: int | None = None
    days_in_milk: int | None = None
    notes: str | None = None


class UpdateCowResponse(BaseModel):
    message: str
    cow_id: str   
class DeleteCowResponse(BaseModel):
    message: str
    cow_id: str     