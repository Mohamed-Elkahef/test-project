# Authentication & API Issues - Fix Summary

**Task ID:** 61b9a31e
**Date:** 2026-03-05
**Type:** Bug Fix - Request URL & Authentication Issues

## Problem Report

**Original Issue:**
```
Request URL: http://localhost:8001/api/orders/?page=1&per_page=10&status=pending
Request Method: GET
Status Code: 401 Unauthorized
Remote Address: 127.0.0.1:8001
```

## Root Cause Analysis

### 1. **Port Mismatch (CRITICAL)**
   - **Location:** `frontend/vite.config.js:12`
   - **Issue:** The Vite development proxy was configured to forward API requests to `http://localhost:8001`
   - **Expected:** Backend runs on port `8000` (as documented in README.md)
   - **Impact:** All API requests from frontend were being sent to wrong port, causing connection failures

### 2. **Missing Token Validation**
   - **Location:** `frontend/src/services/orderService.js`, `frontend/src/services/dashboardService.js`
   - **Issue:** Services were not checking if authentication token exists before making API calls
   - **Impact:** Unclear error messages when users are not authenticated

### 3. **Missing Health Endpoint**
   - **Location:** `backend/app/main.py`
   - **Issue:** Only `/health` endpoint existed, but CLI tasks reference `/api/health`
   - **Impact:** Potential CLI compatibility issues

## Authentication Requirements Audit

### Backend Endpoints

| Endpoint | Method | Auth Required | Dependency |
|----------|--------|---------------|------------|
| `/api/auth/register` | POST | ❌ No | - |
| `/api/auth/login` | POST | ❌ No | - |
| `/api/auth/refresh` | POST | ❌ No | - |
| `/api/auth/me` | GET | ✅ Yes | `get_current_user` |
| `/api/orders/` | POST | ⚠️ Optional | `get_current_user_optional` |
| `/api/orders/` | GET | ✅ Yes | `get_current_user` |
| `/api/orders/{id}` | GET | ✅ Yes | `get_current_user` |
| `/api/orders/{id}/status` | PATCH | ✅ Yes | `get_current_user` |
| `/api/orders/{id}/history` | GET | ✅ Yes | `get_current_user` |
| `/api/orders/{id}/valid-statuses` | GET | ✅ Yes | `get_current_user` |
| `/api/dashboard/summary` | GET | ✅ Yes | `get_current_user` |

### Frontend Routes

| Route | Protected | Component | Auth Check |
|-------|-----------|-----------|------------|
| `/login` | ❌ No | Login | Public |
| `/register` | ❌ No | Register | Public |
| `/` | ✅ Yes | Dashboard | ProtectedRoute |
| `/orders` | ✅ Yes | OrderList | ProtectedRoute |
| `/orders/create` | ✅ Yes | CreateOrder | ProtectedRoute |
| `/orders/:id` | ✅ Yes | OrderDetail | ProtectedRoute |

## Fixes Applied

### 1. **Fixed Port Configuration**
   - **File:** `frontend/vite.config.js`
   - **Change:** Updated proxy target from `http://localhost:8001` to `http://localhost:8000`
   - **Task ID:** 61b9a31e

```javascript
// Before
proxy: {
  '/api': {
    target: 'http://localhost:8001',  // ❌ Wrong port
    changeOrigin: true,
  }
}

// After
proxy: {
  '/api': {
    target: 'http://localhost:8000',  // ✅ Correct port
    changeOrigin: true,
  }
}
```

### 2. **Enhanced Token Validation**
   - **Files:** `frontend/src/services/orderService.js`, `frontend/src/services/dashboardService.js`
   - **Change:** Added token existence check in `_getAuthHeaders()` method
   - **Task ID:** 61b9a31e

```javascript
// Before
_getAuthHeaders() {
  const token = authService.getAccessToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,  // ❌ token might be null
      'Content-Type': 'application/json'
    }
  };
}

// After
_getAuthHeaders() {
  const token = authService.getAccessToken();
  if (!token) {
    throw new Error('No authentication token available. Please login.');
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,  // ✅ token is validated
      'Content-Type': 'application/json'
    }
  };
}
```

### 3. **Added Missing Health Endpoint**
   - **File:** `backend/app/main.py`
   - **Change:** Added `/api/health` endpoint for CLI compatibility
   - **Task ID:** 61b9a31e

```python
@app.get("/api/health")
def api_health_check():
    """
    Task ID: 61b9a31e
    API health check endpoint (for CLI compatibility).
    """
    return {"status": "healthy"}
```

## Authentication Flow

### Current Implementation

1. **User Registration/Login:**
   ```
   Frontend → POST /api/auth/login → Backend
   Backend → Returns { access_token, refresh_token }
   Frontend → Stores tokens in localStorage
   ```

2. **Protected API Calls:**
   ```
   Frontend → Checks token in localStorage
   If no token → Throws error "No authentication token available"
   If token exists → Includes in Authorization header
   Backend → Validates token via get_current_user dependency
   If valid → Returns data
   If invalid/expired → Returns 401
   ```

3. **Token Refresh on 401:**
   ```
   Frontend → Receives 401 error
   Frontend → Calls authService.refreshToken()
   Frontend → Retries original request with new token
   ```

4. **Route Protection:**
   ```
   Frontend → User navigates to protected route
   ProtectedRoute → Checks if user is authenticated
   If not authenticated → Redirects to /login
   If authenticated → Renders component
   ```

## Design Patterns Identified

### 1. **Optional Authentication Pattern**
   - **Endpoint:** `POST /api/orders/`
   - **Pattern:** Uses `get_current_user_optional` dependency
   - **Purpose:** Allows both guest and authenticated users to create orders
   - **Note:** Guest orders have `user_id = None`, authenticated orders are linked to user

### 2. **Required Authentication Pattern**
   - **Endpoints:** All GET endpoints for orders, dashboard
   - **Pattern:** Uses `get_current_user` dependency
   - **Purpose:** Only authenticated users can view data
   - **Security:** Prevents unauthorized access to sensitive data

## Potential Issues & Recommendations

### 1. **Guest Order Visibility**
   - **Issue:** Users can create orders without login, but cannot view them later
   - **Recommendation:** Either:
     a. Require authentication for order creation (most secure)
     b. Add session-based tracking for guest orders
     c. Send order details via email to guest users

### 2. **Token Expiration Handling**
   - **Current:** Frontend retries with refresh token on 401
   - **Issue:** If refresh fails, user stays on page with error
   - **Recommendation:** Redirect to login page if refresh fails

### 3. **CORS Configuration**
   - **Current:** Allows all methods and headers
   - **Security:** Consider restricting to specific origins in production
   - **Config:** Update `ALLOWED_ORIGINS` in `.env` for production deployment

## Testing Checklist

- ✅ **Port Configuration:** Frontend correctly proxies to port 8000
- ✅ **Token Validation:** Services throw clear error when token is missing
- ✅ **Health Endpoint:** Both `/health` and `/api/health` return healthy status
- ⚠️ **401 Error Handling:** Verify token refresh and retry logic works
- ⚠️ **Guest Order Flow:** Test order creation without authentication
- ⚠️ **Protected Routes:** Verify unauthenticated users are redirected to login

## Files Modified

1. `frontend/vite.config.js` - Fixed port from 8001 to 8000
2. `frontend/src/services/orderService.js` - Added token validation
3. `frontend/src/services/dashboardService.js` - Added token validation
4. `backend/app/main.py` - Added `/api/health` endpoint

## Verification Steps

1. **Start Backend:**
   ```bash
   cd backend
   uvicorn app.main:app --reload --port 8000
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Authentication:**
   - Visit `http://localhost:5173`
   - Should redirect to `/login` if not authenticated
   - Login with valid credentials
   - Should be able to access `/orders` and see order list

4. **Test API Calls:**
   ```bash
   # Test health endpoints
   curl http://localhost:8000/health
   curl http://localhost:8000/api/health

   # Test authenticated endpoint (should get 401)
   curl http://localhost:8000/api/orders/?page=1&per_page=10

   # Test with token (should succeed)
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/orders/?page=1&per_page=10
   ```

## Related Documentation

- Authentication Flow: See `README.md` sections on Authentication and API Endpoints
- API Documentation: `http://localhost:8000/docs` (Swagger UI)
- CLAUDE.md: Project-level instructions for agent workflows
