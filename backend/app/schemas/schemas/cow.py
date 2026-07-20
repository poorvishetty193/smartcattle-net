"""
SmartCattle Net
schemas/schemas/cow.py

Purpose
-------
Pydantic models (schemas) for all cow-management API endpoints.

Schemas defined
---------------
- CowCreate       — POST   /api/v1/cows          (request body)
- CowUpdate       — PATCH  /api/v1/cows/{id}     (request body, all optional)
- CowOut          — GET    /api/v1/cows/{id}     (response body)
- CowListResponse — GET    /api/v1/cows          (paginated list response)

Design decisions
----------------
- ``CowUpdate`` uses all-optional fields so callers can perform a true
  partial update (PATCH semantics).  Unset fields are ignored by the
  service layer using ``model.model_dump(exclude_unset=True)``.
- ``cow_id`` (farm-assigned string) is validated to be non-empty and
  stripped of surrounding whitespace.
- ``parity`` and ``days_in_milk`` have sensible biological range guards
  (parity 1–20, DIM 0–500) to catch obvious data-entry errors early.
- ``CowOut`` sets ``from_attributes=True`` so it can be built directly
  from a SQLAlchemy ``Cow`` ORM instance.

Dependencies
------------
- pydantic >= 2.0
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ---------------------------------------------------------------------------
# CowCreate — Register a new cow
# ---------------------------------------------------------------------------


class CowCreate(BaseModel):
    """
    Request body for ``POST /api/v1/cows``.

    Fields
    ------
    cow_id : str
        Farm-assigned identifier (e.g. ``"C04"``).
        Must be non-empty after stripping whitespace.
    breed : str | None
        Optional breed name (e.g. ``"Holstein"``, ``"Jersey"``).
    parity : int | None
        Current lactation number (1–20).
    days_in_milk : int | None
        Days since last calving (0–500).
    notes : str | None
        Free-text farm notes.
    """

    cow_id: str = Field(
        ...,
        min_length=1,
        max_length=64,
        description="Farm-assigned cow identifier (e.g. 'C04').",
        examples=["C04"],
    )
    breed: Optional[str] = Field(
        default=None,
        max_length=128,
        description="Breed name (e.g. 'Holstein', 'Jersey').",
        examples=["Holstein"],
    )
    parity: Optional[int] = Field(
        default=None,
        ge=1,
        le=20,
        description="Current lactation number (1 = first calf, max 20).",
        examples=[2],
    )
    days_in_milk: Optional[int] = Field(
        default=None,
        ge=0,
        le=500,
        description="Days since last calving (0–500).",
        examples=[120],
    )
    notes: Optional[str] = Field(
        default=None,
        max_length=2000,
        description="Free-text farm notes.",
        examples=["High producer, monitor SCC weekly."],
    )

    @field_validator("cow_id")
    @classmethod
    def strip_cow_id(cls, v: str) -> str:
        """Strip whitespace and enforce non-empty after stripping."""
        stripped = v.strip()
        if not stripped:
            raise ValueError("cow_id must not be blank or whitespace only.")
        return stripped


# ---------------------------------------------------------------------------
# CowUpdate — Partial update (PATCH)
# ---------------------------------------------------------------------------


class CowUpdate(BaseModel):
    """
    Request body for ``PATCH /api/v1/cows/{cow_uuid}``.

    All fields are optional — only provided fields are updated.
    Use ``model.model_dump(exclude_unset=True)`` in the service layer
    to get only the explicitly sent values.

    Fields
    ------
    cow_id : str | None
        New farm-assigned identifier.
    breed : str | None
        Updated breed name.
    parity : int | None
        Updated lactation number.
    days_in_milk : int | None
        Updated DIM.
    notes : str | None
        Updated notes.
    is_active : bool | None
        Set to ``False`` to soft-delete / retire the cow.
    """

    cow_id: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=64,
        description="New farm-assigned cow identifier.",
        examples=["C04-A"],
    )
    breed: Optional[str] = Field(
        default=None,
        max_length=128,
        description="Updated breed name.",
    )
    parity: Optional[int] = Field(
        default=None,
        ge=1,
        le=20,
        description="Updated lactation number.",
    )
    days_in_milk: Optional[int] = Field(
        default=None,
        ge=0,
        le=500,
        description="Updated days in milk.",
    )
    notes: Optional[str] = Field(
        default=None,
        max_length=2000,
        description="Updated farm notes.",
    )
    is_active: Optional[bool] = Field(
        default=None,
        description="Set False to retire/soft-delete the cow.",
    )

    @field_validator("cow_id")
    @classmethod
    def strip_cow_id(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        stripped = v.strip()
        if not stripped:
            raise ValueError("cow_id must not be blank or whitespace only.")
        return stripped


# ---------------------------------------------------------------------------
# CowOut — Safe public representation of a Cow
# ---------------------------------------------------------------------------


class CowOut(BaseModel):
    """
    Response body for cow endpoints.

    Built directly from a SQLAlchemy ``Cow`` ORM instance via
    ``CowOut.model_validate(cow_orm_object)``.

    Fields
    ------
    id : uuid.UUID
        Internal system identifier.
    cow_id : str
        Farm-assigned identifier.
    owner_id : uuid.UUID
        UUID of the owning User.
    breed : str | None
    parity : int | None
    days_in_milk : int | None
    notes : str | None
    is_active : bool
    created_at : datetime
    updated_at : datetime
    """

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID = Field(..., description="Internal UUID of the cow record.")
    cow_id: str = Field(..., description="Farm-assigned cow identifier.")
    owner_id: uuid.UUID = Field(..., description="UUID of the owning user.")
    breed: Optional[str] = Field(None, description="Breed name.")
    parity: Optional[int] = Field(None, description="Current lactation number.")
    days_in_milk: Optional[int] = Field(None, description="Days since last calving.")
    notes: Optional[str] = Field(None, description="Farm notes.")
    is_active: bool = Field(..., description="True = active in the herd.")
    created_at: datetime = Field(..., description="UTC creation timestamp.")
    updated_at: datetime = Field(..., description="UTC last-update timestamp.")


# ---------------------------------------------------------------------------
# CowListResponse — Paginated list response
# ---------------------------------------------------------------------------


class CowListResponse(BaseModel):
    """
    Response body for ``GET /api/v1/cows`` (paginated list).

    Fields
    ------
    total : int
        Total number of cows matching the query (before pagination).
    page : int
        Current page number (1-indexed).
    page_size : int
        Number of items per page.
    items : list[CowOut]
        Cow records for the current page.
    """

    total: int = Field(..., description="Total matching cows.", examples=[42])
    page: int = Field(..., description="Current page (1-indexed).", examples=[1])
    page_size: int = Field(..., description="Items per page.", examples=[20])
    items: List[CowOut] = Field(..., description="Cow records for this page.")
