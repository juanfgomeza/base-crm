from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.crud.base import CRUDBase
from app.models.contact import Contact, ContactStatus
from app.schemas.contact import ContactCreate, ContactUpdate


class CRUDContact(CRUDBase[Contact, ContactCreate, ContactUpdate]):
    def get_multi_filtered(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 100,
        estado: Optional[ContactStatus] = None,
        search: Optional[str] = None,
    ) -> tuple[List[Contact], int]:
        query = db.query(Contact)

        if estado:
            query = query.filter(Contact.estado == estado)

        if search:
            search_filter = or_(
                Contact.nombre_completo.ilike(f"%{search}%"),
                Contact.email.ilike(f"%{search}%"),
                Contact.telefono.ilike(f"%{search}%"),
                Contact.cedula.ilike(f"%{search}%"),
            )
            query = query.filter(search_filter)

        total = query.count()
        items = query.offset(skip).limit(limit).all()
        return items, total


contact = CRUDContact(Contact)
