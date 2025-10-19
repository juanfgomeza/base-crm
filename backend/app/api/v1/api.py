from fastapi import APIRouter
from app.api.v1 import auth, contacts, users

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(contacts.router, prefix="/contactos", tags=["contactos"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
