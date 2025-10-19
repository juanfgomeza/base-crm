from sqlalchemy import Column, String, Enum
import enum
from app.models.base import BaseModel


class ContactStatus(str, enum.Enum):
    PROSPECTO = "prospecto"
    CALIFICADO = "calificado"
    CLIENTE = "cliente"
    INACTIVO = "inactivo"


class Contact(BaseModel):
    __tablename__ = "contacts"

    nombres = Column(String, nullable=False, index=True)
    apellidos = Column(String, nullable=False, index=True)
    nombre_completo = Column(String, nullable=False, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    telefono = Column(String, nullable=False)
    estado = Column(
        Enum(ContactStatus), default=ContactStatus.PROSPECTO, nullable=False, index=True
    )
    cedula = Column(String, nullable=True)
    ciudad = Column(String, nullable=True, index=True)
    pais = Column(String, nullable=True, default="Colombia")
    notas = Column(String, nullable=True)
