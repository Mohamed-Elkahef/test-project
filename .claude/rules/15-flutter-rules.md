# Flutter/Dart Specific Rules

## Widget State Management Consistency

### Model Definition
```dart
class User {
  final int id;
  final String email;
  final DateTime createdAt;

  User({required this.id, required this.email, required this.createdAt});
}
```

### API Service - Match Model Types
```dart
class UserApiService {
  Future<User> getUserById(int userId) async { // int parameter
    final response = await http.get('/users/$userId'); // int in URL
    return User.fromJson(response.data); // Returns User object
  }
}
```

### Repository - Maintain Types
```dart
class UserRepository {
  Future<User> getUser(int userId) async { // int parameter
    return await _apiService.getUserById(userId); // int argument
  }
}
```

### Widget - Consistent Types
```dart
class UserProfileWidget extends StatelessWidget {
  final int userId; // int property

  UserProfileWidget({required this.userId});

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<User>(
      future: userRepository.getUser(userId), // int argument
      builder: (context, snapshot) {
        // Handle User object consistently
      },
    );
  }
}
```

## BLoC Pattern Type Consistency
```dart
// Events - DEFINE PARAMETER TYPES
abstract class UserEvent {}

class LoadUser extends UserEvent {
  final int userId; // int type established
  LoadUser(this.userId);
}

// State - MATCH MODEL TYPES
abstract class UserState {}

class UserLoaded extends UserState {
  final User user; // User object type
  UserLoaded(this.user);
}

// BLoC - MAINTAIN TYPE CONSISTENCY
class UserBloc extends Bloc<UserEvent, UserState> {
  UserBloc() : super(UserInitial()) {
    on<LoadUser>((event, emit) async {
      final user = await _repository.getUser(event.userId); // int to repository
      emit(UserLoaded(user)); // User object to state
    });
  }
}

// Widget Usage - CONSISTENT TYPES
BlocProvider.of<UserBloc>(context).add(LoadUser(widget.userId)); // int parameter
```

## JSON Serialization Type Consistency
```dart
class User {
  final int id;
  final String email;
  final DateTime createdAt;

  User({required this.id, required this.email, required this.createdAt});

  // fromJson - MATCH BACKEND TYPES
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as int, // Ensure int, not dynamic
      email: json['email'] as String, // Ensure String
      createdAt: DateTime.parse(json['createdAt'] as String), // Parse to DateTime
    );
  }

  // toJson - MAINTAIN TYPES
  Map<String, dynamic> toJson() {
    return {
      'id': id, // int
      'email': email, // String
      'createdAt': createdAt.toIso8601String(), // DateTime to String
    };
  }
}
```

## Navigation Parameter Type Consistency
```dart
// Route Definition
class UserDetailPage extends StatelessWidget {
  final int userId; // int parameter

  UserDetailPage({required this.userId});
}

// Navigation - MATCH PARAMETER TYPES
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) => UserDetailPage(userId: user.id), // int argument
  ),
);

// Named Routes - TYPE CONSISTENCY
'/user/:id': (context, state) {
  final userId = int.parse(state.pathParameters['id']!); // String to int
  return UserDetailPage(userId: userId); // int parameter
}
```

## Flutter-Specific Error Prevention

### NEVER DO THIS
```dart
// Widget expects int, passing String
UserWidget(userId: "123"); // String instead of int

// Stream type mismatch
StreamBuilder<User>( // Expects User
  stream: usersListStream, // Provides List<User> - WRONG!
  builder: (context, snapshot) => ...
)

// JSON casting without type safety
final id = json['id']; // dynamic type - WRONG!
```

### ALWAYS DO THIS
```dart
// Correct type usage
UserWidget(userId: 123); // int as expected

// Matching stream types
StreamBuilder<List<User>>( // Matches stream type
  stream: usersListStream, // Provides List<User>
  builder: (context, snapshot) => ...
)

// Safe JSON casting
final id = json['id'] as int; // Explicit type casting
```

## Flutter Best Practices
- **Avoid `withOpacity`**: Use best practices for opacity (check context7 documentation)
- Widget Properties: Ensure widget constructor parameters match usage
- Callback Types: Function signatures must match between definition and usage
- Generic Widgets: `ListView<T>`, `FutureBuilder<T>` - maintain T consistency
- State Types: StatefulWidget state variables must match widget properties

## Mandatory Validation Before Writing Code
1. **Widget Property Audit**: Check all widget constructor parameters match usage
2. **Async Type Tracing**: Follow Future/Stream types through the entire chain
3. **State Management Flow**: Verify types from event -> state -> UI
4. **JSON Serialization Check**: Ensure fromJson/toJson maintain type contracts
5. **Navigation Parameter Verification**: Confirm route parameters match page constructors
