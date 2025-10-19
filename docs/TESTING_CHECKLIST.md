# 🧪 Testing Checklist - Base CRM

## ✅ Docker Services Status

All services are up and running:

- ✅ PostgreSQL: `localhost:5432` (healthy)
- ✅ Backend API: `localhost:8000` (running with hot reload)
- ✅ Frontend: `localhost:3000` (nginx serving React app)

## 🔑 Test Credentials

**Admin User:**

- Email: `admin@example.com`
- Password: `admin123`

**Sample Data:**

- 20 contacts with Spanish names and Colombian cities
- Various estados: prospecto, calificado, cliente, inactivo

---

## 📝 Manual Testing Checklist

### 1. Backend API Health Checks

- [x] **Root endpoint**: http://localhost:8000

  - Should return: `{"message": "Welcome to Base CRM API"}`

- [x] **Health check**: http://localhost:8000/health

  - Should return: `{"status": "ok"}`

- [x] **API Documentation**: http://localhost:8000/docs

  - Swagger UI should load with all endpoints visible
  - Should see: `/api/auth/login`, `/api/auth/me`, `/api/contactos/*`, `/api/users/*`

- [x] **ReDoc Documentation**: http://localhost:8000/redoc
  - Alternative API documentation view should load

### 2. Authentication Testing

#### 2.1 Login via API Docs

1. Go to http://localhost:8000/docs
2. Click on `POST /api/auth/login`
3. Click "Try it out"
4. Enter credentials:
   ```json
   {
     "username": "admin@example.com",
     "password": "admin123"
   }
   ```
5. Click "Execute"
6. **Expected**: Should receive an `access_token`
7. Copy the token
8. Click "Authorize" button at the top
9. Enter: `Bearer <your-token>`
10. Click "Authorize"

#### 2.2 Get Current User

1. With token authorized, go to `GET /api/auth/me`
2. Click "Try it out" → "Execute"
3. **Expected**: Should return admin user details:
   ```json
   {
     "email": "admin@example.com",
     "nombres": "Admin",
     "apellidos": "Sistema",
     "is_active": true,
     "is_superuser": true,
     "id": "<uuid>",
     "created_at": "...",
     "updated_at": "...",
     "nombre_completo": "Admin Sistema"
   }
   ```

### 3. Contact CRUD Testing (via API Docs)

#### 3.1 List Contacts

- [x] `GET /api/contactos` (page=0, size=10)
  - **Expected**: Should return 10 contacts with pagination info
  - Should have `items`, `total`, `page`, `size` fields
  - Total should be 20

#### 3.2 Filter Contacts by Estado

- [x] `GET /api/contactos?filter_estado=cliente`
  - **Expected**: Only contacts with estado "cliente"

#### 3.3 Create Contact

- [x] `POST /api/contactos`
  - Body:
    ```json
    {
      "nombres": "Juan",
      "apellidos": "Pérez",
      "nombre_completo": "Juan Pérez",
      "email": "juan.perez@test.com",
      "telefono": "+57 300 1234567",
      "estado": "prospecto",
      "ciudad": "Bogotá",
      "pais": "Colombia",
      "cedula": "1234567890",
      "notas": "Nuevo contacto de prueba"
    }
    ```
  - **Expected**: Should return created contact with UUID and timestamps

#### 3.4 Get Contact by ID

- [x] Copy the ID from the created contact
- [x] `GET /api/contactos/{id}`
  - **Expected**: Should return the contact details

#### 3.5 Update Contact

- [x] `PUT /api/contactos/{id}`
  - Body:
    ```json
    {
      "estado": "calificado",
      "notas": "Contacto actualizado - calificado para venta"
    }
    ```
  - **Expected**: Should return updated contact with new estado and notas

#### 3.6 Delete Contact

- [x] `DELETE /api/contactos/{id}`
  - **Expected**: Should return the deleted contact
- [x] Verify with `GET /api/contactos/{id}`
  - **Expected**: Should return 404 Not Found

### 4. User Management Testing (Admin Only)

#### 4.1 List Users

- [x] `GET /api/users`
  - **Expected**: Should return list with admin user

#### 4.2 Create User

- [x] `POST /api/users`
  - Body:
    ```json
    {
      "email": "test.user@example.com",
      "nombres": "Test",
      "apellidos": "User",
      "password": "testpass123",
      "is_active": true,
      "is_superuser": false
    }
    ```
  - **Expected**: Should create new user (password will be hashed)

#### 4.3 Get User by ID

- [x] Copy new user ID
- [x] `GET /api/users/{id}`
  - **Expected**: Should return user details

#### 4.4 Update User

- [x] `PUT /api/users/{id}`
  - Body:
    ```json
    {
      "is_active": false
    }
    ```
  - **Expected**: User should be deactivated

#### 4.5 Delete User

- [x] `DELETE /api/users/{id}`
  - **Expected**: User should be deleted
- [x] Try to delete yourself (admin)
  - **Expected**: Should get error "Cannot delete yourself"

### 5. Frontend Testing

#### 5.1 Access Frontend

- [x] Open http://localhost:3000
  - **Expected**: Should redirect to login page

#### 5.2 Login

- [ ] Enter credentials:
  - Email: `admin@example.com`
  - Password: `admin123`
- [ ] Click "Sign in"
  - **Expected**: Should redirect to dashboard

#### 5.3 Dashboard

- [ ] **Expected**: Should see statistics cards:
  - Total Contactos
  - Prospectos
  - Clientes
  - Welcome message

#### 5.4 Contact List

- [ ] Click "Contactos" in sidebar
  - **Expected**: Should see table with 20 contacts
  - Should have columns: Nombre Completo, Email, Teléfono, Estado, Ciudad
  - Should have Edit, View, Delete buttons

#### 5.5 Filter Contacts

- [ ] Click filter icon on "Estado" column
- [ ] Select "cliente"
  - **Expected**: Table should update to show only clientes

#### 5.6 View Contact

- [ ] Click eye icon on any contact
  - **Expected**: Should navigate to contact detail page
  - Should show all contact fields

#### 5.7 Create Contact

- [ ] Click "Create" button
- [ ] Fill in form:
  - Nombres: "María"
  - Apellidos: "García"
  - Email: "maria.garcia@test.com"
  - Teléfono: "+57 301 9876543"
  - Estado: "prospecto"
- [ ] Click "Save"
  - **Expected**: Should redirect to contact list
  - New contact should appear in the table

#### 5.8 Edit Contact

- [ ] Click edit icon on María García
- [ ] Change Estado to "calificado"
- [ ] Add Notas: "Contacto actualizado desde frontend"
- [ ] Click "Save"
  - **Expected**: Should update and redirect to list

#### 5.9 Delete Contact

- [ ] Click delete icon on María García
- [ ] Confirm deletion
  - **Expected**: Contact should be removed from list

#### 5.10 Pagination

- [ ] Scroll to bottom of contact list
- [ ] Click page 2
  - **Expected**: Should load next 10 contacts

#### 5.11 Admin Section (if implemented)

- [ ] Check if there's a "Users" or "Admin" menu item
- [ ] If yes, test user management UI

### 6. Integration Testing

#### 6.1 API Proxy

- [ ] Frontend should successfully call backend through nginx proxy
- [ ] Check browser console for any CORS errors
  - **Expected**: No CORS errors

#### 6.2 Token Persistence

- [ ] Login to frontend
- [ ] Refresh page (F5)
  - **Expected**: Should stay logged in (token in localStorage)

#### 6.3 Token Expiration

- [ ] Wait 30 minutes (or change ACCESS_TOKEN_EXPIRE_MINUTES to 1 for testing)
- [ ] Try to access a protected page
  - **Expected**: Should redirect to login

#### 6.4 Logout

- [ ] Click logout/sign out
  - **Expected**: Should redirect to login page
  - Token should be cleared from localStorage

### 7. Error Handling

#### 7.1 Invalid Login

- [ ] Try to login with wrong password
  - **Expected**: "Incorrect email or password" error

#### 7.2 Duplicate Email

- [ ] Try to create contact with existing email
  - **Expected**: Database constraint error

#### 7.3 Invalid UUID

- [ ] Try `GET /api/contactos/invalid-uuid`
  - **Expected**: 422 Validation Error

#### 7.4 Not Found

- [ ] Try `GET /api/contactos/00000000-0000-0000-0000-000000000000`
  - **Expected**: 404 Not Found

#### 7.5 Unauthorized Access

- [ ] Logout from API docs (remove token)
- [ ] Try `GET /api/contactos`
  - **Expected**: 401 Unauthorized

---

## 🐛 Known Issues to Check

- [ ] Check browser console for any warnings
- [ ] Verify no memory leaks during navigation
- [ ] Test on different browsers (Chrome, Firefox, Edge)
- [ ] Check mobile responsiveness

---

## 📊 Performance Checks

- [ ] Initial page load < 2 seconds
- [ ] API responses < 500ms
- [ ] No console errors or warnings
- [ ] Database queries are efficient (check logs)

---

## 🔒 Security Checks

- [ ] Passwords are hashed in database (not plain text)
- [ ] JWT tokens are properly validated
- [ ] CORS is configured correctly
- [ ] Non-admin users cannot access /api/users endpoints
- [ ] SQL injection protection (SQLAlchemy handles this)
- [ ] XSS protection (React handles this)

---

## ✅ All Tests Passed?

If all tests pass, your Base CRM application is **production-ready** (after changing default credentials and SECRET_KEY)!

**Next Steps:**

1. Change default admin password
2. Generate strong SECRET_KEY
3. Configure production database
4. Set up HTTPS/SSL
5. Deploy to production server
6. Set up monitoring and logging
7. Configure backups

---

## 🚀 Quick Commands

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Restart services
docker-compose restart backend
docker-compose restart frontend

# Stop all
docker-compose down

# Stop and remove data
docker-compose down -v

# Rebuild
docker-compose up --build
```
