# F001 Task Breakdown: User Authentication

**Total tasks**: 1


---


## F001-T01: Implement User Authentication

- **Role**: `fullstack_engineer`

- **Story Points**: 8

- **Priority**: critical


### Description
**Database:**
Create 'users' table with columns: id (PK, serial), email (unique, varchar), password_hash (varchar), full_name (varchar), is_active (boolean, default true), created_at (timestamp), updated_at (timestamp).

**Backend API:**
POST /api/auth/register - register new user with email, password, full_name. POST /api/auth/login - authenticate user and return JWT access token and refresh token. POST /api/auth/refresh - refresh expired access token. GET /api/auth/me - return current authenticated user profile. Implement JWT middleware to protect all other routes.

**Frontend UI:**
Login page with email/password form and link to register. Registration page with full_name, email, password, confirm password fields and validation. Auth context/provider to store JWT token and user state. Protected route wrapper that redirects unauthenticated users to login. Navbar showing logged-in user name with logout button.

**Details:**
Create the users table in PostgreSQL with id, email, password_hash, full_name, is_active, created_at, and updated_at columns. Implement four API endpoints: POST /api/auth/register for user registration with password hashing (bcrypt), POST /api/auth/login for authentication returning JWT access and refresh tokens, POST /api/auth/refresh for token renewal, and GET /api/auth/me for fetching the current user profile. Add JWT middleware to protect all non-auth routes. On the frontend, build a Login page and Registration page with form validation, an Auth context/provider that stores the JWT token and user info in localStorage, a ProtectedRoute wrapper component that redirects unauthenticated users to the login page, and a Navbar component displaying the logged-in user's name with a logout button.


### Acceptance Criteria

- DB: users table exists with email unique constraint and password_hash column

- API: POST /api/auth/register creates a new user and returns user data without password

- API: POST /api/auth/login returns a valid JWT token for correct credentials and 401 for invalid

- API: All non-auth endpoints return 401 when no valid token is provided

- UI: User can register, login, and is redirected to the main app on success

- UI: Unauthenticated users are redirected to the login page
