from typing import Optional
from datetime import datetime, timedelta, timezone
import secrets
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    def get_by_email(self, db: Session, *, email: str) -> Optional[User]:
        return (
            db.query(User).filter(User.email == email, User.is_deleted == False).first()
        )

    def create(self, db: Session, *, obj_in: UserCreate) -> User:
        db_obj = User(
            email=obj_in.email,
            hashed_password=get_password_hash(obj_in.password),
            nombres=obj_in.nombres,
            apellidos=obj_in.apellidos,
            is_active=obj_in.is_active,
            is_superuser=obj_in.is_superuser,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def authenticate(self, db: Session, *, email: str, password: str) -> Optional[User]:
        user = self.get_by_email(db, email=email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    def is_active(self, user: User) -> bool:
        return user.is_active

    def is_superuser(self, user: User) -> bool:
        return user.is_superuser

    def create_password_reset_token(self, db: Session, *, email: str) -> Optional[str]:
        user = self.get_by_email(db, email=email)
        if not user:
            return None

        token = secrets.token_urlsafe(32)
        user.reset_token = token
        user.reset_token_expires = datetime.now(timezone.utc) + timedelta(hours=1)
        db.add(user)
        db.commit()
        return token

    def verify_password_reset_token(self, db: Session, *, token: str) -> Optional[User]:
        user = (
            db.query(User)
            .filter(User.reset_token == token, User.is_deleted == False)
            .first()
        )

        if not user or not user.reset_token_expires:
            return None

        if datetime.now(timezone.utc) > user.reset_token_expires:
            return None

        return user

    def reset_password(self, db: Session, *, user: User, new_password: str) -> User:
        user.hashed_password = get_password_hash(new_password)
        user.reset_token = None
        user.reset_token_expires = None
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def change_password(
        self, db: Session, *, user: User, current_password: str, new_password: str
    ) -> Optional[User]:
        if not verify_password(current_password, user.hashed_password):
            return None

        user.hashed_password = get_password_hash(new_password)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user


user = CRUDUser(User)
