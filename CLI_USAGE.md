# CLI Usage Guide

## Task ID: dec19774

## Overview
Command-line interface for Order Management Application setup, service management, and monitoring.

## Setup Command

### Basic Usage
```bash
python3 cli.py setup
```

### Available Flags

#### --skip-checks
Skip prerequisite verification and proceed directly with setup.
```bash
python3 cli.py setup --skip-checks
```

#### --verbose
Enable detailed output for all operations.
```bash
python3 cli.py setup --verbose
```

### What the Setup Command Does

1. **Prerequisites Check** (can be skipped with --skip-checks)
   - ✓ Python version >= 3.10
   - ✓ Node.js version >= 18
   - ✓ PostgreSQL connectivity on port 6432
   - ✓ Redis availability on port 6379

2. **Backend Dependencies Installation**
   - Installs all Python packages from `backend/requirements.txt`
   - Uses pip to install dependencies

3. **Frontend Dependencies Installation**
   - Installs all npm packages from `frontend/package.json`
   - Runs `npm install` in the frontend directory

4. **Environment Configuration**
   - Generates `.env` file from `.env.example` if it doesn't exist
   - Preserves existing `.env` file if present

5. **Database Migrations**
   - Attempts to run Alembic migrations if `alembic.ini` exists
   - Falls back to SQLAlchemy `create_all` for schema creation
   - Creates all database tables defined in the models

### Success Output
When setup completes successfully, you'll see:
```
✓ All setup steps completed successfully!

Next steps:
  1. Review and update backend/.env with your configuration
  2. Start the services with: python cli.py start
  3. Access the API at: http://localhost:8000
```

### Error Handling
If any step fails:
- The setup process stops immediately
- A clear error message is displayed
- Use `--verbose` flag to see detailed error information
- Use `--skip-checks` to bypass prerequisite verification if needed

## Examples

### First-time Setup
```bash
# Run complete setup with all checks
python3 cli.py setup

# Or with verbose output for debugging
python3 cli.py setup --verbose
```

### Quick Setup (Skip Checks)
```bash
# Skip prerequisite checks if you know all requirements are met
python3 cli.py setup --skip-checks
```

### Detailed Setup Output
```bash
# See detailed information about each step
python3 cli.py setup --verbose
```

## Prerequisites

Before running setup, ensure you have:
- Python 3.10 or higher installed
- Node.js 18 or higher installed
- PostgreSQL running on port 6432 (default credentials: postgres/postgres)
- Redis running on port 6379 (optional, but recommended)

## Troubleshooting

### PostgreSQL Connection Failed
- Ensure PostgreSQL is running on port 6432
- Check credentials in `.env.example` or `.env`
- Use `--skip-checks` to bypass if you'll configure later

### Node.js Not Found
- Install Node.js version 18 or higher
- Verify installation with: `node --version`

### Python Version Too Old
- Upgrade to Python 3.10 or higher
- Verify installation with: `python3 --version`

### Database Schema Creation Failed
- Check database connectivity
- Verify DATABASE_URL in `.env` file
- Ensure database user has CREATE TABLE permissions
- Use `--verbose` flag to see detailed error messages
