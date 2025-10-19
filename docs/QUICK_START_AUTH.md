# Quick Start Guide - Authentication & User Management

## 🚀 Getting Started

### Start the Application

```bash
cd c:/Users/JuanFernandoGomez/Repos/formi/Evert/base-crm
docker-compose up --build
```

### Access the Application

- Frontend: `http://localhost` (or port specified in docker-compose)
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

### Default Admin Credentials

```
Email: admin@example.com
Password: admin123
```

## 📋 Features Implemented

### ✅ Authentication

- [x] Login page with styled UI
- [x] OAuth2 password flow integration
- [x] JWT token management
- [x] Protected routes
- [x] Auto-redirect to login for unauthenticated users
- [x] Logout functionality

### ✅ User Management (Admin Section)

- [x] List users with pagination
- [x] Create new users
- [x] Edit existing users
- [x] View user details
- [x] Delete users
- [x] Active/Inactive status toggle
- [x] Admin/User role management

## 🧪 Quick Tests

### 1. Login Test

```
1. Go to http://localhost
2. Should redirect to /login
3. Enter: admin@example.com / admin123
4. Should redirect to dashboard
```

### 2. User Management Test

```
1. Click "Usuarios" in sidebar
2. Click "+ Crear"
3. Fill form:
   - Email: test@example.com
   - Password: test123
   - Nombres: Test
   - Apellidos: User
4. Click "Guardar"
5. New user should appear in list
```

### 3. Protected Route Test

```
1. Open DevTools Console
2. Run: localStorage.clear()
3. Refresh page
4. Should redirect to /login
```

## 🔑 API Endpoints Quick Reference

### Auth

```
POST /api/auth/login     - Login (returns access_token)
GET  /api/auth/me        - Get current user
```

### Users (Admin Only)

```
GET    /api/users        - List users
POST   /api/users        - Create user
GET    /api/users/:id    - Get user
PUT    /api/users/:id    - Update user
DELETE /api/users/:id    - Delete user
```

### Contacts

```
GET    /api/contactos        - List contacts
POST   /api/contactos        - Create contact
GET    /api/contactos/:id    - Get contact
PUT    /api/contactos/:id    - Update contact
DELETE /api/contactos/:id    - Delete contact
```

## 🐛 Common Issues & Fixes

### Login Fails

```bash
# Check backend logs
docker-compose logs backend

# Restart services
docker-compose restart backend
```

### Frontend Can't Connect

```bash
# Check if VITE_API_URL is set correctly
# Default: http://localhost:8000/api

# Check frontend logs
docker-compose logs frontend
```

### Database Issues

```bash
# Reset database
docker-compose down -v
docker-compose up --build
```

## 📁 Key Files

### Frontend

```
src/
├── pages/
│   ├── login/index.tsx          # Login page
│   └── users/                   # User management
│       ├── list.tsx
│       ├── create.tsx
│       ├── edit.tsx
│       └── show.tsx
├── providers/
│   ├── authProvider.ts          # Auth logic
│   └── dataProvider.ts          # API calls
├── types/
│   └── entities.ts              # TypeScript types
└── App.tsx                      # Main app config
```

### Backend

```
app/
├── api/v1/
│   ├── auth.py                  # Auth endpoints
│   └── users.py                 # User endpoints
├── schemas/
│   └── user.py                  # User schemas (camelCase)
└── main.py                      # FastAPI app
```

## 🔐 Security Notes

- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens expire in 30 minutes
- ✅ Admin endpoints require superuser role
- ⚠️ Change SECRET_KEY in production
- ⚠️ Use HTTPS in production
- ⚠️ Consider implementing refresh tokens

## 📚 Documentation

See `AUTHENTICATION_IMPLEMENTATION.md` for complete details.
