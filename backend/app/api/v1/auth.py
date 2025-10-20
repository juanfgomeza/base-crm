from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app import crud, schemas
from app.api import deps
from app.core import security
from app.core.config import settings

router = APIRouter()


@router.post("/login", response_model=schemas.Token)
def login(
    db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """OAuth2 compatible token login"""
    user = crud.user.authenticate(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not crud.user.is_active(user):
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }


@router.get("/me", response_model=schemas.User)
def read_users_me(
    current_user: schemas.User = Depends(deps.get_current_active_user),
) -> Any:
    """Get current user"""
    return current_user


@router.post("/password-reset/request")
def request_password_reset(
    password_reset: schemas.PasswordResetRequest,
    db: Session = Depends(deps.get_db),
) -> Any:
    """Request password reset token"""
    token = crud.user.create_password_reset_token(db, email=password_reset.email)

    # Always return success to prevent email enumeration
    # In production, send email with token here
    return {
        "message": "Si el email existe, recibirás un enlace para restablecer tu contraseña"
    }


@router.post("/password-reset/confirm")
def confirm_password_reset(
    password_reset: schemas.PasswordResetConfirm,
    db: Session = Depends(deps.get_db),
) -> Any:
    """Reset password with token"""
    user = crud.user.verify_password_reset_token(db, token=password_reset.token)

    if not user:
        raise HTTPException(status_code=400, detail="Token inválido o expirado")

    crud.user.reset_password(db, user=user, new_password=password_reset.new_password)

    return {"message": "Contraseña restablecida exitosamente"}


@router.post("/password-change")
def change_password(
    password_change: schemas.PasswordChange,
    db: Session = Depends(deps.get_db),
    current_user: schemas.User = Depends(deps.get_current_active_user),
) -> Any:
    """Change password for current user"""
    # Get the full user object from database
    db_user = crud.user.get(db, id=current_user.id)
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    user = crud.user.change_password(
        db,
        user=db_user,
        current_password=password_change.current_password,
        new_password=password_change.new_password,
    )

    if not user:
        raise HTTPException(status_code=400, detail="Contraseña actual incorrecta")

    return {"message": "Contraseña cambiada exitosamente"}
