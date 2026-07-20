"""
SmartCattle Net
api/deps.py

Purpose
-------
Centralised FastAPI dependencies.

Provides reusable `Annotated` type aliases for dependency injection 
across API routers. This reduces boilerplate in endpoint signatures.

Dependencies
------------
- app.database.session (get_db)
- app.core.security (get_current_active_user, get_current_active_superuser)
- app.database.models.User
- fastapi (Depends)
"""

from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_active_superuser, get_current_active_user
from app.database.models import User
from app.database.session import get_db

# ---------------------------------------------------------------------------
# Database Session Dependency
# ---------------------------------------------------------------------------
# Usage in route: async def my_route(db: SessionDep):

SessionDep = Annotated[AsyncSession, Depends(get_db)]

# ---------------------------------------------------------------------------
# Current User Dependencies
# ---------------------------------------------------------------------------
# Usage in route: async def my_route(user: CurrentUser):

CurrentUser = Annotated[User, Depends(get_current_active_user)]
CurrentSuperuser = Annotated[User, Depends(get_current_active_superuser)]
