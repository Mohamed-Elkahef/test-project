# .NET Core Specific Rules

## Database Layer
- **Entity Properties**: Once you define a property type in an entity/model, use the EXACT same type throughout
- **Repository Methods**: Method signatures must remain identical across interface definitions and implementations
- **Data Access Types**: Never change types when passing data between database layer and business layer

### Example Entity
```csharp
public class User
{
    public int Id { get; set; }
    public string Email { get; set; }
    public DateTime CreatedAt { get; set; }
}

// Repository Interface - MUST MATCH ENTITY
public interface IUserRepository
{
    Task<User> GetByIdAsync(int id); // int, not string or long
    Task<User> CreateAsync(User user); // User entity, not DTO
}
```

## Application/Business Layer
- **Service Methods**: Parameter types must match what you receive from API layer and send to database layer
- **DTOs/Models**: Map types correctly - don't change int to string or DateTime to string
- **Business Logic**: Maintain type contracts established in lower layers

### Example Service
```csharp
public class UserService
{
    public async Task<UserDto> GetUserAsync(int userId) // int from API
    {
        var user = await _repository.GetByIdAsync(userId); // int to repository
        return new UserDto
        {
            Id = user.Id, // int to int
            Email = user.Email, // string to string
            CreatedAt = user.CreatedAt // DateTime to DateTime
        };
    }
}
```

## API/Controller Layer
- **Controller Actions**: Parameter types must match what you pass to service layer
- **Route Parameters**: If route defines {id:int}, use int throughout the chain
- **Request/Response Models**: Types must align with service layer expectations

### Example Controller
```csharp
[HttpGet("{id:int}")]
public async Task<ActionResult<UserDto>> GetUser(int id) // int from route
{
    var user = await _userService.GetUserAsync(id); // int to service
    return Ok(user);
}
```

## Generic Type Consistency
```csharp
// Repository
Task<IEnumerable<User>> GetAllAsync();

// Service - MATCH RETURN TYPE
public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
{
    var users = await _repository.GetAllAsync(); // Returns IEnumerable<User>
    return users.Select(MapToDto); // Returns IEnumerable<UserDto>
}

// Controller - MATCH SERVICE RETURN
[HttpGet]
public async Task<ActionResult<IEnumerable<UserDto>>> GetAllUsers()
{
    var users = await _service.GetAllUsersAsync(); // Expects IEnumerable<UserDto>
    return Ok(users);
}
```
