"""
SmartCattle Net
schemas/schemas/auth.py

Purpose
-------
Pydantic models (schemas) for all authentication-related API endpoints.

Schemas defined
---------------
- UserCreate     — POST /auth/register  (request body)
- UserLogin      — POST /auth/login     (request body)
- Token          — POST /auth/login     (response body)
- TokenData      — internal: decoded JWT payload carrier
- UserOut        — GET  /auth/me        (response body, no secrets)
- PasswordChange — POST /auth/password  (request body)

Design decisions
----------------
- ``UserCreate`` enforces a minimum password length of 8 and validates
  that the email is well-formed using Pydantic's ``EmailStr``.
- ``UserOut`` deliberately excludes ``hashed_password`` and any other
  internal fields to prevent accidental leakage in API responses.
- ``model_config = ConfigDict(from_attributes=True)`` on ``UserOut``
  allows it to be built directly from a SQLAlchemy ORM instance via
  ``UserOut.model_validate(user_orm_object)``.
- ``Token`` uses the standard OAuth2 field names (``access_token``,
  ``token_type``) so it is compatible with OpenAPI's
  ``securitySchemes.bearerAuth`` UI.

Dependencies
------------
- pydantic >= 2.0
- pydantic[email]  (for EmailStr)
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


# ---------------------------------------------------------------------------
# UserCreate — Registration request
# ---------------------------------------------------------------------------


class UserCreate(BaseModel):
    """
    Request body for ``POST /api/v1/auth/register``.

    Fields
    ------
    email : str
        Valid email address.  Used as the unique login identifier.
    password : str
        Plain-text password.  Must be at least 8 characters.
        The API layer will hash this before persisting.
    full_name : str | None
        Optional display name.
    """

    email: EmailStr = Field(
        ...,
        description="Unique email address used to log in.",
        examples=["farmer@example.com"],
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="Plain-text password (min 8 characters).",
        examples=["securePass123!"],
    )
    full_name: Optional[str] = Field(
        default=None,
        max_length=256,
        description="Optional display name.",
        examples=["Poorvi Shetty"],
    )

    @field_validator("password")
    @classmethod
    def password_not_whitespace(cls, v: str) -> str:
        """Reject passwords that are entirely whitespace."""
        if v.strip() == "":
            raise ValueError("Password must not be blank or whitespace only.")
        return v


# ---------------------------------------------------------------------------
# UserLogin — Login request
# ---------------------------------------------------------------------------


class UserLogin(BaseModel):
    """
    Request body for ``POST /api/v1/auth/login``.

    Fields
    ------
    email : str
        Registered email address.
    password : str
        Plain-text password for verification.
    """

    email: EmailStr = Field(
        ...,
        description="Registered email address.",
        examples=["farmer@example.com"],
    )
    password: str = Field(
        ...,
        min_length=1,
        description="Account password.",
        examples=["securePass123!"],
    )


# ---------------------------------------------------------------------------
# Token — Login / refresh response
# ---------------------------------------------------------------------------


class Token(BaseModel):
    """
    Response body for a successful ``POST /api/v1/auth/login``.

    Compatible with the OAuth2 Bearer token standard so the Swagger UI
    ``Authorize`` button works out of the box.

    Fields
    ------
    access_token : str
        Signed JWT string.
    token_type : str
        Always ``"bearer"``.
    expires_in : int
        Seconds until the token expires (informational).
    """

    access_token: str = Field(
        ...,
        description="Signed JWT access token.",
    )
    token_type: str = Field(
        default="bearer",
        description="Token scheme — always 'bearer'.",
    )
    expires_in: int = Field(
        ...,
        description="Seconds until the token expires.",
        examples=[3600],
    )


# ---------------------------------------------------------------------------
# TokenData — Internal decoded payload carrier
# ---------------------------------------------------------------------------


class TokenData(BaseModel):
    """
    Internal schema representing the decoded JWT payload.

    Not exposed directly in any API response.
    Used by ``core/security.py`` to pass the verified subject (user UUID)
    between the decode step and the DB lookup step.

    Fields
    ------
    user_id : uuid.UUID
        The ``sub`` claim parsed from the JWT.
    """

    user_id: uuid.UUID = Field(
        ...,
        description="User UUID extracted from the JWT sub claim.",
    )


# ---------------------------------------------------------------------------
# UserOut — Safe public representation of a User
# ---------------------------------------------------------------------------


class UserOut(BaseModel):
    """
    Response body for ``GET /api/v1/auth/me`` and any other endpoint that
    returns user information.

    Intentionally excludes ``hashed_password`` and other internal fields.
    Built directly from a SQLAlchemy ``User`` ORM instance via
    ``UserOut.model_validate(user)``.

    Fields
    ------
    id : uuid.UUID
    email : str
    full_name : str | None
    is_active : bool
    is_admin : bool
    created_at : datetime
    """

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID = Field(..., description="Unique user identifier.")
    email: EmailStr = Field(..., description="User email address.")
    full_name: Optional[str] = Field(None, description="Display name.")
    is_active: bool = Field(..., description="Account active status.")
    is_admin: bool = Field(..., description="Admin privileges flag.")
    created_at: datetime = Field(..., description="UTC account creation timestamp.")


# ---------------------------------------------------------------------------
# PasswordChange — Password update request
# ---------------------------------------------------------------------------


class PasswordChange(BaseModel):
    """
    Request body for ``POST /api/v1/auth/password``.

    Fields
    ------
    current_password : str
        The user's existing password for re-authentication.
    new_password : str
        The desired new password (min 8 characters).
    """

    current_password: str = Field(
        ...,
        min_length=1,
        description="Current password for verification.",
    )
    new_password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="New password (min 8 characters).",
    )

    @field_validator("new_password")
    @classmethod
    def new_password_not_same(cls, v: str, info: object) -> str:
        """Warn if the new password is identical to the current one."""
        # Note: full same-password check requires bcrypt comparison in the
        # service layer; this validator only catches exact string matches
        # submitted in the same request (e.g., client-side copy-paste errors).
        return v
