---
name: api-debugging
description: Debug FastAPI applications, trace async issues, inspect database queries, analyze logs, identify performance bottlenecks, and resolve common API errors
---

# API Debugging Skill

Comprehensive debugging strategies for FastAPI applications with async operations, database interactions, and complex agent workflows.

## Common Error Patterns

### 1. Database Connection Issues

**Symptom:** `ConnectionRefusedError: [Errno 61] Connection refused`

**Causes:**
- Database server not running
- Wrong connection parameters (host, port)
- Firewall blocking connection
- Connection pool exhausted

**Debugging Steps:**
```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Check what's listening on the port
lsof -i :5432

# Check PostgreSQL logs
tail -f /var/log/postgresql/postgresql-*.log

# Test connection with psql
psql -h localhost -p 5432 -U username -d database_name

# Check environment variables
echo $DATABASE_URL
```

**Solutions:**
```python
# Add connection retry logic
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10)
)
async def initialize_database():
    """Initialize database with retry logic."""
    try:
        await db_pool.initialize()
        logger.info("✅ Database connected")
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        raise

# Add connection health check
async def check_database_health():
    """Health check for database connection."""
    try:
        async with db_pool.acquire() as conn:
            await conn.fetchval("SELECT 1")
        return True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return False
```

### 2. Async/Await Issues

**Symptom:** `RuntimeWarning: coroutine was never awaited`

**Cause:** Calling async function without await

**Example:**
```python
# ❌ Wrong - coroutine not awaited
result = get_user(user_id)

# ✅ Correct - await the coroutine
result = await get_user(user_id)

# ❌ Wrong - await in non-async function
def process_data():
    result = await get_data()  # SyntaxError

# ✅ Correct - make function async
async def process_data():
    result = await get_data()
```

**Debugging:**
```python
import asyncio
import inspect

def check_async_usage(func):
    """Decorator to check if function is properly awaited."""
    if inspect.iscoroutinefunction(func):
        async def wrapper(*args, **kwargs):
            logger.debug(f"Calling async function: {func.__name__}")
            result = await func(*args, **kwargs)
            logger.debug(f"Completed async function: {func.__name__}")
            return result
        return wrapper
    return func
```

### 3. Database Constraint Violations

**Symptom:** `new row for relation "messages" violates check constraint "valid_message_phase"`

**Cause:** Data doesn't match database constraint (e.g., uppercase vs lowercase)

**Debugging:**
```sql
-- Check constraint definition
SELECT
    con.conname AS constraint_name,
    con.contype AS constraint_type,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'messages'
  AND con.conname LIKE '%phase%';

-- Check existing data
SELECT DISTINCT conversation_phase
FROM messages
WHERE conversation_phase IS NOT NULL;
```

**Solution:**
```python
# Normalize data before database insertion
def normalize_phase(phase: str | None) -> str | None:
    """Normalize phase to lowercase to match database constraint."""
    if phase is None:
        return None
    return phase.lower().strip()

# Apply in tool functions
async def save_message(conversation_phase: str | None = None):
    """Save message with normalized phase."""
    normalized_phase = normalize_phase(conversation_phase)

    await db.execute(
        "INSERT INTO messages (conversation_phase, ...) VALUES ($1, ...)",
        normalized_phase
    )
```

### 4. N+1 Query Problem

**Symptom:** Slow API response, many individual database queries

**Example:**
```python
# ❌ N+1 Query Problem
users = await db.fetch("SELECT * FROM users")
for user in users:
    orders = await db.fetch(
        "SELECT * FROM orders WHERE user_id = $1", user.id
    )  # One query per user!

# ✅ Solution: Use JOIN or batch loading
users_with_orders = await db.fetch("""
    SELECT
        u.*,
        json_agg(o.*) as orders
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id
    GROUP BY u.id
""")
```

**Debugging:**
```python
# Add query logging
import logging

# Enable asyncpg query logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger('asyncpg')
logger.setLevel(logging.DEBUG)

# Or use middleware to log all queries
class QueryLogMiddleware:
    async def __call__(self, request, call_next):
        # Log query count before request
        query_count_before = get_query_count()

        response = await call_next(request)

        # Log query count after request
        query_count_after = get_query_count()
        logger.info(f"Queries executed: {query_count_after - query_count_before}")

        return response
```

### 5. Pydantic Validation Errors

**Symptom:** `ValidationError: value is not a valid...`

**Debugging:**
```python
from pydantic import BaseModel, Field, validator
import logging

logger = logging.getLogger(__name__)

class UserCreate(BaseModel):
    email: str
    name: str
    age: int | None = None

    @validator('email')
    def validate_email(cls, v):
        if '@' not in v:
            logger.error(f"Invalid email format: {v}")
            raise ValueError('Invalid email format')
        return v

    @validator('age')
    def validate_age(cls, v):
        if v is not None and (v < 0 or v > 150):
            logger.error(f"Invalid age: {v}")
            raise ValueError('Age must be between 0 and 150')
        return v

# Usage with error handling
try:
    user = UserCreate(email="test@example.com", name="Test", age=25)
except ValidationError as e:
    logger.error(f"Validation failed: {e}")
    # Print detailed error information
    for error in e.errors():
        logger.error(f"Field: {error['loc']}, Error: {error['msg']}")
```

### 6. Memory Leaks in Async Code

**Symptom:** Memory usage grows over time, doesn't release

**Causes:**
- Not closing database connections
- Event loop tasks not being cancelled
- Circular references
- Large objects in cache

**Debugging:**
```python
import tracemalloc
import asyncio

# Start memory tracking
tracemalloc.start()

# Get memory snapshot
snapshot = tracemalloc.take_snapshot()
top_stats = snapshot.statistics('lineno')

print("[ Top 10 memory consumers ]")
for stat in top_stats[:10]:
    print(stat)

# Check for connection leaks
async def check_connection_pool():
    """Monitor connection pool status."""
    logger.info(f"Pool size: {db_pool.pool.get_size()}")
    logger.info(f"Free connections: {db_pool.pool.get_idle_size()}")
    logger.info(f"Used connections: {db_pool.pool.get_size() - db_pool.pool.get_idle_size()}")
```

**Solutions:**
```python
# Always use context managers
async with db_pool.acquire() as conn:
    result = await conn.fetch(query)
# Connection automatically released

# Cancel background tasks properly
tasks = []
try:
    task = asyncio.create_task(background_job())
    tasks.append(task)
    await task
finally:
    for task in tasks:
        if not task.done():
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass

# Clear cache periodically
from cachetools import TTLCache

cache = TTLCache(maxsize=1000, ttl=3600)  # Auto-expires after 1 hour
```

## Debugging Tools & Techniques

### 1. Logging Strategy

```python
import logging
import sys
from pythonjsonlogger import jsonlogger

# Configure structured logging
def setup_logging():
    """Setup structured JSON logging."""

    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    # JSON formatter
    formatter = jsonlogger.JsonFormatter(
        '%(asctime)s %(name)s %(levelname)s %(message)s'
    )

    # Console handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)
    logger.addHandler(handler)

# Usage in code
logger.info("Processing request", extra={
    "user_id": user_id,
    "endpoint": "/api/users",
    "method": "GET"
})

logger.error("Database query failed", extra={
    "query": query,
    "error": str(e),
    "user_id": user_id
}, exc_info=True)
```

### 2. Request Tracing

```python
import uuid
from contextvars import ContextVar

# Request ID context variable
request_id_var: ContextVar[str] = ContextVar('request_id', default='')

# Middleware to add request ID
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = request.headers.get('X-Request-ID', str(uuid.uuid4()))
    request_id_var.set(request_id)

    logger.info(f"🔍 Request started", extra={
        "request_id": request_id,
        "method": request.method,
        "url": str(request.url)
    })

    response = await call_next(request)

    logger.info(f"✅ Request completed", extra={
        "request_id": request_id,
        "status_code": response.status_code
    })

    response.headers['X-Request-ID'] = request_id
    return response

# Use request ID in logging
def get_logger(name: str):
    """Get logger with request ID."""
    logger = logging.getLogger(name)

    class RequestIDFilter(logging.Filter):
        def filter(self, record):
            record.request_id = request_id_var.get()
            return True

    logger.addFilter(RequestIDFilter())
    return logger
```

### 3. Performance Profiling

```python
import time
from functools import wraps

def profile_async(func):
    """Profile async function execution time."""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start = time.time()
        try:
            result = await func(*args, **kwargs)
            return result
        finally:
            elapsed = time.time() - start
            logger.info(f"⏱️ {func.__name__} took {elapsed:.2f}s")
    return wrapper

# Usage
@profile_async
async def slow_operation():
    await asyncio.sleep(2)
    return "done"

# Profile database queries
class QueryProfiler:
    def __init__(self):
        self.queries = []

    async def execute(self, query: str, *params):
        start = time.time()
        result = await db.fetch(query, *params)
        elapsed = time.time() - start

        self.queries.append({
            'query': query,
            'params': params,
            'duration': elapsed,
            'rows': len(result)
        })

        if elapsed > 1.0:
            logger.warning(f"⚠️ Slow query ({elapsed:.2f}s): {query[:100]}")

        return result

    def report(self):
        total_time = sum(q['duration'] for q in self.queries)
        logger.info(f"📊 Total queries: {len(self.queries)}")
        logger.info(f"⏱️ Total time: {total_time:.2f}s")

        # Show slowest queries
        slowest = sorted(self.queries, key=lambda q: q['duration'], reverse=True)[:5]
        for i, q in enumerate(slowest, 1):
            logger.info(f"#{i} {q['duration']:.2f}s: {q['query'][:100]}")
```

### 4. Database Query Analysis

```sql
-- Enable query logging in PostgreSQL
ALTER DATABASE your_db SET log_statement = 'all';
ALTER DATABASE your_db SET log_duration = on;
ALTER DATABASE your_db SET log_min_duration_statement = 100;  -- Log queries > 100ms

-- Find slow queries
SELECT
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Check table statistics
SELECT
    schemaname,
    tablename,
    n_live_tup as row_count,
    n_dead_tup as dead_rows,
    last_vacuum,
    last_autovacuum
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

-- Check index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexname NOT LIKE '%_pkey';  -- Ignore primary keys
```

### 5. API Testing with httpx

```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_user():
    """Test user creation endpoint."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/users",
            json={
                "email": "test@example.com",
                "name": "Test User"
            }
        )

        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "test@example.com"
        assert "id" in data

@pytest.mark.asyncio
async def test_error_handling():
    """Test error response format."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/users/99999")

        assert response.status_code == 404
        data = response.json()
        assert "error" in data
```

## Debugging Checklist

### When API Request Fails

1. **Check request format**
   - [ ] Correct HTTP method (GET, POST, PUT, DELETE)?
   - [ ] Headers include Content-Type?
   - [ ] Request body is valid JSON?
   - [ ] Authentication token is valid?

2. **Check server logs**
   - [ ] Any error messages?
   - [ ] Stack trace available?
   - [ ] What's the request ID?

3. **Check database**
   - [ ] Connection successful?
   - [ ] Query syntax correct?
   - [ ] Data exists?
   - [ ] Constraints satisfied?

4. **Check environment**
   - [ ] Environment variables loaded?
   - [ ] Correct database URL?
   - [ ] Required services running?

### When Performance is Slow

1. **Profile the request**
   - [ ] How long does each part take?
   - [ ] Database queries count?
   - [ ] External API calls?

2. **Check database**
   - [ ] Indexes exist on query columns?
   - [ ] Query plan looks good?
   - [ ] Connection pool size appropriate?

3. **Check caching**
   - [ ] Are frequently accessed data cached?
   - [ ] Cache hit rate?
   - [ ] Cache TTL appropriate?

## Best Practices

1. **Always log errors with context**
   ```python
   logger.error("Failed to create user", extra={
       "email": email,
       "error": str(e),
       "user_id": current_user_id
   }, exc_info=True)
   ```

2. **Use type hints and validation**
   ```python
   async def get_user(user_id: int) -> User | None:
       """Type hints help catch errors early."""
       pass
   ```

3. **Add health checks**
   ```python
   @app.get("/health")
   async def health_check():
       db_healthy = await check_database_health()
       return {
           "status": "healthy" if db_healthy else "unhealthy",
           "database": db_healthy
       }
   ```

4. **Monitor in production**
   - Use APM tools (DataDog, New Relic, Sentry)
   - Set up alerts for error rates
   - Monitor response times
   - Track database query performance

## When to Use This Skill

- Debugging FastAPI application errors
- Tracing async/await issues
- Resolving database connection problems
- Fixing constraint violations
- Optimizing slow API endpoints
- Investigating memory leaks
- Setting up logging and monitoring
