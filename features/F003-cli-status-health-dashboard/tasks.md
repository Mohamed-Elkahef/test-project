# F003 Task Breakdown: CLI Status & Health Dashboard

**Total tasks**: 1


---


## F003-T01: Implement CLI Status & Health Dashboard

- **Role**: `fullstack_engineer`

- **Story Points**: 3

- **Priority**: medium


### Description
**Database:**
No schema changes. The status command queries PostgreSQL connectivity and optionally reports table count or migration status.

**Backend API:**
Extend cli.py with a `status` subcommand. It checks: backend process alive (from .cli.pid), frontend process alive, PostgreSQL reachable on port 6432, Redis reachable, and hits GET /api/health if backend is running. Also add a `logs` subcommand that tails recent backend/frontend log output.

**Frontend UI:**
No web UI changes. Terminal output renders a formatted table showing each service name, status (Running/Stopped/Error), PID, port, and uptime. Color-coded: green for running, red for stopped/error.

**Details:**
Add a `status` subcommand to cli.py that reads .cli.pid to check if backend and frontend processes are alive, tests PostgreSQL and Redis connectivity, and optionally hits the /api/health endpoint if the backend is running. Results are displayed in a formatted terminal table with columns for service name, status, PID, port, and uptime — color-coded green for healthy and red for down. Also add a `logs` subcommand that tails the last N lines (default 50, configurable via --lines) of backend and frontend log output for quick debugging.


### Acceptance Criteria

- DB: Status command reports PostgreSQL connectivity state (connected/unreachable) with host and port

- API: Status command hits /api/health endpoint when backend is running and reports the response

- UI: Terminal displays a formatted color-coded table with service name, status, PID, port, and uptime

- `python cli.py logs` tails recent log output with configurable --lines flag

- All four services (backend, frontend, PostgreSQL, Redis) are reported in the status output
