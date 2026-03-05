---
name: backend-testing
description: Comprehensive backend testing toolkit for Python applications using pytest, covering unit tests, integration tests, API testing, database testing, and async testing. Use when building test suites for FastAPI, Flask, Django applications, or any Python backend services.
---

# Backend Testing Skill

This skill provides comprehensive guidance for testing Python backend applications with pytest, FastAPI, Flask, Django, and database testing strategies.

## Core Testing Principles

### Testing Philosophy
- **Write tests first** when possible (TDD approach)
- **Test behavior, not implementation** details
- **Keep tests isolated** and independent
- **Use descriptive test names** that explain what is being tested
- **Follow AAA pattern**: Arrange, Act, Assert

### Required Test Coverage
Per CLAUDE.md requirements:
- **Always create Pytest unit tests** for new features
- Include at least:
  - 1 test for expected use case
  - 1 edge case test
  - 1 failure case test
- Update existing tests when logic changes
- Tests should live in `/tests` folder mirroring app structure

## Pytest Fundamentals

### Test Structure
```python
import pytest
from myapp.services import UserService

def test_create_user_success():
    """Test successful user creation with valid data."""
    # Arrange
    service = UserService()
    user_data = {"email": "test@example.com", "name": "Test User"}

    # Act
    user = service.create_user(user_data)

    # Assert
    assert user.email == "test@example.com"
    assert user.name == "Test User"
    assert user.id is not None

def test_create_user_with_duplicate_email():
    """Test user creation fails with duplicate email."""
    # Arrange
    service = UserService()
    existing_user = service.create_user({"email": "test@example.com", "name": "User 1"})

    # Act & Assert
    with pytest.raises(ValueError, match="Email already exists"):
        service.create_user({"email": "test@example.com", "name": "User 2"})

def test_create_user_with_invalid_email():
    """Test user creation fails with invalid email format."""
    # Arrange
    service = UserService()
    invalid_data = {"email": "not-an-email", "name": "Test User"}

    # Act & Assert
    with pytest.raises(ValueError, match="Invalid email format"):
        service.create_user(invalid_data)
```

### Test Naming Conventions
```python
# Pattern: test_<function_name>_<scenario>_<expected_outcome>

def test_calculate_discount_with_premium_user_returns_20_percent():
    """Premium users receive 20% discount."""
    pass

def test_calculate_discount_with_regular_user_returns_10_percent():
    """Regular users receive 10% discount."""
    pass

def test_calculate_discount_with_expired_membership_returns_zero():
    """Expired memberships receive no discount."""
    pass
```

## Fixtures and Setup

### Basic Fixtures
```python
import pytest
from myapp.database import Database
from myapp.models import User

@pytest.fixture
def db():
    """Provide database connection for tests."""
    database = Database(":memory:")  # Use in-memory DB for tests
    database.connect()
    yield database
    database.disconnect()

@pytest.fixture
def sample_user():
    """Provide a sample user for testing."""
    return User(
        id=1,
        email="test@example.com",
        name="Test User",
        is_active=True
    )

@pytest.fixture
def user_service(db):
    """Provide UserService with test database."""
    from myapp.services import UserService
    return UserService(db)

# Using fixtures in tests
def test_save_user(user_service, sample_user):
    """Test saving user to database."""
    saved_user = user_service.save(sample_user)
    assert saved_user.id is not None
```

### Fixture Scopes
```python
# Function scope (default) - runs before each test
@pytest.fixture(scope="function")
def fresh_database():
    """New database for each test."""
    db = Database(":memory:")
    db.connect()
    yield db
    db.disconnect()

# Module scope - runs once per test module
@pytest.fixture(scope="module")
def app_config():
    """Load app config once per module."""
    from myapp.config import load_config
    return load_config("test")

# Session scope - runs once per test session
@pytest.fixture(scope="session")
def shared_resource():
    """Expensive setup shared across all tests."""
    resource = setup_expensive_resource()
    yield resource
    teardown_expensive_resource(resource)
```

### Parametrized Tests
```python
import pytest

@pytest.mark.parametrize("input_value,expected", [
    (10, 11),
    (0, 1),
    (-5, -4),
    (100, 101),
])
def test_increment(input_value, expected):
    """Test increment function with various inputs."""
    from myapp.utils import increment
    assert increment(input_value) == expected

@pytest.mark.parametrize("email,valid", [
    ("test@example.com", True),
    ("user.name+tag@example.co.uk", True),
    ("invalid.email", False),
    ("@example.com", False),
    ("user@", False),
])
def test_email_validation(email, valid):
    """Test email validation with various formats."""
    from myapp.validators import is_valid_email
    assert is_valid_email(email) == valid
```

## FastAPI Testing

### Test Client Setup
```python
import pytest
from fastapi.testclient import TestClient
from myapp.main import app

@pytest.fixture
def client():
    """Provide FastAPI test client."""
    return TestClient(app)

@pytest.fixture
def auth_headers():
    """Provide authentication headers for protected routes."""
    token = "test_jwt_token"
    return {"Authorization": f"Bearer {token}"}
```

### API Endpoint Tests
```python
def test_get_users_returns_200(client):
    """Test GET /users returns 200 status."""
    # Act
    response = client.get("/api/users")

    # Assert
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_user_with_valid_data(client):
    """Test POST /users creates user with valid data."""
    # Arrange
    user_data = {
        "email": "newuser@example.com",
        "name": "New User",
        "password": "secure_password123"
    }

    # Act
    response = client.post("/api/users", json=user_data)

    # Assert
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == user_data["email"]
    assert data["name"] == user_data["name"]
    assert "password" not in data  # Password should not be returned
    assert "id" in data

def test_create_user_with_invalid_email(client):
    """Test POST /users returns 422 with invalid email."""
    # Arrange
    invalid_data = {
        "email": "not-an-email",
        "name": "Test User",
        "password": "password123"
    }

    # Act
    response = client.post("/api/users", json=invalid_data)

    # Assert
    assert response.status_code == 422
    assert "email" in response.json()["detail"][0]["loc"]

def test_get_user_by_id_requires_authentication(client):
    """Test GET /users/{id} requires authentication."""
    # Act
    response = client.get("/api/users/1")

    # Assert
    assert response.status_code == 401

def test_get_user_by_id_with_auth(client, auth_headers):
    """Test GET /users/{id} returns user with valid auth."""
    # Act
    response = client.get("/api/users/1", headers=auth_headers)

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1

def test_update_user_with_partial_data(client, auth_headers):
    """Test PATCH /users/{id} updates with partial data."""
    # Arrange
    update_data = {"name": "Updated Name"}

    # Act
    response = client.patch("/api/users/1", json=update_data, headers=auth_headers)

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["email"]  # Email should remain unchanged

def test_delete_user_returns_204(client, auth_headers):
    """Test DELETE /users/{id} returns 204 on success."""
    # Act
    response = client.delete("/api/users/1", headers=auth_headers)

    # Assert
    assert response.status_code == 204
```

### Dependency Override
```python
import pytest
from fastapi import FastAPI, Depends
from fastapi.testclient import TestClient

# Original dependency
def get_db():
    """Get database connection."""
    db = Database()
    try:
        yield db
    finally:
        db.close()

# Test with overridden dependency
@pytest.fixture
def client_with_test_db():
    """Client with test database dependency."""
    app = create_app()

    # Override dependency with test database
    def override_get_db():
        db = TestDatabase(":memory:")
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    client = TestClient(app)
    yield client

    # Clear overrides after test
    app.dependency_overrides.clear()

def test_with_overridden_dependency(client_with_test_db):
    """Test using overridden database dependency."""
    response = client_with_test_db.get("/api/users")
    assert response.status_code == 200
```

## Async Testing

### Async Test Functions
```python
import pytest
import asyncio
from myapp.services import AsyncUserService

@pytest.mark.asyncio
async def test_async_create_user():
    """Test async user creation."""
    # Arrange
    service = AsyncUserService()
    user_data = {"email": "async@example.com", "name": "Async User"}

    # Act
    user = await service.create_user(user_data)

    # Assert
    assert user.email == "async@example.com"

@pytest.mark.asyncio
async def test_async_fetch_users():
    """Test async user fetching."""
    service = AsyncUserService()
    users = await service.fetch_all()
    assert isinstance(users, list)
```

### Async Fixtures
```python
import pytest
import pytest_asyncio

@pytest_asyncio.fixture
async def async_db():
    """Provide async database connection."""
    from myapp.database import AsyncDatabase
    db = AsyncDatabase("postgresql://localhost/test")
    await db.connect()
    yield db
    await db.disconnect()

@pytest_asyncio.fixture
async def async_client():
    """Provide async HTTP client."""
    import httpx
    async with httpx.AsyncClient() as client:
        yield client

@pytest.mark.asyncio
async def test_with_async_fixtures(async_db, async_client):
    """Test using async fixtures."""
    # Use async database
    result = await async_db.execute("SELECT 1")
    assert result is not None

    # Use async client
    response = await async_client.get("https://api.example.com/data")
    assert response.status_code == 200
```

### Testing FastAPI Async Endpoints
```python
import pytest
from httpx import AsyncClient
from myapp.main import app

@pytest.mark.asyncio
async def test_async_endpoint():
    """Test async FastAPI endpoint."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/async-users")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_concurrent_requests():
    """Test handling multiple concurrent requests."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Make concurrent requests
        responses = await asyncio.gather(
            client.get("/api/users/1"),
            client.get("/api/users/2"),
            client.get("/api/users/3")
        )

        # Verify all succeeded
        assert all(r.status_code == 200 for r in responses)
```

## Database Testing

### Database Fixtures
```python
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from myapp.models import Base

@pytest.fixture(scope="function")
def db_engine():
    """Create test database engine."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    yield engine
    Base.metadata.drop_all(engine)
    engine.dispose()

@pytest.fixture
def db_session(db_engine):
    """Provide database session with automatic rollback."""
    SessionLocal = sessionmaker(bind=db_engine)
    session = SessionLocal()
    yield session
    session.rollback()
    session.close()

@pytest.fixture
def seed_database(db_session):
    """Seed database with test data."""
    from myapp.models import User, Product

    # Create test users
    users = [
        User(email="user1@example.com", name="User 1"),
        User(email="user2@example.com", name="User 2"),
    ]
    db_session.add_all(users)

    # Create test products
    products = [
        Product(name="Product 1", price=10.99),
        Product(name="Product 2", price=20.99),
    ]
    db_session.add_all(products)

    db_session.commit()
    return {"users": users, "products": products}
```

### Testing Database Operations
```python
def test_create_and_retrieve_user(db_session):
    """Test creating and retrieving user from database."""
    from myapp.models import User

    # Create user
    user = User(email="test@example.com", name="Test User")
    db_session.add(user)
    db_session.commit()

    # Retrieve user
    retrieved = db_session.query(User).filter_by(email="test@example.com").first()
    assert retrieved is not None
    assert retrieved.name == "Test User"

def test_update_user(db_session, seed_database):
    """Test updating user in database."""
    from myapp.models import User

    # Get existing user
    user = db_session.query(User).first()
    original_name = user.name

    # Update user
    user.name = "Updated Name"
    db_session.commit()

    # Verify update
    db_session.refresh(user)
    assert user.name == "Updated Name"
    assert user.name != original_name

def test_delete_user(db_session, seed_database):
    """Test deleting user from database."""
    from myapp.models import User

    # Get user count
    initial_count = db_session.query(User).count()

    # Delete user
    user = db_session.query(User).first()
    db_session.delete(user)
    db_session.commit()

    # Verify deletion
    final_count = db_session.query(User).count()
    assert final_count == initial_count - 1

def test_query_with_filter(db_session, seed_database):
    """Test querying with filters."""
    from myapp.models import Product

    # Query products under $15
    cheap_products = db_session.query(Product).filter(Product.price < 15).all()

    assert len(cheap_products) == 1
    assert cheap_products[0].price == 10.99
```

### Transaction Testing
```python
import pytest
from sqlalchemy.exc import IntegrityError

def test_transaction_rollback_on_error(db_session):
    """Test transaction rolls back on error."""
    from myapp.models import User

    # Initial count
    initial_count = db_session.query(User).count()

    try:
        # Create user with unique email
        user1 = User(email="unique@example.com", name="User 1")
        db_session.add(user1)
        db_session.flush()

        # Try to create duplicate (should fail)
        user2 = User(email="unique@example.com", name="User 2")
        db_session.add(user2)
        db_session.commit()

        pytest.fail("Should have raised IntegrityError")
    except IntegrityError:
        db_session.rollback()

    # Verify no users were added
    final_count = db_session.query(User).count()
    assert final_count == initial_count
```

## Mocking and Patching

### Mock External Services
```python
import pytest
from unittest.mock import Mock, patch, AsyncMock
from myapp.services import EmailService, UserService

def test_send_welcome_email_with_mock():
    """Test sending welcome email with mocked email service."""
    # Arrange
    mock_email_service = Mock(spec=EmailService)
    mock_email_service.send_email.return_value = True

    user_service = UserService(email_service=mock_email_service)

    # Act
    user_service.send_welcome_email("test@example.com")

    # Assert
    mock_email_service.send_email.assert_called_once_with(
        to="test@example.com",
        subject="Welcome!",
        body="Welcome to our service"
    )

@patch('myapp.services.requests.get')
def test_fetch_external_data(mock_get):
    """Test fetching external data with mocked HTTP request."""
    # Arrange
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"data": "test"}
    mock_get.return_value = mock_response

    from myapp.services import fetch_data

    # Act
    result = fetch_data("https://api.example.com/data")

    # Assert
    assert result == {"data": "test"}
    mock_get.assert_called_once_with("https://api.example.com/data")
```

### Mock Async Functions
```python
import pytest
from unittest.mock import AsyncMock

@pytest.mark.asyncio
async def test_async_service_with_mock():
    """Test async service with mocked dependency."""
    # Arrange
    mock_db = AsyncMock()
    mock_db.fetch_user.return_value = {"id": 1, "name": "Test User"}

    from myapp.services import AsyncUserService
    service = AsyncUserService(db=mock_db)

    # Act
    user = await service.get_user(1)

    # Assert
    assert user["name"] == "Test User"
    mock_db.fetch_user.assert_called_once_with(1)
```

### Context Managers and Patches
```python
from unittest.mock import patch

def test_with_environment_variables():
    """Test with mocked environment variables."""
    with patch.dict('os.environ', {'API_KEY': 'test_key', 'DEBUG': 'true'}):
        from myapp.config import get_config
        config = get_config()
        assert config.api_key == 'test_key'
        assert config.debug is True

def test_with_datetime_mock():
    """Test with mocked datetime."""
    from datetime import datetime

    fixed_time = datetime(2024, 1, 1, 12, 0, 0)

    with patch('myapp.utils.datetime') as mock_datetime:
        mock_datetime.now.return_value = fixed_time

        from myapp.utils import get_timestamp
        timestamp = get_timestamp()

        assert timestamp == fixed_time
```

## Integration Testing

### API Integration Tests
```python
import pytest
from fastapi.testclient import TestClient
from myapp.main import app

@pytest.mark.integration
def test_user_registration_flow():
    """Test complete user registration flow."""
    client = TestClient(app)

    # Step 1: Register user
    register_data = {
        "email": "integration@example.com",
        "name": "Integration User",
        "password": "secure_password123"
    }
    response = client.post("/api/register", json=register_data)
    assert response.status_code == 201
    user_id = response.json()["id"]

    # Step 2: Verify email (mock verification)
    verify_response = client.post(f"/api/verify/{user_id}", json={"code": "123456"})
    assert verify_response.status_code == 200

    # Step 3: Login
    login_response = client.post("/api/login", json={
        "email": "integration@example.com",
        "password": "secure_password123"
    })
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]

    # Step 4: Access protected resource
    headers = {"Authorization": f"Bearer {token}"}
    profile_response = client.get("/api/profile", headers=headers)
    assert profile_response.status_code == 200
    assert profile_response.json()["email"] == "integration@example.com"

@pytest.mark.integration
def test_order_creation_with_inventory_update():
    """Test order creation updates inventory."""
    client = TestClient(app)

    # Get initial inventory
    product_response = client.get("/api/products/1")
    initial_stock = product_response.json()["stock"]

    # Create order
    order_data = {
        "product_id": 1,
        "quantity": 2,
        "customer_email": "customer@example.com"
    }
    order_response = client.post("/api/orders", json=order_data)
    assert order_response.status_code == 201

    # Verify inventory decreased
    updated_product = client.get("/api/products/1")
    final_stock = updated_product.json()["stock"]
    assert final_stock == initial_stock - 2
```

### Database Migration Tests
```python
import pytest
from alembic.config import Config
from alembic import command

@pytest.mark.integration
def test_migrations_up_and_down():
    """Test database migrations can upgrade and downgrade."""
    # Create alembic config
    alembic_cfg = Config("alembic.ini")
    alembic_cfg.set_main_option("sqlalchemy.url", "sqlite:///test_migration.db")

    # Upgrade to head
    command.upgrade(alembic_cfg, "head")

    # Downgrade one revision
    command.downgrade(alembic_cfg, "-1")

    # Upgrade back to head
    command.upgrade(alembic_cfg, "head")
```

## Test Organization

### Conftest.py Structure
```python
# tests/conftest.py - Shared fixtures for all tests

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from myapp.main import app
from myapp.database import Base, get_db
from myapp.config import Settings

@pytest.fixture(scope="session")
def test_settings():
    """Test application settings."""
    return Settings(
        database_url="sqlite:///./test.db",
        secret_key="test_secret_key",
        debug=True
    )

@pytest.fixture(scope="function")
def db_session(test_settings):
    """Database session for tests."""
    engine = create_engine(test_settings.database_url)
    Base.metadata.create_all(engine)

    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()

    yield session

    session.close()
    Base.metadata.drop_all(engine)

@pytest.fixture
def client(db_session):
    """FastAPI test client."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()

@pytest.fixture
def authenticated_client(client, db_session):
    """Test client with authentication."""
    from myapp.models import User
    from myapp.auth import create_access_token

    # Create test user
    user = User(email="test@example.com", name="Test User")
    db_session.add(user)
    db_session.commit()

    # Generate token
    token = create_access_token({"sub": str(user.id)})

    # Add auth header to client
    client.headers["Authorization"] = f"Bearer {token}"

    return client
```

### Test Module Organization
```
tests/
├── conftest.py                 # Shared fixtures
├── unit/
│   ├── __init__.py
│   ├── test_models.py         # Model tests
│   ├── test_services.py       # Service layer tests
│   ├── test_validators.py     # Validation logic tests
│   └── test_utils.py          # Utility function tests
├── integration/
│   ├── __init__.py
│   ├── test_api_flows.py      # End-to-end API tests
│   ├── test_database.py       # Database integration tests
│   └── test_auth.py           # Authentication flow tests
└── fixtures/
    ├── __init__.py
    ├── users.py               # User-related fixtures
    └── products.py            # Product-related fixtures
```

## Running Tests

### Basic Commands
```bash
# Run all tests
pytest

# Run specific test file
pytest tests/unit/test_services.py

# Run specific test function
pytest tests/unit/test_services.py::test_create_user_success

# Run tests matching pattern
pytest -k "user"

# Run with verbose output
pytest -v

# Run with coverage
pytest --cov=myapp --cov-report=html

# Run only integration tests
pytest -m integration

# Run excluding integration tests
pytest -m "not integration"

# Run in parallel (requires pytest-xdist)
pytest -n auto
```

### Pytest Configuration
```ini
# pytest.ini or pyproject.toml

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]

# Markers
markers = [
    "unit: Unit tests",
    "integration: Integration tests",
    "slow: Slow running tests",
    "asyncio: Async tests"
]

# Async support
asyncio_mode = "auto"

# Coverage options
addopts = [
    "--strict-markers",
    "--cov=myapp",
    "--cov-report=term-missing",
    "--cov-report=html",
    "--cov-fail-under=80"
]
```

## Best Practices

### DO:
✅ Write descriptive test names that explain what is being tested
✅ Use fixtures for setup and teardown
✅ Test edge cases and error conditions
✅ Keep tests isolated and independent
✅ Mock external dependencies
✅ Test behavior, not implementation
✅ Use parametrized tests for multiple scenarios
✅ Maintain test coverage above 80%
✅ Run tests before committing code
✅ Use type hints in test functions

### DON'T:
❌ Test private methods directly
❌ Create interdependent tests
❌ Use production database for tests
❌ Hardcode test data that changes frequently
❌ Skip cleanup in fixtures
❌ Test framework code (trust the frameworks)
❌ Write overly complex tests
❌ Ignore failing tests
❌ Test everything in a single function
❌ Forget to test error paths

## Per CLAUDE.md Requirements

### Activating Virtual Environment
```bash
# Always activate venv_linux before running tests
source venv_linux/bin/activate

# Run tests with python3
python3 -m pytest tests/
```

### Test File Location
```
myapp/
├── services/
│   ├── __init__.py
│   └── user_service.py
└── tests/
    ├── __init__.py
    └── test_user_service.py     # Mirrors structure
```

### Minimum Test Requirements
```python
# For every new feature/function, create:

def test_feature_expected_use():
    """Test normal, expected usage."""
    pass

def test_feature_edge_case():
    """Test boundary conditions or unusual inputs."""
    pass

def test_feature_failure_case():
    """Test error conditions and exceptions."""
    pass
```

## When to Use This Skill

- Writing pytest unit tests for Python backend code
- Testing FastAPI, Flask, or Django applications
- Setting up test fixtures and mocking
- Testing async functions and endpoints
- Database testing and transaction handling
- Integration testing for API flows
- Following CLAUDE.md testing requirements
- Debugging test failures
- Improving test coverage
