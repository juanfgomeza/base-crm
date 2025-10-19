from typing import Any, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()


@router.get("/", response_model=schemas.PaginatedResponse[schemas.User])
def read_users(
    db: Session = Depends(deps.get_db),
    skip: int = Query(0, alias="page", ge=0),
    limit: int = Query(10, alias="size", ge=1, le=100),
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """Retrieve users (admin only)"""
    # Convert page to skip (page is 1-indexed from frontend)
    actual_skip = (skip - 1) * limit if skip > 0 else 0

    users, total = crud.user.get_multi(db, skip=actual_skip, limit=limit)
    return {
        "items": users,
        "total": total,
        "page": skip,
        "size": limit,
    }


@router.post("/", response_model=schemas.User)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.UserCreate,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """Create new user (admin only)"""
    user = crud.user.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="A user with this email already exists",
        )
    user = crud.user.create(db, obj_in=user_in)
    return user


@router.get("/{id}", response_model=schemas.User)
def read_user_by_id(
    id: UUID,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """Get user by ID (admin only)"""
    user = crud.user.get(db, id=id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/{id}", response_model=schemas.User)
def update_user(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    user_in: schemas.UserUpdate,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """Update user (admin only)"""
    user = crud.user.get(db, id=id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user = crud.user.update(db, db_obj=user, obj_in=user_in)
    return user


@router.delete("/{id}", response_model=schemas.User)
def delete_user(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """Delete user (admin only)"""
    user = crud.user.get(db, id=id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    user = crud.user.remove(db, id=id)
    return user
