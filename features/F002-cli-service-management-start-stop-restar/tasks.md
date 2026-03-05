# F002 Task Breakdown: CLI Service Management (Start/Stop/Restart)

**Total tasks**: 1


---


## F002-T01: Implement CLI Service Management (Start/Stop/Restart)

- **Role**: `fullstack_engineer`

- **Story Points**: 5

- **Priority**: critical


### Description
**Database:**
No schema changes. The start command must verify database connectivity before launching services.

**Backend API:**
No new HTTP endpoints. Extend cli.py with three subcommands: `start` (launches uvicorn backend + vite frontend as managed subprocesses), `stop` (sends SIGTERM to running services tracked via a PID file at .cli.pid), and `restart` (stop then start). Support flags: --port <backend_port> (default 8000), --frontend-port (default 5173), --host (default 127.0.0.1), --debug (enables uvicorn reload + vite verbose).

**Frontend UI:**
No web UI changes. Terminal output shows service start/stop status, process PIDs, and URLs where each service is accessible. Ctrl+C in foreground mode gracefully shuts down both services.

**Details:**
Extend cli.py with `start`, `stop`, and `restart` subcommands. The `start` command first verifies database and Redis connectivity, then launches the FastAPI backend via uvicorn and the Vite frontend dev server as managed child processes. Process PIDs are written to a .cli.pid JSON file for tracking. The `stop` command reads .cli.pid and sends SIGTERM to running processes. The `restart` command performs stop then start. Support --port for backend port (default 8000), --frontend-port for Vite (default 5173), --host (default 127.0.0.1), and --debug flag that enables uvicorn auto-reload and verbose Vite output. Running in foreground mode, Ctrl+C should gracefully terminate both services. All output is formatted with clear service labels and accessible URLs.


### Acceptance Criteria

- DB: `python cli.py start` verifies PostgreSQL and Redis connectivity before launching services

- API: Backend starts on configurable --port (default 8000) and --host (default 127.0.0.1) via uvicorn

- UI: Terminal displays service PIDs and accessible URLs (backend + frontend) after successful start

- `python cli.py stop` terminates all running services tracked in .cli.pid

- `python cli.py restart` performs a clean stop followed by start

- --debug flag enables uvicorn reload mode and verbose Vite output

- Ctrl+C in foreground mode gracefully shuts down both backend and frontend processes
