from typing import Any, List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.models.contact import ContactStatus

router = APIRouter()


@router.get("/", response_model=schemas.PaginatedResponse[schemas.Contact])
def read_contacts(
    db: Session = Depends(deps.get_db),
    skip: int = Query(0, alias="page", ge=0),
    limit: int = Query(10, alias="size", ge=1, le=100),
    estado: Optional[ContactStatus] = Query(None, alias="filter_estado"),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """Retrieve contacts with pagination and filters"""
    # Convert page to skip
    skip = skip * limit if skip > 0 else 0

    items, total = crud.contact.get_multi_filtered(
        db, skip=skip, limit=limit, estado=estado
    )
    return {
        "items": items,
        "total": total,
        "page": skip // limit if limit > 0 else 0,
        "size": limit,
    }


@router.post("/", response_model=schemas.Contact)
def create_contact(
    *,
    db: Session = Depends(deps.get_db),
    contact_in: schemas.ContactCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """Create new contact"""
    # Auto-generate nombreCompleto if not provided
    if not contact_in.nombre_completo:
        contact_in.nombre_completo = f"{contact_in.nombres} {contact_in.apellidos}"

    return crud.contact.create(db=db, obj_in=contact_in)


@router.get("/{id}", response_model=schemas.Contact)
def read_contact(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """Get contact by ID"""
    contact = crud.contact.get(db=db, id=id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact


@router.put("/{id}", response_model=schemas.Contact)
def update_contact(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    contact_in: schemas.ContactUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """Update contact"""
    contact = crud.contact.get(db=db, id=id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    # Auto-update nombreCompleto if nombres or apellidos changed
    if contact_in.nombres or contact_in.apellidos:
        nombres = contact_in.nombres or contact.nombres
        apellidos = contact_in.apellidos or contact.apellidos
        contact_in.nombre_completo = f"{nombres} {apellidos}"

    contact = crud.contact.update(db=db, db_obj=contact, obj_in=contact_in)
    return contact


@router.delete("/{id}", response_model=schemas.Contact)
def delete_contact(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """Delete contact"""
    contact = crud.contact.get(db=db, id=id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    contact = crud.contact.remove(db=db, id=id)
    return contact
