# F001 Task Breakdown: CLI Prerequisites Checker & Environment Setup

**Total tasks**: 1


---


## F001-T01: Implement CLI Prerequisites Checker & Environment Setup

- **Role**: `fullstack_engineer`

- **Story Points**: 5

- **Priority**: critical


### Description
**Database:**
No new tables. The setup command must run existing Alembic migrations (or SQLAlchemy create_all) to ensure the database schema is up to date.

**Backend API:**
No new HTTP endpoints. Implement cli.py at project root using Python argparse/click with subcommand `setup`. Internally: check_prerequisites() verifies python>=3.10, node>=18, pg connection on port 6432, redis connection; install_backend_deps() runs pip install -r requirements.txt; install_frontend_deps() runs npm install in frontend/; run_migrations() executes alembic upgrade head; generate_env() creates .env from .env.example if missing.

**Frontend UI:**
No web UI changes. The CLI itself is the user interface — colored terminal output with status indicators (✓/✗) for each prerequisite check and setup step, plus a final summary.

**Details:**
Create cli.py at the project root using Python with argparse (or click). Implement a `setup` subcommand that first runs prerequisite checks — verifying Python >= 3.10, Node.js >= 18, PostgreSQL connectivity on port 6432, and Redis availability — printing colored pass/fail status for each. If prerequisites pass, it installs backend dependencies via pip, installs frontend dependencies via npm in the frontend/ directory, runs Alembic database migrations, and generates a .env file from .env.example if one does not already exist. The CLI should support a --skip-checks flag to bypass prerequisite verification and a --verbose flag for detailed output.


### Acceptance Criteria

- DB: Running `python cli.py setup` executes Alembic migrations and the database schema is up to date

- API: cli.py exposes a `setup` subcommand with --skip-checks and --verbose flags via argparse

- UI: Terminal output shows colored status (green ✓ / red ✗) for each prerequisite and setup step with a summary at the end

- Prerequisites check detects missing Python, Node.js, PostgreSQL, or Redis and exits with a clear error message

- Backend deps installed via pip and frontend deps installed via npm in frontend/ directory

- .env file is generated from .env.example template if it does not already exist
