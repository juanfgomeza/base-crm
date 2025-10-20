from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, asc, desc
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
        estados: Optional[List[ContactStatus]] = None,
        search: Optional[str] = None,
        sort_field: Optional[str] = None,
        sort_order: Optional[str] = "asc",
    ) -> tuple[List[Contact], int]:
        query = db.query(Contact).filter(Contact.is_deleted == False)

        if estados:
            query = query.filter(Contact.estado.in_(estados))

        if search:
            search_filter = or_(
                Contact.nombre_completo.ilike(f"%{search}%"),
                Contact.email.ilike(f"%{search}%"),
                Contact.telefono.ilike(f"%{search}%"),
                Contact.cedula.ilike(f"%{search}%"),
            )
            query = query.filter(search_filter)

        # Apply sorting
        if sort_field and hasattr(Contact, sort_field):
            sort_column = getattr(Contact, sort_field)
            if sort_order == "desc":
                query = query.order_by(desc(sort_column))
            else:
                query = query.order_by(asc(sort_column))
        else:
            # Default sort by apellidos
            query = query.order_by(asc(Contact.apellidos))

        total = query.count()
        items = query.offset(skip).limit(limit).all()
        return items, total


contact = CRUDContact(Contact)
