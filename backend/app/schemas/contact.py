from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from uuid import UUID
from app.models.contact import ContactStatus


class ContactBase(BaseModel):
    nombres: str
    apellidos: str
    nombre_completo: str = Field(alias="nombreCompleto")
    email: EmailStr
    telefono: str
    estado: ContactStatus = ContactStatus.PROSPECTO
    cedula: Optional[str] = None
    ciudad: Optional[str] = None
    pais: Optional[str] = "Colombia"
    notas: Optional[str] = None

    class Config:
        populate_by_name = True


class ContactCreate(ContactBase):
    pass


class ContactUpdate(BaseModel):
    nombres: Optional[str] = None
    apellidos: Optional[str] = None
    nombre_completo: Optional[str] = Field(None, alias="nombreCompleto")
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    estado: Optional[ContactStatus] = None
    cedula: Optional[str] = None
    ciudad: Optional[str] = None
    pais: Optional[str] = None
    notas: Optional[str] = None

    class Config:
        populate_by_name = True


class ContactInDB(ContactBase):
    id: UUID
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")

    class Config:
        from_attributes = True
        populate_by_name = True
        by_alias = True


class Contact(ContactInDB):
    pass
