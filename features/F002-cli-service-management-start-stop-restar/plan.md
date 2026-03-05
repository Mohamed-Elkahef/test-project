# F002: CLI Service Management (Start/Stop/Restart)

**Priority**: critical  |  **Story Points**: 5


## Description

CLI commands to start, stop, and restart the backend (FastAPI/Uvicorn) and frontend (Vite dev server) services with configurable flags for port, host, and debug mode in development mode.


## Roles Involved

fullstack_engineer


## Implementation Order

1. Database schema / migrations (if applicable)

2. Backend API endpoints and business logic

3. Frontend components and integration


## Dependencies

- **Depends on**: F001 (must complete first)

- **Blocks**: F003 (must finish before F003 starts)


## Acceptance

- All role tasks within this feature pass their acceptance criteria

- Feature is independently testable end-to-end
