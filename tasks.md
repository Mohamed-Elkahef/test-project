# Task Breakdown

**Total tasks**: 3


---


## F001: CLI Prerequisites Checker & Environment Setup

*A CLI setup command that verifies all prerequisites (Python, Node.js, PostgreSQL, Redis), installs backend and frontend dependencies, runs database migrations, and generates default environment configuration files.*


### F001-T01: Implement CLI Prerequisites Checker & Environment Setup

- **Role**: `fullstack_engineer`

- **Story Points**: 5

- **Priority**: critical

- **Description**: **Database:**
No new tables. The setup command must run existing Alembic migrations (or SQLAlchemy create_all) to ensure the database schema is up to date.

**Backend API:**
No new HTTP endpoints. Implement cli.py at project root using Python argparse/click with subcommand `setup`. Internally: check_prerequisites() verifies python>=3.10, node>=18, pg connection on port 6432, redis connection; install_backend_deps() runs pip install -r requirements.txt; install_frontend_deps() runs npm install in frontend/; run_migrations() executes alembic upgrade head; generate_env() creates .env from .env.example if missing.

**Frontend UI:**
No web UI changes. The CLI itself is the user interface — colored terminal output with status indicators (✓/✗) for each prerequisite check and setup step, plus a final summary.

**Details:**
Create cli.py at the project root using Python with argparse (or click). Implement a `setup` subcommand that first runs prerequisite checks — verifying Python >= 3.10, Node.js >= 18, PostgreSQL connectivity on port 6432, and Redis availability — printing colored pass/fail status for each. If prerequisites pass, it installs backend dependencies via pip, installs frontend dependencies via npm in the frontend/ directory, runs Alembic database migrations, and generates a .env file from .env.example if one does not already exist. The CLI should support a --skip-checks flag to bypass prerequisite verification and a --verbose flag for detailed output.

- **Acceptance Criteria**:

  - DB: Running `python cli.py setup` executes Alembic migrations and the database schema is up to date

  - API: cli.py exposes a `setup` subcommand with --skip-checks and --verbose flags via argparse

  - UI: Terminal output shows colored status (green ✓ / red ✗) for each prerequisite and setup step with a summary at the end

  - Prerequisites check detects missing Python, Node.js, PostgreSQL, or Redis and exits with a clear error message

  - Backend deps installed via pip and frontend deps installed via npm in frontend/ directory

  - .env file is generated from .env.example template if it does not already exist


> **Dependency note**: F001 should complete before F002 starts if F002 depends on F001 output.


## F002: CLI Service Management (Start/Stop/Restart)

*CLI commands to start, stop, and restart the backend (FastAPI/Uvicorn) and frontend (Vite dev server) services with configurable flags for port, host, and debug mode in development mode.*


### F002-T01: Implement CLI Service Management (Start/Stop/Restart)

- **Role**: `fullstack_engineer`

- **Story Points**: 5

- **Priority**: critical

- **Description**: **Database:**
No schema changes. The start command must verify database connectivity before launching services.

**Backend API:**
No new HTTP endpoints. Extend cli.py with three subcommands: `start` (launches uvicorn backend + vite frontend as managed subprocesses), `stop` (sends SIGTERM to running services tracked via a PID file at .cli.pid), and `restart` (stop then start). Support flags: --port <backend_port> (default 8000), --frontend-port (default 5173), --host (default 127.0.0.1), --debug (enables uvicorn reload + vite verbose).

**Frontend UI:**
No web UI changes. Terminal output shows service start/stop status, process PIDs, and URLs where each service is accessible. Ctrl+C in foreground mode gracefully shuts down both services.

**Details:**
Extend cli.py with `start`, `stop`, and `restart` subcommands. The `start` command first verifies database and Redis connectivity, then launches the FastAPI backend via uvicorn and the Vite frontend dev server as managed child processes. Process PIDs are written to a .cli.pid JSON file for tracking. The `stop` command reads .cli.pid and sends SIGTERM to running processes. The `restart` command performs stop then start. Support --port for backend port (default 8000), --frontend-port for Vite (default 5173), --host (default 127.0.0.1), and --debug flag that enables uvicorn auto-reload and verbose Vite output. Running in foreground mode, Ctrl+C should gracefully terminate both services. All output is formatted with clear service labels and accessible URLs.

- **Acceptance Criteria**:

  - DB: `python cli.py start` verifies PostgreSQL and Redis connectivity before launching services

  - API: Backend starts on configurable --port (default 8000) and --host (default 127.0.0.1) via uvicorn

  - UI: Terminal displays service PIDs and accessible URLs (backend + frontend) after successful start

  - `python cli.py stop` terminates all running services tracked in .cli.pid

  - `python cli.py restart` performs a clean stop followed by start

  - --debug flag enables uvicorn reload mode and verbose Vite output

  - Ctrl+C in foreground mode gracefully shuts down both backend and frontend processes


> **Dependency note**: F002 should complete before F003 starts if F003 depends on F002 output.


## F003: CLI Status & Health Dashboard

*A CLI status command that displays the health and running state of all application services (backend, frontend, database, Redis) in a formatted terminal table.*


### F003-T01: Implement CLI Status & Health Dashboard

- **Role**: `fullstack_engineer`

- **Story Points**: 3

- **Priority**: medium

- **Description**: **Database:**
No schema changes. The status command queries PostgreSQL connectivity and optionally reports table count or migration status.

**Backend API:**
Extend cli.py with a `status` subcommand. It checks: backend process alive (from .cli.pid), frontend process alive, PostgreSQL reachable on port 6432, Redis reachable, and hits GET /api/health if backend is running. Also add a `logs` subcommand that tails recent backend/frontend log output.

**Frontend UI:**
No web UI changes. Terminal output renders a formatted table showing each service name, status (Running/Stopped/Error), PID, port, and uptime. Color-coded: green for running, red for stopped/error.

**Details:**
Add a `status` subcommand to cli.py that reads .cli.pid to check if backend and frontend processes are alive, tests PostgreSQL and Redis connectivity, and optionally hits the /api/health endpoint if the backend is running. Results are displayed in a formatted terminal table with columns for service name, status, PID, port, and uptime — color-coded green for healthy and red for down. Also add a `logs` subcommand that tails the last N lines (default 50, configurable via --lines) of backend and frontend log output for quick debugging.

- **Acceptance Criteria**:

  - DB: Status command reports PostgreSQL connectivity state (connected/unreachable) with host and port

  - API: Status command hits /api/health endpoint when backend is running and reports the response

  - UI: Terminal displays a formatted color-coded table with service name, status, PID, port, and uptime

  - `python cli.py logs` tails recent log output with configurable --lines flag

  - All four services (backend, frontend, PostgreSQL, Redis) are reported in the status output


---

## Task Dependency Graph

```

F001 (CLI Prerequisites Checker & Environment Setup) ──► F002

F002 (CLI Service Management (Start/Stop/Restart)) ──► F003

F003 (CLI Status & Health Dashboard)

```
