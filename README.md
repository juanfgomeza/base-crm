# Base CRM - Full Stack Application

A modern, full-stack CRM application built with React + TypeScript (frontend) and FastAPI + PostgreSQL (backend).

## 🚀 Features

- **Frontend**: React 19, TypeScript, Vite, Ant Design, Refine Framework
- **Backend**: FastAPI, SQLAlchemy 2.0, PostgreSQL, JWT Authentication
- **Contact Management**: Full CRUD operations with filtering and pagination
- **User Management**: Admin section for user administration
- **Authentication**: JWT token-based with secure password hashing (bcrypt)
- **Containerization**: Docker and Docker Compose for easy deployment

## 📋 Prerequisites

- **Docker & Docker Compose** (recommended for easiest setup)
- **OR** for local development:
  - Node.js 20+
  - Python 3.11+
  - PostgreSQL 15+

## 🏃 Quick Start (Docker - Recommended)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd base-crm
```

### 2. Start all services with Docker Compose

```bash
docker-compose up --build
```

This will:

- Start PostgreSQL database on port 5432
- Start FastAPI backend on port 8000
- Start React frontend on port 3000
- Run database migrations automatically
- Create admin user and sample data

### 3. Access the application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **API Redoc**: http://localhost:8000/redoc

### 4. Login with default admin credentials

- **Email**: admin@example.com
- **Password**: admin123

⚠️ **Security Note**: Change the default admin password immediately in production!

### 5. Stop services

```bash
docker-compose down
```

To stop and remove all data (including database):

```bash
docker-compose down -v
```

---

## 🛠️ Local Development Setup (Without Docker)

### Backend Setup

#### 1. Navigate to backend directory

```bash
cd backend
```

#### 2. Create and activate virtual environment

**Windows (bash):**

```bash
python -m venv .venv
source .venv/Scripts/activate
```

**Linux/Mac:**

```bash
python -m venv .venv
source .venv/bin/activate
```

#### 3. Install dependencies

```bash
pip install -r requirements.txt
```

#### 4. Configure environment

```bash
cp .env.example .env
# Edit .env with your settings
# Generate SECRET_KEY with: openssl rand -hex 32
```

#### 5. Set up database

Make sure PostgreSQL is running, then:

```bash
# Run migrations
alembic upgrade head

# Create initial admin user and sample data
python -m app.initial_data
```

#### 6. Start backend server

```bash
uvicorn app.main:app --reload
```

Backend will be available at http://localhost:8000

### Frontend Setup

#### 1. Navigate to frontend directory

```bash
cd frontend
```

#### 2. Install dependencies

```bash
npm install
```

#### 3. Start development server

```bash
npm run dev
```

Frontend will be available at http://localhost:3000

---

## 📁 Project Structure

```
base-crm/
├── backend/                      # FastAPI backend
│   ├── app/
│   │   ├── api/                 # API routes
│   │   │   └── v1/              # API version 1
│   │   │       ├── auth.py      # Authentication endpoints
│   │   │       ├── contacts.py  # Contact CRUD endpoints
│   │   │       ├── users.py     # User management (admin)
│   │   │       └── api.py       # Main API router
│   │   ├── core/                # Core functionality
│   │   │   ├── config.py        # Settings and configuration
│   │   │   └── security.py      # JWT and password hashing
│   │   ├── crud/                # CRUD operations
│   │   │   ├── base.py          # Base CRUD class
│   │   │   ├── contact.py       # Contact CRUD
│   │   │   └── user.py          # User CRUD
│   │   ├── models/              # SQLAlchemy models
│   │   │   ├── base.py          # Base model
│   │   │   ├── contact.py       # Contact model
│   │   │   └── user.py          # User model
│   │   ├── schemas/             # Pydantic schemas
│   │   │   ├── auth.py          # Auth schemas
│   │   │   ├── common.py        # Common schemas
│   │   │   ├── contact.py       # Contact schemas
│   │   │   └── user.py          # User schemas
│   │   ├── database.py          # Database connection
│   │   ├── deps.py              # Dependencies
│   │   ├── initial_data.py      # Initial data seeding
│   │   └── main.py              # FastAPI app entry point
│   ├── alembic/                 # Database migrations
│   ├── .env                     # Environment variables (not in git)
│   ├── .env.example             # Environment variables template
│   ├── alembic.ini              # Alembic configuration
│   ├── Dockerfile               # Backend Docker image
│   └── requirements.txt         # Python dependencies
├── frontend/                     # React frontend
│   ├── src/
│   │   ├── api/                 # API configuration
│   │   ├── pages/               # Page components
│   │   │   ├── contacts/        # Contact pages (list, create, edit, show)
│   │   │   ├── dashboard/       # Dashboard page
│   │   │   └── login/           # Login page
│   │   ├── providers/           # Data and auth providers
│   │   ├── schemas/             # Entity schemas
│   │   ├── types/               # TypeScript types
│   │   ├── App.tsx              # Main app component
│   │   └── main.tsx             # App entry point
│   ├── Dockerfile               # Frontend Docker image
│   ├── nginx.conf               # Nginx configuration
│   ├── package.json             # Node dependencies
│   └── vite.config.ts           # Vite configuration
├── docs/                         # Documentation
│   └── backend_implementation_plan.md
├── docker-compose.yml            # Docker Compose for development
├── docker-compose.prod.yml       # Docker Compose for production
└── README.md                     # This file
```

---

## 🔐 Security

### Environment Variables

The following environment variables must be configured in production:

#### Backend (.env)

```env
# Application
APP_NAME=Base CRM API
APP_ENV=production
DEBUG=False
API_V1_PREFIX=/api

# Security - CHANGE THESE!
SECRET_KEY=<generate-with-openssl-rand-hex-32>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database
POSTGRES_SERVER=your-postgres-host
POSTGRES_PORT=5432
POSTGRES_USER=crm_user
POSTGRES_PASSWORD=<secure-password>
POSTGRES_DB=crm_db

# CORS
BACKEND_CORS_ORIGINS=["https://your-domain.com"]

# First Superuser - CHANGE THESE!
FIRST_SUPERUSER_EMAIL=admin@yourdomain.com
FIRST_SUPERUSER_PASSWORD=<secure-password>
FIRST_SUPERUSER_NOMBRES=Admin
FIRST_SUPERUSER_APELLIDOS=Sistema
```

### Security Checklist for Production

- [ ] Change default admin credentials immediately
- [ ] Generate strong SECRET_KEY: `openssl rand -hex 32`
- [ ] Use strong database passwords
- [ ] Enable HTTPS/TLS
- [ ] Configure firewall rules
- [ ] Set up regular database backups
- [ ] Update BACKEND_CORS_ORIGINS to your domain
- [ ] Set DEBUG=False in production
- [ ] Monitor logs for suspicious activity
- [ ] Keep dependencies updated
- [ ] Implement rate limiting
- [ ] Set up security headers in nginx

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest
```

### Frontend Tests

```bash
cd frontend
npm test
```

### API Testing

Access the interactive API documentation at:

- http://localhost:8000/docs (Swagger UI)
- http://localhost:8000/redoc (ReDoc)

---

## 📚 API Endpoints

### Authentication

- `POST /api/auth/login` - Login (get JWT token)
- `GET /api/auth/me` - Get current user info

### Contacts

- `GET /api/contactos` - List contacts (with pagination & filters)
- `POST /api/contactos` - Create contact
- `GET /api/contactos/{id}` - Get contact by ID
- `PUT /api/contactos/{id}` - Update contact
- `DELETE /api/contactos/{id}` - Delete contact

### Users (Admin Only)

- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/users/{id}` - Get user by ID
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

---

## 🚢 Production Deployment

### Using Docker Compose (Production)

1. Create production environment file:

```bash
cp backend/.env.example backend/.env.prod
# Edit .env.prod with production values
```

2. Build and start services:

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

3. Services will be available on:

- Frontend: http://your-server:80
- Backend: http://your-server:8000

### Manual Deployment

See detailed deployment guides in `docs/` directory.

---

## 🔧 Common Issues & Solutions

### Database Connection Errors

**Problem**: Cannot connect to PostgreSQL

**Solution**: Ensure PostgreSQL is running and credentials in `.env` are correct

```bash
# Check if PostgreSQL is running
docker-compose ps

# View logs
docker-compose logs db
```

### Frontend API Connection Issues

**Problem**: Frontend cannot connect to backend API

**Solution**: Check CORS settings in backend `.env`:

```env
BACKEND_CORS_ORIGINS=["http://localhost:3000"]
```

### Migration Errors

**Problem**: Alembic migration fails

**Solution**: Drop database and recreate:

```bash
docker-compose down -v
docker-compose up --build
```

---

## 📝 Scripts

### Backend

```bash
# Run migrations
alembic upgrade head

# Create new migration
alembic revision --autogenerate -m "Description"

# Rollback last migration
alembic downgrade -1

# Create initial data
python -m app.initial_data

# Start server
uvicorn app.main:app --reload
```

### Frontend

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run typecheck

# Lint
npm run lint
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Authors

- Your Name - Initial work

---

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [React](https://react.dev/) - UI library
- [Refine](https://refine.dev/) - React framework for CRUD apps
- [Ant Design](https://ant.design/) - UI component library
- [SQLAlchemy](https://www.sqlalchemy.org/) - Python SQL toolkit
- [Alembic](https://alembic.sqlalchemy.org/) - Database migration tool
