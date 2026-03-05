# Type Consistency Rules

**CRITICAL**: Always maintain strict type consistency across all application layers. Every variable, parameter, and return type must match exactly between definitions and usage.

## Type Matching Checklist
- **Parameter Types**: Does the method parameter type match what the caller passes?
- **Return Types**: Does the return type match what the caller expects?
- **Property Types**: Are entity properties consistent across all layers?
- **Collection Types**: List<T>, IEnumerable<T>, Array<T> - keep consistent
- **Nullable Types**: If nullable in database, maintain nullable throughout

## Method Signature Verification
- **Parameter Count**: Same number of parameters between definition and call
- **Parameter Names**: Use consistent naming (userId vs id vs userIdentifier)
- **Parameter Order**: Maintain same order across layers
- **Optional Parameters**: Default values must be consistent

## Validation Commands
Before submitting code, execute these checks:
1. **Trace the Data Flow**: Follow data from API -> Service -> Repository -> Database
2. **Type Audit**: List all types used for the same logical data across layers
3. **Signature Comparison**: Compare method signatures between interface and implementation
4. **Call-Site Verification**: Ensure every method call passes correct types

## Working with Existing Code
- Always check existing method signatures before writing new calls
- Look at the database entity first to understand canonical types
- Follow established patterns in the codebase
- Don't assume - verify types in multiple files if unsure

## Error Prevention

### NEVER DO THIS
```csharp
// Database: User.Id is int
public class User { public int Id { get; set; } }

// Service: Changing int to string - WRONG!
public async Task<UserDto> GetUser(string userId) // Should be int
{
    var id = int.Parse(userId); // Manual conversion indicates type mismatch
}
```

### ALWAYS DO THIS
```csharp
// Maintain int throughout the chain
public async Task<UserDto> GetUser(int userId) // Matches entity
{
    return await _repository.GetByIdAsync(userId); // Direct pass-through
}
```

## Final Mandate
If ever uncertain about a type, ask the developer or check existing similar code patterns. Never guess or make assumptions about types. **Consistency is more important than convenience.**
