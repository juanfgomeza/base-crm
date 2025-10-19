# FastAPI Backend Implementation Plan - Base CRM

## 🎯 Backend Overview

Build a production-ready FastAPI backend with:

- **Framework**: FastAPI + Python 3.11+
- **Database**: PostgreSQL 15+ with SQLAlchemy 2.0 ORM
- **Authentication**: JWT tokens with password hashing (bcrypt)
- **API Design**: RESTful with OpenAPI/Swagger docs
- **Containerization**: Docker + Docker Compose for local development

---

## 📋 Backend Architecture

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                      # FastAPI application entry point
│   ├── config.py                    # Configuration & environment variables
│   ├── database.py                  # Database connection & session management
│   ├── deps.py                      # Dependency injection (get_db, get_current_user)
│   ├── models/                      # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── user.py                  # User model for authentication
│   │   ├── contact.py               # Contact model
│   │   └── base.py                  # Base model with common fields
│   ├── schemas/                     # Pydantic models for request/response
│   │   ├── __init__.py
│   │   ├── user.py                  # User schemas
│   │   ├── contact.py               # Contact schemas
│   │   ├── auth.py                  # Auth schemas (Token, Login)
│   │   └── common.py                # Common schemas (PaginatedResponse)
│   ├── api/                         # API routes
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── api.py               # Main API router
│   │   │   ├── auth.py              # Authentication endpoints
│   │   │   ├── users.py             # User management (admin)
│   │   │   └── contacts.py          # Contact CRUD endpoints
│   ├── core/                        # Core functionality
│   │   ├── __init__.py
│   │   ├── security.py              # Password hashing, JWT creation/verification
│   │   └── config.py                # Settings class
│   ├── crud/                        # CRUD operations
│   │   ├── __init__.py
│   │   ├── base.py                  # Base CRUD class
│   │   ├── user.py                  # User CRUD operations
│   │   └── contact.py               # Contact CRUD operations
│   └── initial_data.py              # Script to create initial admin user & sample data
├── alembic/                         # Database migrations
│   ├── versions/
│   └── env.py
├── tests/                           # pytest tests
│   ├── __init__.py
│   ├── conftest.py
│   └── api/
│       ├── test_auth.py
│       ├── test_contacts.py
│       └── test_users.py
├── .env.example                     # Example environment variables
├── .dockerignore
├── Dockerfile                       # Backend Docker image
├── requirements.txt                 # Python dependencies
├── alembic.ini                      # Alembic configuration
└── README.md                        # Backend setup instructions
```

---

## 🚀 Phase 1: Backend Project Setup

### 1.1 Create Backend Directory & Virtual Environment

```bash
# From repo root
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows (bash)
source .venv/Scripts/activate

# On Linux/Mac
# source .venv/bin/activate

# Upgrade pip
pip install --upgrade pip
```

### 1.2 Install Dependencies

Create `requirements.txt`:

```txt
# FastAPI & Server
fastapi==0.109.0
uvicorn[standard]==0.27.0
python-multipart==0.0.6

# Database
sqlalchemy==2.0.25
psycopg2-binary==2.9.9
alembic==1.13.1

# Authentication & Security
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-dotenv==1.0.0

# Validation & Serialization
pydantic==2.5.3
pydantic-settings==2.1.0
email-validator==2.1.0

# CORS
fastapi-cors==0.0.6

# Development
pytest==7.4.4
pytest-asyncio==0.23.3
httpx==0.26.0
faker==22.2.0
```

Install:

```bash
pip install -r requirements.txt
```

### 1.3 Environment Configuration

Create `.env.example`:

```env
# Application
APP_NAME=Base CRM API
APP_ENV=development
DEBUG=True
API_V1_PREFIX=/api

# Security
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_USER=crm_user
POSTGRES_PASSWORD=crm_password
POSTGRES_DB=crm_db

# Docker Database (used in docker-compose)
POSTGRES_SERVER_DOCKER=db
POSTGRES_PORT_DOCKER=5432

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]

# First Superuser (created on startup)
FIRST_SUPERUSER_EMAIL=admin@example.com
FIRST_SUPERUSER_PASSWORD=admin123
FIRST_SUPERUSER_NOMBRES=Admin
FIRST_SUPERUSER_APELLIDOS=Sistema
```

Copy to `.env`:

```bash
cp .env.example .env
# Edit .env and set proper SECRET_KEY (generate with: openssl rand -hex 32)
```

---

## 📊 Phase 2: Database Models & Core Setup

### 2.1 Core Configuration (`app/core/config.py`)

```python
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

    # Application
    APP_NAME: str = "Base CRM API"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api"

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # First superuser
    FIRST_SUPERUSER_EMAIL: str
    FIRST_SUPERUSER_PASSWORD: str
    FIRST_SUPERUSER_NOMBRES: str = "Admin"
    FIRST_SUPERUSER_APELLIDOS: str = "Sistema"

    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"


settings = Settings()
```

### 2.2 Security (`app/core/security.py`)

```python
from datetime import datetime, timedelta
from typing import Any, Optional
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(subject: str | Any, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
```

### 2.3 Database Setup (`app/database.py`)

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### 2.4 Base Model (`app/models/base.py`)

```python
from datetime import datetime
from sqlalchemy import Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database import Base


class BaseModel(Base):
    __abstract__ = True

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
```

### 2.5 User Model (`app/models/user.py`)

```python
from sqlalchemy import Boolean, Column, String
from app.models.base import BaseModel


class User(BaseModel):
    __tablename__ = "users"

    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    nombres = Column(String, nullable=False)
    apellidos = Column(String, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)

    @property
    def nombre_completo(self) -> str:
        return f"{self.nombres} {self.apellidos}"
```

### 2.6 Contact Model (`app/models/contact.py`)

```python
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
    estado = Column(Enum(ContactStatus), default=ContactStatus.PROSPECTO, nullable=False, index=True)
    cedula = Column(String, nullable=True)
    ciudad = Column(String, nullable=True, index=True)
    pais = Column(String, nullable=True, default="Colombia")
    notas = Column(String, nullable=True)
```

---

## 🔌 Phase 3: Pydantic Schemas

### 3.1 Common Schemas (`app/schemas/common.py`)

```python
from typing import Generic, List, TypeVar
from pydantic import BaseModel

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    size: int
```

### 3.2 Auth Schemas (`app/schemas/auth.py`)

```python
from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
```

### 3.3 User Schemas (`app/schemas/user.py`)

```python
from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime
from uuid import UUID


class UserBase(BaseModel):
    email: EmailStr
    nombres: str
    apellidos: str
    is_active: bool = True
    is_superuser: bool = False


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    nombres: Optional[str] = None
    apellidos: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None


class UserInDB(UserBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class User(UserInDB):
    nombre_completo: str
```

### 3.4 Contact Schemas (`app/schemas/contact.py`)

```python
from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime
from uuid import UUID
from app.models.contact import ContactStatus


class ContactBase(BaseModel):
    nombres: str
    apellidos: str
    nombre_completo: str
    email: EmailStr
    telefono: str
    estado: ContactStatus = ContactStatus.PROSPECTO
    cedula: Optional[str] = None
    ciudad: Optional[str] = None
    pais: Optional[str] = "Colombia"
    notas: Optional[str] = None


class ContactCreate(ContactBase):
    pass


class ContactUpdate(BaseModel):
    nombres: Optional[str] = None
    apellidos: Optional[str] = None
    nombre_completo: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    estado: Optional[ContactStatus] = None
    cedula: Optional[str] = None
    ciudad: Optional[str] = None
    pais: Optional[str] = None
    notas: Optional[str] = None


class ContactInDB(ContactBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Contact(ContactInDB):
    pass
```

---

## 🔐 Phase 4: CRUD Operations

### 4.1 Base CRUD (`app/crud/base.py`)

```python
from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import Base

ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class CRUDBase(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    def get(self, db: Session, id: Any) -> Optional[ModelType]:
        return db.query(self.model).filter(self.model.id == id).first()

    def get_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> tuple[List[ModelType], int]:
        query = db.query(self.model)
        total = query.count()
        items = query.offset(skip).limit(limit).all()
        return items, total

    def create(self, db: Session, *, obj_in: CreateSchemaType) -> ModelType:
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: ModelType,
        obj_in: Union[UpdateSchemaType, Dict[str, Any]]
    ) -> ModelType:
        obj_data = jsonable_encoder(db_obj)
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: Any) -> ModelType:
        obj = db.query(self.model).get(id)
        db.delete(obj)
        db.commit()
        return obj
```

### 4.2 User CRUD (`app/crud/user.py`)

```python
from typing import Optional
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    def get_by_email(self, db: Session, *, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

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


user = CRUDUser(User)
```

### 4.3 Contact CRUD (`app/crud/contact.py`)

```python
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
```

---

## 🌐 Phase 5: API Routes

### 5.1 Dependencies (`app/deps.py`)

```python
from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.core import security
from app.core.config import settings
from app.database import SessionLocal

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_PREFIX}/auth/login")


def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()


def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = schemas.TokenPayload(**payload)
    except (JWTError, ValidationError):
        raise credentials_exception

    user = crud.user.get(db, id=token_data.sub)
    if not user:
        raise credentials_exception
    return user


def get_current_active_user(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    if not crud.user.is_active(current_user):
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


def get_current_active_superuser(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    if not crud.user.is_superuser(current_user):
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )
    return current_user
```

### 5.2 Auth Routes (`app/api/v1/auth.py`)

```python
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
    db: Session = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
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
```

### 5.3 Contacts Routes (`app/api/v1/contacts.py`)

```python
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
```

### 5.4 Users Routes (Admin) (`app/api/v1/users.py`)

```python
from typing import Any, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()


@router.get("/", response_model=List[schemas.User])
def read_users(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """Retrieve users (admin only)"""
    users, _ = crud.user.get_multi(db, skip=skip, limit=limit)
    return users


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
```

### 5.5 Main API Router (`app/api/v1/api.py`)

```python
from fastapi import APIRouter
from app.api.v1 import auth, contacts, users

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(contacts.router, prefix="/contactos", tags=["contactos"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
```

---

## 🏗️ Phase 6: Main Application & Initial Data

### 6.1 Main App (`app/main.py`)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
def read_root():
    return {"message": f"Welcome to {settings.APP_NAME}"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
```

### 6.2 Initial Data Script (`app/initial_data.py`)

```python
import logging
from sqlalchemy.orm import Session
from app import crud, schemas
from app.database import SessionLocal
from app.core.config import settings
from faker import Faker

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

fake = Faker("es_ES")


def init_db(db: Session) -> None:
    # Create first superuser
    user = crud.user.get_by_email(db, email=settings.FIRST_SUPERUSER_EMAIL)
    if not user:
        user_in = schemas.UserCreate(
            email=settings.FIRST_SUPERUSER_EMAIL,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            nombres=settings.FIRST_SUPERUSER_NOMBRES,
            apellidos=settings.FIRST_SUPERUSER_APELLIDOS,
            is_superuser=True,
        )
        user = crud.user.create(db, obj_in=user_in)
        logger.info(f"Created superuser: {user.email}")
    else:
        logger.info(f"Superuser already exists: {user.email}")

    # Create sample contacts
    existing_contacts = crud.contact.get_multi(db, skip=0, limit=1)
    if not existing_contacts[0]:  # No contacts exist
        logger.info("Creating sample contacts...")
        estados = ["prospecto", "calificado", "cliente", "inactivo"]

        for i in range(20):
            contact_in = schemas.ContactCreate(
                nombres=fake.first_name(),
                apellidos=f"{fake.last_name()} {fake.last_name()}",
                nombre_completo=fake.name(),
                email=fake.email(),
                telefono=fake.phone_number(),
                estado=fake.random_element(estados),
                cedula=fake.bothify(text="##########"),
                ciudad=fake.city(),
                pais="Colombia",
                notas=fake.text(max_nb_chars=200),
            )
            crud.contact.create(db, obj_in=contact_in)

        logger.info("Created 20 sample contacts")
    else:
        logger.info("Contacts already exist, skipping sample data creation")


def main() -> None:
    logger.info("Creating initial data")
    db = SessionLocal()
    init_db(db)
    logger.info("Initial data created")


if __name__ == "__main__":
    main()
```

---

## 🐳 Phase 7: Docker & Docker Compose

### 7.1 Backend Dockerfile (`backend/Dockerfile`)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY ./app ./app
COPY ./alembic ./alembic
COPY ./alembic.ini .
COPY ./.env .env

# Expose port
EXPOSE 8000

# Run migrations and start server
CMD ["sh", "-c", "alembic upgrade head && python app/initial_data.py && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
```

### 7.2 Frontend Dockerfile (`frontend/Dockerfile`)

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 7.3 Nginx Config (`frontend/nginx.conf`)

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://backend:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### 7.4 Docker Compose - Development (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: crm_user
      POSTGRES_PASSWORD: crm_password
      POSTGRES_DB: crm_db
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U crm_user']
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - '8000:8000'
    environment:
      - POSTGRES_SERVER=db
      - POSTGRES_PORT=5432
      - POSTGRES_USER=crm_user
      - POSTGRES_PASSWORD=crm_password
      - POSTGRES_DB=crm_db
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./backend/app:/app/app
    command: sh -c "alembic upgrade head && python app/initial_data.py && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - '3000:80'
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://localhost:8000/api

volumes:
  postgres_data:
```

### 7.5 Docker Compose - Production (`docker-compose.prod.yml`)

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - '8000:8000'
    environment:
      - POSTGRES_SERVER=${POSTGRES_SERVER}
      - POSTGRES_PORT=${POSTGRES_PORT}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
      - SECRET_KEY=${SECRET_KEY}
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - '80:80'
    depends_on:
      - backend
    environment:
      - VITE_API_URL=${VITE_API_URL}
    restart: unless-stopped
```

---

## 🚀 Phase 8: Database Migrations (Alembic)

### 8.1 Alembic Setup

```bash
cd backend
alembic init alembic
```

### 8.2 Alembic Config (`backend/alembic.ini`)

```ini
[alembic]
script_location = alembic
prepend_sys_path = .
sqlalchemy.url = postgresql://crm_user:crm_password@localhost:5432/crm_db

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console
qualname =

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
```

### 8.3 Alembic Env (`backend/alembic/env.py`)

```python
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
from app.database import Base
from app.core.config import settings

# Import all models here to ensure they are registered
from app.models.user import User
from app.models.contact import Contact

config = context.config
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

### 8.4 Create Initial Migration

```bash
cd backend
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

---

## ✅ Success Criteria & Testing

### Local Development Workflow

```bash
# 1. Start all services
docker-compose up -d

# 2. Check logs
docker-compose logs -f backend
docker-compose logs -f frontend

# 3. Access services
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000
# - API Docs: http://localhost:8000/docs

# 4. Login with default admin
# Email: admin@example.com
# Password: admin123

# 5. Test CRUD operations
# - Create contact
# - Edit contact
# - Delete contact
# - View contacts list with filters

# 6. Test admin section
# - Navigate to Users (admin only)
# - Create new user
# - Edit user
# - Delete user

# 7. Stop services
docker-compose down
```

### Checklist

- [ ] PostgreSQL running and accessible
- [ ] Backend API running on port 8000
- [ ] Frontend running on port 3000
- [ ] Migrations applied successfully
- [ ] Initial admin user created
- [ ] Sample contacts created
- [ ] Login working with JWT tokens
- [ ] Contact CRUD operations working
- [ ] User management (admin) working
- [ ] Filtering and pagination working
- [ ] Docker compose working locally
- [ ] API documentation accessible at `/docs`

---

## 📝 Additional Notes

### Environment Variables for Production

Create `.env.prod` for production:

```env
APP_ENV=production
DEBUG=False
SECRET_KEY=<generate-secure-key>
POSTGRES_SERVER=your-postgres-host
POSTGRES_USER=crm_prod_user
POSTGRES_PASSWORD=<secure-password>
POSTGRES_DB=crm_prod_db
BACKEND_CORS_ORIGINS=["https://your-domain.com"]
```

### Security Recommendations

1. **Change default credentials** immediately
2. **Use strong SECRET_KEY** (generate: `openssl rand -hex 32`)
3. **Enable HTTPS** in production
4. **Configure firewall** rules
5. **Regular database backups**
6. **Monitor logs** for suspicious activity
7. **Keep dependencies updated**

### Next Steps After Base Implementation

1. Add email notifications
2. Implement password reset flow
3. Add activity logging/audit trail
4. Implement role-based permissions (beyond superuser)
5. Add data export (CSV/Excel)
6. Implement bulk operations
7. Add search functionality
8. Configure CI/CD pipeline
9. Set up monitoring (e.g., Sentry, Prometheus)
10. Add comprehensive tests

---

## 🎯 Quick Start Commands

```bash
# Initial setup
cd backend
python -m venv .venv
source .venv/Scripts/activate  # Windows bash
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your settings

# Run migrations
alembic upgrade head

# Create initial data
python app/initial_data.py

# Start backend (development)
uvicorn app.main:app --reload

# OR use Docker Compose (recommended)
cd ..  # back to repo root
docker-compose up --build
```

**Ready to build the backend! 🚀**
