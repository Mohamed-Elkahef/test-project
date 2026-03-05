# Python Specific Rules

## Type Hints Consistency
Always use type hints and maintain consistency across all layers.

### Example
```python
# Database Model - ESTABLISH TYPES
class User:
    id: int
    email: str
    created_at: datetime

# Repository - MATCH MODEL TYPES
async def get_user_by_id(user_id: int) -> Optional[User]:  # int parameter
    pass

# Service - MAINTAIN TYPES
async def get_user(user_id: int) -> UserDTO:  # int parameter
    user = await repository.get_user_by_id(user_id)  # int argument
    return UserDTO(
        id=user.id,  # int to int
        email=user.email,  # str to str
        created_at=user.created_at  # datetime to datetime
    )

# API Endpoint - CONSISTENT TYPES
@app.get("/users/{user_id}")
async def get_user_endpoint(user_id: int) -> UserDTO:  # int parameter
    return await service.get_user(user_id)  # int argument
```

## Key Rules
- Use type hints for all function parameters and return values
- Match parameter types between function definitions and calls
- Match return types between function definitions and callers' expectations
- Use Optional[] for nullable types
- Use appropriate collection types (List, Dict, Set) consistently
