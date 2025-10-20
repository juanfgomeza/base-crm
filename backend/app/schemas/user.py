from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from uuid import UUID


class UserBase(BaseModel):
    email: EmailStr
    nombres: str
    apellidos: str
    is_active: bool = Field(True, alias="isActive")
    is_superuser: bool = Field(False, alias="isSuperuser")
    theme_preference: str = Field("light", alias="themePreference")

    class Config:
        populate_by_name = True


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    nombres: Optional[str] = None
    apellidos: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = Field(None, alias="isActive")
    is_superuser: Optional[bool] = Field(None, alias="isSuperuser")
    theme_preference: Optional[str] = Field(None, alias="themePreference")

    class Config:
        populate_by_name = True


class UserInDB(UserBase):
    id: UUID
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")

    class Config:
        from_attributes = True
        populate_by_name = True
        by_alias = True


class User(UserInDB):
    nombre_completo: str = Field(alias="nombreCompleto")

    class Config:
        from_attributes = True
        populate_by_name = True
        by_alias = True
