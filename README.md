# Order Management Application

## Task ID: c0c28f55

A simple order management web application with user authentication built with React, FastAPI, and PostgreSQL.

## Features Implemented

### F001: User Authentication ✅
- User registration with email, password, and full name
- User login with JWT token authentication
- Token refresh mechanism
- Protected routes requiring authentication
- User profile endpoint
- Logout functionality

## Tech Stack

- **Frontend**: React 18 with Vite
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL
- **Authentication**: JWT tokens with bcrypt password hashing

## Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL 12+

## Database Setup

1. Install PostgreSQL if not already installed
2. Create the database and tables:

```bash
# Connect to PostgreSQL
psql -U postgres

# Run the schema script
\i backend/db_schema.sql
```

Or manually create the database:

```sql
CREATE DATABASE order_management;
```

Then run the application - SQLAlchemy will create the tables automatically.

## Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create `.env` file from example:

```bash
cp .env.example .env
```

5. Update `.env` with your configuration:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/order_management
SECRET_KEY=your-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

6. Run the backend server:

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

## Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## API Endpoints

### Authentication

- **POST** `/api/auth/register` - Register a new user
  - Body: `{ "email": "user@example.com", "password": "password123", "full_name": "John Doe" }`

- **POST** `/api/auth/login` - Login and get JWT tokens
  - Body: `{ "email": "user@example.com", "password": "password123" }`

- **POST** `/api/auth/refresh` - Refresh access token
  - Body: `{ "refresh_token": "..." }`

- **GET** `/api/auth/me` - Get current user profile (requires authentication)
  - Header: `Authorization: Bearer <access_token>`

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── endpoints/
│   │   │   │   └── auth.py          # Auth endpoints
│   │   │   └── dependencies.py      # JWT middleware
│   │   ├── core/
│   │   │   ├── config.py           # App configuration
│   │   │   └── security.py         # Password hashing & JWT
│   │   ├── db/
│   │   │   └── database.py         # Database connection
│   │   ├── models/
│   │   │   └── user.py             # User model
│   │   ├── schemas/
│   │   │   └── user.py             # Pydantic schemas
│   │   ├── services/
│   │   │   └── user_service.py     # User business logic
│   │   └── main.py                 # FastAPI app
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Navigation bar
│   │   │   └── ProtectedRoute.jsx  # Route protection
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx     # Auth state management
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Login page
│   │   │   ├── Register.jsx        # Registration page
│   │   │   └── Dashboard.jsx       # Dashboard
│   │   ├── services/
│   │   │   └── authService.js      # Auth API calls
│   │   ├── mock/
│   │   │   └── authMock.json       # Mock data for testing
│   │   ├── App.jsx                 # Main app component
│   │   ├── main.jsx                # Entry point
│   │   └── index.css               # Global styles
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## Testing

### Test User Registration

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User"
  }'
```

### Test User Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Get Current User

```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Acceptance Criteria Status

- ✅ DB: users table exists with email unique constraint and password_hash column
- ✅ API: POST /api/auth/register creates a new user and returns user data without password
- ✅ API: POST /api/auth/login returns a valid JWT token for correct credentials and 401 for invalid
- ✅ API: All non-auth endpoints return 401 when no valid token is provided (JWT middleware implemented)
- ✅ UI: User can register, login, and is redirected to the main app on success
- ✅ UI: Unauthenticated users are redirected to the login page

## Security Features

- Password hashing using bcrypt
- JWT token-based authentication
- Access tokens (30 min expiry)
- Refresh tokens (7 day expiry)
- Protected routes with middleware
- CORS configuration
- Input validation with Pydantic

## Next Features

- F002: Order Listing
- F003: Order Creation
- F004: Order Status Management
- F005: Dashboard with metrics

## License

MIT
