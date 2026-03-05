#!/usr/bin/env python3
"""
Task ID: dec19774, f34e7493, f266a612
CLI tool for Order Management Application setup and management.
Provides commands for environment setup, prerequisites checking, service management,
status monitoring, and log viewing.
"""

import argparse
import json
import os
import signal
import socket
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Tuple, Optional, Dict, List

# ANSI color codes for terminal output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    RESET = '\033[0m'


# Path constants for service management
PROJECT_ROOT = Path(__file__).parent.absolute()
PID_FILE = PROJECT_ROOT / ".cli.pid"

# Global variable to track running processes
running_processes = []


class SetupManager:
    """Manages the setup process for the Order Management Application."""

    def __init__(self, verbose: bool = False):
        self.verbose = verbose
        self.root_dir = Path(__file__).parent.absolute()
        self.backend_dir = self.root_dir / "backend"
        self.frontend_dir = self.root_dir / "frontend"
        self.checks_passed = True

    def print_status(self, message: str, success: bool, verbose_msg: str = ""):
        """Print colored status message with checkmark or cross."""
        icon = f"{Colors.GREEN}✓{Colors.RESET}" if success else f"{Colors.RED}✗{Colors.RESET}"
        print(f"{icon} {message}")
        if self.verbose and verbose_msg:
            print(f"  {Colors.BLUE}→{Colors.RESET} {verbose_msg}")

    def print_header(self, message: str):
        """Print a section header."""
        print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.RESET}")
        print(f"{Colors.BOLD}{Colors.BLUE}{message}{Colors.RESET}")
        print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.RESET}\n")

    def run_command(self, command: list, cwd: Optional[Path] = None, check: bool = True) -> Tuple[bool, str]:
        """Run a shell command and return success status and output."""
        try:
            if self.verbose:
                print(f"  {Colors.BLUE}→{Colors.RESET} Running: {' '.join(command)}")

            result = subprocess.run(
                command,
                cwd=cwd,
                capture_output=True,
                text=True,
                check=check
            )
            return True, result.stdout.strip()
        except subprocess.CalledProcessError as e:
            return False, e.stderr.strip()
        except FileNotFoundError:
            return False, f"Command not found: {command[0]}"

    def check_python_version(self) -> bool:
        """Check if Python version is >= 3.10."""
        success, output = self.run_command([sys.executable, "--version"])
        if success:
            version_str = output.split()[1]
            major, minor = map(int, version_str.split('.')[:2])
            if major >= 3 and minor >= 10:
                self.print_status(
                    f"Python version {version_str} (>= 3.10 required)",
                    True,
                    f"Detected: {sys.executable}"
                )
                return True
            else:
                self.print_status(
                    f"Python version {version_str} is too old (>= 3.10 required)",
                    False,
                    f"Please upgrade Python to version 3.10 or higher"
                )
                return False
        else:
            self.print_status("Python version check failed", False, output)
            return False

    def check_node_version(self) -> bool:
        """Check if Node.js version is >= 18."""
        success, output = self.run_command(["node", "--version"])
        if success:
            version_str = output.lstrip('v')
            major = int(version_str.split('.')[0])
            if major >= 18:
                self.print_status(
                    f"Node.js version {output} (>= 18 required)",
                    True,
                    "Node.js is installed and meets requirements"
                )
                return True
            else:
                self.print_status(
                    f"Node.js version {output} is too old (>= 18 required)",
                    False,
                    "Please upgrade Node.js to version 18 or higher"
                )
                return False
        else:
            self.print_status(
                "Node.js not found (>= 18 required)",
                False,
                "Please install Node.js version 18 or higher"
            )
            return False

    def check_postgresql(self) -> bool:
        """Check if PostgreSQL is accessible on port 6432."""
        try:
            import psycopg2
            # Try to connect to PostgreSQL on port 6432
            # Using default credentials for testing connectivity
            try:
                conn = psycopg2.connect(
                    host="localhost",
                    port=6432,
                    user="postgres",
                    password="postgres",
                    database="postgres",
                    connect_timeout=3
                )
                conn.close()
                self.print_status(
                    "PostgreSQL connection on port 6432",
                    True,
                    "Successfully connected to PostgreSQL"
                )
                return True
            except psycopg2.OperationalError as e:
                self.print_status(
                    "PostgreSQL connection on port 6432 failed",
                    False,
                    f"Error: {str(e)}\nEnsure PostgreSQL is running on port 6432"
                )
                return False
        except ImportError:
            self.print_status(
                "PostgreSQL check skipped",
                False,
                "psycopg2 not installed - will be installed with backend dependencies"
            )
            return False

    def check_redis(self) -> bool:
        """Check if Redis is accessible."""
        try:
            import redis
            try:
                r = redis.Redis(host='localhost', port=6379, socket_connect_timeout=3)
                r.ping()
                self.print_status(
                    "Redis connection on port 6379",
                    True,
                    "Successfully connected to Redis"
                )
                return True
            except (redis.ConnectionError, redis.TimeoutError) as e:
                self.print_status(
                    "Redis connection on port 6379 failed",
                    False,
                    f"Error: {str(e)}\nEnsure Redis is running on port 6379"
                )
                return False
        except ImportError:
            self.print_status(
                "Redis check skipped",
                False,
                "redis package not installed - install with: pip install redis"
            )
            # Redis is optional for now, so we don't fail the entire check
            return True

    def check_prerequisites(self) -> bool:
        """Run all prerequisite checks."""
        self.print_header("Checking Prerequisites")

        results = [
            self.check_python_version(),
            self.check_node_version(),
            self.check_postgresql(),
            self.check_redis()
        ]

        all_passed = all(results)

        if all_passed:
            print(f"\n{Colors.GREEN}{Colors.BOLD}All prerequisite checks passed!{Colors.RESET}\n")
        else:
            print(f"\n{Colors.RED}{Colors.BOLD}Some prerequisite checks failed!{Colors.RESET}\n")

        return all_passed

    def install_backend_dependencies(self) -> bool:
        """Install backend Python dependencies."""
        self.print_header("Installing Backend Dependencies")

        requirements_file = self.backend_dir / "requirements.txt"
        if not requirements_file.exists():
            self.print_status(
                f"Requirements file not found: {requirements_file}",
                False
            )
            return False

        success, output = self.run_command(
            [sys.executable, "-m", "pip", "install", "-r", str(requirements_file)],
            check=False
        )

        self.print_status(
            "Backend dependencies installation",
            success,
            output if self.verbose else "All packages installed successfully"
        )

        return success

    def install_frontend_dependencies(self) -> bool:
        """Install frontend npm dependencies."""
        self.print_header("Installing Frontend Dependencies")

        package_json = self.frontend_dir / "package.json"
        if not package_json.exists():
            self.print_status(
                f"package.json not found: {package_json}",
                False
            )
            return False

        success, output = self.run_command(
            ["npm", "install"],
            cwd=self.frontend_dir,
            check=False
        )

        self.print_status(
            "Frontend dependencies installation",
            success,
            output if self.verbose else "All npm packages installed successfully"
        )

        return success

    def run_migrations(self) -> bool:
        """Run database migrations using Alembic or SQLAlchemy."""
        self.print_header("Running Database Migrations")

        # Check if alembic is available
        alembic_ini = self.backend_dir / "alembic.ini"

        if alembic_ini.exists():
            # Use Alembic if configured
            success, output = self.run_command(
                ["alembic", "upgrade", "head"],
                cwd=self.backend_dir,
                check=False
            )
            self.print_status(
                "Alembic migrations",
                success,
                output if self.verbose else "Database schema updated via Alembic"
            )
            return success
        else:
            # Fall back to SQLAlchemy create_all
            self.print_status(
                "Alembic not configured, using SQLAlchemy",
                True,
                "Will use SQLAlchemy create_all for schema creation"
            )

            # Create a temporary Python script to run create_all in a subprocess
            # This avoids async/greenlet issues and works independently
            init_script = """
import sys
sys.path.insert(0, '{backend_dir}')

try:
    import os
    from sqlalchemy import create_engine, MetaData
    from dotenv import load_dotenv

    # Load environment variables
    env_path = '{backend_dir}/.env'
    if os.path.exists(env_path):
        load_dotenv(env_path)

    # Get database URL from environment
    database_url = os.getenv('DATABASE_URL', 'postgresql://user:password@localhost:6432/order_management')

    # Ensure URL uses psycopg2 (sync) not asyncpg
    if 'postgresql+asyncpg' in database_url:
        database_url = database_url.replace('postgresql+asyncpg', 'postgresql+psycopg2')
    elif not '+' in database_url and database_url.startswith('postgresql://'):
        database_url = database_url.replace('postgresql://', 'postgresql+psycopg2://')

    # Create a new synchronous engine with minimal configuration
    engine = create_engine(database_url, echo=False, pool_pre_ping=True)

    # Import Base after engine creation to avoid circular issues
    # Import models to ensure they're registered with Base
    from app.db.database import Base
    from app.models.user import User
    from app.models.order import Order, OrderItem, OrderStatusHistory

    # Create all tables
    Base.metadata.create_all(bind=engine)

    # Dispose engine
    engine.dispose()

    print("SUCCESS: Database tables created")
except Exception as e:
    import traceback
    print(f"ERROR: {{e}}")
    print(traceback.format_exc())
    sys.exit(1)
""".format(backend_dir=str(self.backend_dir))

            # Write temp script
            temp_script = self.root_dir / ".db_init_temp.py"
            try:
                temp_script.write_text(init_script)

                # Run the script
                success, output = self.run_command(
                    [sys.executable, str(temp_script)],
                    check=False
                )

                # Clean up temp script
                if temp_script.exists():
                    temp_script.unlink()

                if success and "SUCCESS" in output:
                    self.print_status(
                        "Database schema creation via SQLAlchemy",
                        True,
                        "All tables created successfully"
                    )
                    return True
                else:
                    self.print_status(
                        "Database schema creation failed",
                        False,
                        output if self.verbose else "Check database connection and configuration"
                    )
                    return False
            except Exception as e:
                # Clean up on error
                if temp_script.exists():
                    temp_script.unlink()
                self.print_status(
                    "Database schema creation failed",
                    False,
                    f"Error: {str(e)}"
                )
                return False

    def generate_env_file(self) -> bool:
        """Generate .env file from .env.example if it doesn't exist."""
        self.print_header("Generating Environment Configuration")

        env_example = self.backend_dir / ".env.example"
        env_file = self.backend_dir / ".env"

        if env_file.exists():
            self.print_status(
                ".env file already exists",
                True,
                f"Using existing file: {env_file}"
            )
            return True

        if not env_example.exists():
            self.print_status(
                ".env.example not found",
                False,
                f"Cannot generate .env without template: {env_example}"
            )
            return False

        try:
            # Read .env.example and write to .env
            content = env_example.read_text()
            env_file.write_text(content)

            self.print_status(
                "Generated .env from .env.example",
                True,
                f"Created: {env_file}\nPlease update with your actual configuration"
            )
            return True
        except Exception as e:
            self.print_status(
                "Failed to generate .env file",
                False,
                f"Error: {str(e)}"
            )
            return False

    def run_setup(self, skip_checks: bool = False) -> int:
        """Run the complete setup process."""
        print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.RESET}")
        print(f"{Colors.BOLD}{Colors.BLUE}Order Management Application - Setup{Colors.RESET}")
        print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.RESET}\n")

        # Step 1: Check prerequisites
        if not skip_checks:
            if not self.check_prerequisites():
                print(f"\n{Colors.RED}{Colors.BOLD}Setup aborted due to failed prerequisites.{Colors.RESET}")
                print(f"{Colors.YELLOW}Fix the issues above or use --skip-checks to bypass.{Colors.RESET}\n")
                return 1
        else:
            print(f"{Colors.YELLOW}Skipping prerequisite checks (--skip-checks flag used){Colors.RESET}\n")

        # Step 2: Install backend dependencies
        if not self.install_backend_dependencies():
            print(f"\n{Colors.RED}{Colors.BOLD}Setup failed during backend dependency installation.{Colors.RESET}\n")
            return 1

        # Step 3: Install frontend dependencies
        if not self.install_frontend_dependencies():
            print(f"\n{Colors.RED}{Colors.BOLD}Setup failed during frontend dependency installation.{Colors.RESET}\n")
            return 1

        # Step 4: Generate .env file
        if not self.generate_env_file():
            print(f"\n{Colors.RED}{Colors.BOLD}Setup failed during environment file generation.{Colors.RESET}\n")
            return 1

        # Step 5: Run migrations
        if not self.run_migrations():
            print(f"\n{Colors.RED}{Colors.BOLD}Setup failed during database migrations.{Colors.RESET}\n")
            return 1

        # Final summary
        self.print_header("Setup Complete!")
        print(f"{Colors.GREEN}{Colors.BOLD}✓ All setup steps completed successfully!{Colors.RESET}\n")
        print(f"{Colors.BOLD}Next steps:{Colors.RESET}")
        print(f"  1. Review and update {Colors.BLUE}backend/.env{Colors.RESET} with your configuration")
        print(f"  2. Start the services with: {Colors.BLUE}python cli.py start{Colors.RESET}")
        print(f"  3. Access the API at: {Colors.BLUE}http://localhost:8000{Colors.RESET}\n")

        return 0




class ServiceStatus:
    """Represents the status of a service."""

    def __init__(self, name: str, status: str, pid: Optional[int] = None,
                 port: Optional[int] = None, uptime: Optional[str] = None):
        self.name = name
        self.status = status
        self.pid = pid
        self.port = port
        self.uptime = uptime


class CLIStatusManager:
    """Manages status checks and health monitoring for application services."""

    BACKEND_PORT = 8000
    FRONTEND_PORT = 5173
    POSTGRES_PORT = 6432
    REDIS_PORT = 6379
    POSTGRES_HOST = "localhost"
    REDIS_HOST = "localhost"
    BACKEND_HOST = "localhost"

    def __init__(self):
        self.pid_data = self._read_pid_file()

    def _read_pid_file(self) -> Dict:
        """Read process IDs from the .cli.pid file."""
        if not PID_FILE.exists():
            return {}

        try:
            with open(PID_FILE, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError) as e:
            print(f"{Colors.YELLOW}Warning: Could not read .cli.pid file: {e}{Colors.RESET}")
            return {}

    def _is_process_running(self, pid: int) -> Tuple[bool, Optional[datetime]]:
        """Check if a process is running and get its start time."""
        try:
            import psutil
            process = psutil.Process(pid)
            if process.is_running():
                start_time = datetime.fromtimestamp(process.create_time())
                return True, start_time
        except ImportError:
            # Fallback: check if PID exists using os.kill
            try:
                os.kill(pid, 0)
                return True, None
            except (OSError, ProcessLookupError):
                return False, None
        except Exception:
            pass
        return False, None

    def _check_port_connectivity(self, host: str, port: int, timeout: float = 2.0) -> bool:
        """Check if a port is reachable."""
        try:
            with socket.create_connection((host, port), timeout=timeout):
                return True
        except (socket.timeout, socket.error, ConnectionRefusedError, OSError):
            return False

    def _format_uptime(self, start_time: datetime) -> str:
        """Format uptime as a human-readable string."""
        uptime_delta = datetime.now() - start_time

        days = uptime_delta.days
        hours, remainder = divmod(uptime_delta.seconds, 3600)
        minutes, seconds = divmod(remainder, 60)

        if days > 0:
            return f"{days}d {hours}h {minutes}m"
        elif hours > 0:
            return f"{hours}h {minutes}m {seconds}s"
        elif minutes > 0:
            return f"{minutes}m {seconds}s"
        else:
            return f"{seconds}s"

    def _check_backend_health(self) -> Tuple[bool, Optional[Dict]]:
        """Check backend health via /api/health endpoint."""
        try:
            import requests
            response = requests.get(
                f"http://{self.BACKEND_HOST}:{self.BACKEND_PORT}/api/health",
                timeout=3
            )
            if response.status_code == 200:
                return True, response.json()
        except ImportError:
            pass
        except Exception:
            pass

        # Try the root /health endpoint as well
        try:
            import requests
            response = requests.get(
                f"http://{self.BACKEND_HOST}:{self.BACKEND_PORT}/health",
                timeout=3
            )
            if response.status_code == 200:
                return True, response.json()
        except Exception:
            pass

        return False, None

    def check_backend_status(self) -> ServiceStatus:
        """Check backend service status."""
        backend_pid = self.pid_data.get('backend')

        if backend_pid:
            is_running, start_time = self._is_process_running(backend_pid)
            if is_running:
                uptime = self._format_uptime(start_time) if start_time else None

                # Check health endpoint
                health_ok, health_data = self._check_backend_health()
                status = "Running" if health_ok else "Running (unhealthy)"

                return ServiceStatus("Backend", status, backend_pid, self.BACKEND_PORT, uptime)

        # Check if something is listening on the backend port
        if self._check_port_connectivity(self.BACKEND_HOST, self.BACKEND_PORT):
            return ServiceStatus("Backend", "Running (unknown PID)", None, self.BACKEND_PORT, None)

        return ServiceStatus("Backend", "Stopped", None, self.BACKEND_PORT, None)

    def check_frontend_status(self) -> ServiceStatus:
        """Check frontend service status."""
        frontend_pid = self.pid_data.get('frontend')

        if frontend_pid:
            is_running, start_time = self._is_process_running(frontend_pid)
            if is_running:
                uptime = self._format_uptime(start_time) if start_time else None
                return ServiceStatus("Frontend", "Running", frontend_pid, self.FRONTEND_PORT, uptime)

        # Check if something is listening on the frontend port
        if self._check_port_connectivity(self.BACKEND_HOST, self.FRONTEND_PORT):
            return ServiceStatus("Frontend", "Running (unknown PID)", None, self.FRONTEND_PORT, None)

        return ServiceStatus("Frontend", "Stopped", None, self.FRONTEND_PORT, None)

    def check_postgresql_status(self) -> ServiceStatus:
        """Check PostgreSQL connectivity."""
        is_connected = self._check_port_connectivity(self.POSTGRES_HOST, self.POSTGRES_PORT)
        status = "Connected" if is_connected else "Unreachable"

        return ServiceStatus(
            f"PostgreSQL ({self.POSTGRES_HOST}:{self.POSTGRES_PORT})",
            status,
            None,
            self.POSTGRES_PORT,
            None
        )

    def check_redis_status(self) -> ServiceStatus:
        """Check Redis connectivity."""
        is_connected = self._check_port_connectivity(self.REDIS_HOST, self.REDIS_PORT)
        status = "Connected" if is_connected else "Unreachable"

        return ServiceStatus(
            f"Redis ({self.REDIS_HOST}:{self.REDIS_PORT})",
            status,
            None,
            self.REDIS_PORT,
            None
        )

    def get_all_statuses(self) -> List[ServiceStatus]:
        """Get status of all services."""
        return [
            self.check_backend_status(),
            self.check_frontend_status(),
            self.check_postgresql_status(),
            self.check_redis_status()
        ]

    def _colorize_status(self, status: str) -> str:
        """Apply color coding to status string."""
        status_lower = status.lower()

        if "running" in status_lower or "connected" in status_lower:
            return f"{Colors.GREEN}{status}{Colors.RESET}"
        elif "stopped" in status_lower or "unreachable" in status_lower or "error" in status_lower:
            return f"{Colors.RED}{status}{Colors.RESET}"
        elif "unhealthy" in status_lower:
            return f"{Colors.YELLOW}{status}{Colors.RESET}"
        else:
            return status

    def display_status_table(self, services: List[ServiceStatus]):
        """Display service statuses in a formatted table."""
        # Table headers
        headers = ["Service", "Status", "PID", "Port", "Uptime"]

        # Calculate column widths
        col_widths = [len(h) for h in headers]

        for service in services:
            col_widths[0] = max(col_widths[0], len(service.name))
            col_widths[1] = max(col_widths[1], len(service.status))
            col_widths[2] = max(col_widths[2], len(str(service.pid) if service.pid else "-"))
            col_widths[3] = max(col_widths[3], len(str(service.port) if service.port else "-"))
            col_widths[4] = max(col_widths[4], len(service.uptime if service.uptime else "-"))

        # Add padding
        col_widths = [w + 2 for w in col_widths]

        # Print header
        header_line = "│".join(f" {headers[i]:<{col_widths[i]-1}}" for i in range(len(headers)))
        separator = "─" * (sum(col_widths) + len(headers) - 1)

        print(f"\n{Colors.BLUE}{'─' * len(separator)}{Colors.RESET}")
        print(f"{Colors.BLUE}{header_line}{Colors.RESET}")
        print(f"{Colors.BLUE}{separator}{Colors.RESET}")

        # Print rows
        for service in services:
            pid_str = str(service.pid) if service.pid else "-"
            port_str = str(service.port) if service.port else "-"
            uptime_str = service.uptime if service.uptime else "-"

            row = [
                service.name,
                self._colorize_status(service.status),
                pid_str,
                port_str,
                uptime_str
            ]

            # Note: We need to account for color codes in the status column
            # so we adjust the width calculation
            status_display_len = len(service.status)
            status_padding = col_widths[1] - status_display_len - 1

            print(
                f" {row[0]:<{col_widths[0]-1}}│"
                f" {row[1]}{' ' * status_padding}│"
                f" {row[2]:<{col_widths[2]-1}}│"
                f" {row[3]:<{col_widths[3]-1}}│"
                f" {row[4]:<{col_widths[4]-1}}"
            )

        print(f"{Colors.BLUE}{separator}{Colors.RESET}\n")


class CLILogsManager:
    """Manages log viewing functionality."""

    BACKEND_LOG_FILE = PROJECT_ROOT / "backend.log"
    FRONTEND_LOG_FILE = PROJECT_ROOT / "frontend.log"

    def _tail_file(self, filepath: Path, lines: int) -> List[str]:
        """Tail the last N lines from a file."""
        if not filepath.exists():
            return [f"Log file not found: {filepath}"]

        try:
            with open(filepath, 'r') as f:
                all_lines = f.readlines()
                return all_lines[-lines:] if len(all_lines) > lines else all_lines
        except IOError as e:
            return [f"Error reading log file: {e}"]

    def display_logs(self, lines: int = 50):
        """Display recent log output from backend and frontend."""
        print(f"\n{Colors.BLUE}{'=' * 80}{Colors.RESET}")
        print(f"{Colors.BLUE}Backend Logs (last {lines} lines):{Colors.RESET}")
        print(f"{Colors.BLUE}{'=' * 80}{Colors.RESET}\n")

        backend_lines = self._tail_file(self.BACKEND_LOG_FILE, lines)
        if backend_lines:
            for line in backend_lines:
                print(line.rstrip())
        else:
            print(f"{Colors.YELLOW}No backend logs available{Colors.RESET}")

        print(f"\n{Colors.BLUE}{'=' * 80}{Colors.RESET}")
        print(f"{Colors.BLUE}Frontend Logs (last {lines} lines):{Colors.RESET}")
        print(f"{Colors.BLUE}{'=' * 80}{Colors.RESET}\n")

        frontend_lines = self._tail_file(self.FRONTEND_LOG_FILE, lines)
        if frontend_lines:
            for line in frontend_lines:
                print(line.rstrip())
        else:
            print(f"{Colors.YELLOW}No frontend logs available{Colors.RESET}")

        print(f"\n{Colors.BLUE}{'=' * 80}{Colors.RESET}\n")


def cmd_status(args):
    """Handle the status subcommand."""
    manager = CLIStatusManager()
    services = manager.get_all_statuses()

    print(f"\n{Colors.BLUE}{Colors.BOLD}Application Status Dashboard{Colors.RESET}")
    manager.display_status_table(services)


def cmd_logs(args):
    """Handle the logs subcommand."""
    manager = CLILogsManager()
    manager.display_logs(lines=args.lines)





class ServiceManager:
    """Manages starting, stopping, and restarting application services."""

    def __init__(self, verbose: bool = False):
        self.verbose = verbose
        self.root_dir = Path(__file__).parent.absolute()
        self.backend_dir = self.root_dir / "backend"
        self.frontend_dir = self.root_dir / "frontend"

    def print_status(self, message: str, status: str = "info"):
        """Print formatted status message."""
        if status == "success":
            print(f"{Colors.GREEN}✓{Colors.RESET} {message}")
        elif status == "error":
            print(f"{Colors.RED}✗{Colors.RESET} {message}")
        elif status == "warning":
            print(f"{Colors.YELLOW}⚠{Colors.RESET} {message}")
        else:
            print(f"{Colors.BLUE}ℹ{Colors.RESET} {message}")

    def print_header(self, message: str):
        """Print formatted header."""
        print(f"\n{Colors.BOLD}{Colors.BLUE}{'=' * 60}{Colors.RESET}")
        print(f"{Colors.BOLD}{message}{Colors.RESET}")
        print(f"{Colors.BOLD}{Colors.BLUE}{'=' * 60}{Colors.RESET}\n")

    def check_database_connectivity(self) -> bool:
        """Check PostgreSQL database connectivity using environment config."""
        try:
            import psycopg2
            from dotenv import load_dotenv

            # Load environment variables
            env_file = self.backend_dir / ".env"
            if not env_file.exists():
                self.print_status("Backend .env file not found", "error")
                return False

            load_dotenv(env_file)
            database_url = os.getenv("DATABASE_URL")

            if not database_url:
                self.print_status("DATABASE_URL not found in .env", "error")
                return False

            # Connect to database
            conn = psycopg2.connect(database_url)
            conn.close()
            self.print_status("PostgreSQL connection successful", "success")
            return True
        except ImportError:
            self.print_status("psycopg2 not installed", "error")
            return False
        except Exception as e:
            self.print_status(f"PostgreSQL connection failed: {str(e)}", "error")
            return False

    def check_redis_connectivity(self) -> bool:
        """Check Redis connectivity (optional)."""
        try:
            import redis
            from dotenv import load_dotenv

            # Load environment variables
            env_file = self.backend_dir / ".env"
            if env_file.exists():
                load_dotenv(env_file)

            redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")

            # Connect to Redis
            r = redis.from_url(redis_url)
            r.ping()
            self.print_status("Redis connection successful", "success")
            return True
        except ImportError:
            self.print_status("redis package not installed (optional)", "warning")
            return True  # Redis is optional
        except Exception as e:
            self.print_status(f"Redis connection failed: {str(e)} (optional)", "warning")
            return True  # Redis is optional

    def read_pid_file(self) -> Dict[str, int]:
        """Read PIDs from .cli.pid file."""
        if not PID_FILE.exists():
            return {}

        try:
            with open(PID_FILE, 'r') as f:
                return json.load(f)
        except Exception as e:
            self.print_status(f"Error reading PID file: {str(e)}", "error")
            return {}

    def write_pid_file(self, pids: Dict[str, int]):
        """Write PIDs to .cli.pid file."""
        try:
            with open(PID_FILE, 'w') as f:
                json.dump(pids, f, indent=2)
        except Exception as e:
            self.print_status(f"Error writing PID file: {str(e)}", "error")

    def is_process_running(self, pid: int) -> bool:
        """Check if a process with given PID is running."""
        try:
            os.kill(pid, 0)
            return True
        except OSError:
            return False

    def terminate_process(self, pid: int, service_name: str, timeout: int = 10):
        """Terminate a process gracefully with SIGTERM, then SIGKILL if needed."""
        if not self.is_process_running(pid):
            self.print_status(f"{service_name} (PID: {pid}) is not running", "warning")
            return

        try:
            self.print_status(f"Stopping {service_name} (PID: {pid})...", "info")
            os.kill(pid, signal.SIGTERM)

            # Wait for process to terminate
            for _ in range(timeout):
                if not self.is_process_running(pid):
                    self.print_status(f"{service_name} stopped successfully", "success")
                    return
                time.sleep(1)

            # Force kill if still running
            self.print_status(f"{service_name} didn't stop gracefully, forcing...", "warning")
            os.kill(pid, signal.SIGKILL)
            time.sleep(1)
            self.print_status(f"{service_name} forcefully terminated", "success")
        except Exception as e:
            self.print_status(f"Error stopping {service_name}: {str(e)}", "error")

    def cleanup_processes(self):
        """Clean up all running processes tracked globally."""
        global running_processes
        for proc in running_processes:
            try:
                proc.terminate()
                proc.wait(timeout=5)
            except:
                try:
                    proc.kill()
                except:
                    pass
        running_processes = []

    def signal_handler(self, signum, frame):
        """Handle Ctrl+C gracefully."""
        print(f"\n\n{Colors.YELLOW}Received interrupt signal. Shutting down services...{Colors.RESET}\n")
        self.cleanup_processes()

        # Also stop processes tracked in PID file
        pids = self.read_pid_file()
        for service_name, pid in pids.items():
            self.terminate_process(pid, service_name, timeout=5)

        # Remove PID file
        if PID_FILE.exists():
            PID_FILE.unlink()

        self.print_status("All services stopped", "success")
        sys.exit(0)

    def start_backend(self, port: int, host: str, debug: bool) -> Optional[subprocess.Popen]:
        """Start the FastAPI backend using uvicorn."""
        self.print_status(f"Starting backend on {host}:{port}...", "info")

        try:
            cmd = [
                "uvicorn",
                "app.main:app",
                "--host", host,
                "--port", str(port)
            ]

            if debug:
                cmd.append("--reload")

            # Start uvicorn from backend directory
            proc = subprocess.Popen(
                cmd,
                cwd=self.backend_dir,
                stdout=subprocess.PIPE if not debug else None,
                stderr=subprocess.PIPE if not debug else None
            )

            # Wait a bit to check if it started successfully
            time.sleep(2)
            if proc.poll() is not None:
                self.print_status("Backend failed to start", "error")
                return None

            self.print_status(f"Backend started (PID: {proc.pid})", "success")
            self.print_status(f"Backend URL: http://{host}:{port}", "info")
            self.print_status(f"API Docs: http://{host}:{port}/docs", "info")

            return proc
        except FileNotFoundError:
            self.print_status("uvicorn not found. Install with: pip install uvicorn", "error")
            return None
        except Exception as e:
            self.print_status(f"Error starting backend: {str(e)}", "error")
            return None

    def start_frontend(self, port: int, host: str, debug: bool) -> Optional[subprocess.Popen]:
        """Start the Vite frontend development server."""
        self.print_status(f"Starting frontend on {host}:{port}...", "info")

        try:
            cmd = ["npm", "run", "dev", "--", "--host", host, "--port", str(port)]

            if debug:
                cmd.append("--debug")

            # Start Vite from frontend directory
            proc = subprocess.Popen(
                cmd,
                cwd=self.frontend_dir,
                stdout=subprocess.PIPE if not debug else None,
                stderr=subprocess.PIPE if not debug else None
            )

            # Wait a bit to check if it started successfully
            time.sleep(3)
            if proc.poll() is not None:
                self.print_status("Frontend failed to start", "error")
                return None

            self.print_status(f"Frontend started (PID: {proc.pid})", "success")
            self.print_status(f"Frontend URL: http://{host}:{port}", "info")

            return proc
        except FileNotFoundError:
            self.print_status("npm not found. Please install Node.js", "error")
            return None
        except Exception as e:
            self.print_status(f"Error starting frontend: {str(e)}", "error")
            return None

    def cmd_start(self, port: int, frontend_port: int, host: str, debug: bool) -> int:
        """Start both backend and frontend services."""
        global running_processes

        self.print_header("Starting Order Management Services")

        # Check prerequisites
        self.print_status("Checking prerequisites...", "info")

        db_ok = self.check_database_connectivity()
        redis_ok = self.check_redis_connectivity()

        if not db_ok:
            self.print_status("Database connectivity check failed. Cannot start services.", "error")
            return 1

        print()

        # Check if services are already running
        existing_pids = self.read_pid_file()
        if existing_pids:
            for service_name, pid in existing_pids.items():
                if self.is_process_running(pid):
                    self.print_status(f"{service_name} is already running (PID: {pid})", "warning")
            self.print_status("Stop existing services first with: python cli.py stop", "info")
            return 1

        # Start backend
        backend_proc = self.start_backend(port, host, debug)
        if not backend_proc:
            return 1

        running_processes.append(backend_proc)

        print()

        # Start frontend
        frontend_proc = self.start_frontend(frontend_port, host, debug)
        if not frontend_proc:
            self.print_status("Backend started but frontend failed. Stopping backend...", "warning")
            backend_proc.terminate()
            backend_proc.wait()
            return 1

        running_processes.append(frontend_proc)

        # Save PIDs to file
        pids = {
            "backend": backend_proc.pid,
            "frontend": frontend_proc.pid
        }
        self.write_pid_file(pids)

        print()
        self.print_header("Services Started Successfully")
        self.print_status(f"Backend:  http://{host}:{port}", "success")
        self.print_status(f"Frontend: http://{host}:{frontend_port}", "success")
        print()
        self.print_status("Press Ctrl+C to stop all services", "info")

        # Register signal handler for Ctrl+C
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)

        # Wait for processes to complete (they won't unless they crash)
        try:
            backend_proc.wait()
            frontend_proc.wait()
        except KeyboardInterrupt:
            self.signal_handler(signal.SIGINT, None)

        return 0

    def cmd_stop(self) -> int:
        """Stop all running services."""
        self.print_header("Stopping Order Management Services")

        pids = self.read_pid_file()

        if not pids:
            self.print_status("No services are running (no PID file found)", "warning")
            return 0

        # Stop each service
        for service_name, pid in pids.items():
            self.terminate_process(pid, service_name)

        # Remove PID file
        if PID_FILE.exists():
            PID_FILE.unlink()
            self.print_status("PID file removed", "success")

        print()
        self.print_status("All services stopped", "success")
        return 0

    def cmd_restart(self, port: int, frontend_port: int, host: str, debug: bool) -> int:
        """Restart all services (stop then start)."""
        self.print_header("Restarting Order Management Services")

        # Stop services
        pids = self.read_pid_file()
        if pids:
            self.print_status("Stopping existing services...", "info")
            for service_name, pid in pids.items():
                self.terminate_process(pid, service_name, timeout=5)

            if PID_FILE.exists():
                PID_FILE.unlink()

            # Wait a bit before restarting
            time.sleep(2)
        else:
            self.print_status("No services are currently running", "info")

        print()

        # Start services
        return self.cmd_start(port, frontend_port, host, debug)


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Order Management Application CLI",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    subparsers = parser.add_subparsers(dest='command', help='Available commands')

    # Setup command
    setup_parser = subparsers.add_parser(
        'setup',
        help='Setup the application environment and install dependencies'
    )
    setup_parser.add_argument(
        '--skip-checks',
        action='store_true',
        help='Skip prerequisite checks and proceed with setup'
    )
    setup_parser.add_argument(
        '--verbose',
        action='store_true',
        help='Enable verbose output with detailed information'
    )

    # Start command
    start_parser = subparsers.add_parser(
        'start',
        help='Start backend and frontend services'
    )
    start_parser.add_argument(
        '--port',
        type=int,
        default=8000,
        help='Backend port (default: 8000)'
    )
    start_parser.add_argument(
        '--frontend-port',
        type=int,
        default=5173,
        help='Frontend port (default: 5173)'
    )
    start_parser.add_argument(
        '--host',
        type=str,
        default='127.0.0.1',
        help='Host address (default: 127.0.0.1)'
    )
    start_parser.add_argument(
        '--debug',
        action='store_true',
        help='Enable debug mode (uvicorn reload + verbose Vite)'
    )

    # Stop command
    stop_parser = subparsers.add_parser(
        'stop',
        help='Stop all running services'
    )

    # Restart command
    restart_parser = subparsers.add_parser(
        'restart',
        help='Restart all services (stop then start)'
    )
    restart_parser.add_argument(
        '--port',
        type=int,
        default=8000,
        help='Backend port (default: 8000)'
    )
    restart_parser.add_argument(
        '--frontend-port',
        type=int,
        default=5173,
        help='Frontend port (default: 5173)'
    )
    restart_parser.add_argument(
        '--host',
        type=str,
        default='127.0.0.1',
        help='Host address (default: 127.0.0.1)'
    )
    restart_parser.add_argument(
        '--debug',
        action='store_true',
        help='Enable debug mode (uvicorn reload + verbose Vite)'
    )

    # Status command
    status_parser = subparsers.add_parser(
        'status',
        help='Display health and status of all application services'
    )

    # Logs command
    logs_parser = subparsers.add_parser(
        'logs',
        help='Display recent log output from backend and frontend'
    )
    logs_parser.add_argument(
        '--lines',
        type=int,
        default=50,
        help='Number of lines to display from each log file (default: 50)'
    )

    args = parser.parse_args()

    # Show help if no command provided
    if args.command is None:
        parser.print_help()
        return 0

    # Execute commands
    if args.command == 'setup':
        manager = SetupManager(verbose=args.verbose)
        return manager.run_setup(skip_checks=args.skip_checks)

    # Execute start command
    if args.command == 'start':
        manager = ServiceManager(verbose=False)
        return manager.cmd_start(
            port=args.port,
            frontend_port=args.frontend_port,
            host=args.host,
            debug=args.debug
        )

    # Execute stop command
    if args.command == 'stop':
        manager = ServiceManager(verbose=False)
        return manager.cmd_stop()

    # Execute restart command
    if args.command == 'restart':
        manager = ServiceManager(verbose=False)
        return manager.cmd_restart(
            port=args.port,
            frontend_port=args.frontend_port,
            host=args.host,
            debug=args.debug
        )
    elif args.command == 'status':
        cmd_status(args)
        return 0
    elif args.command == 'logs':
        cmd_logs(args)
        return 0

    return 0


if __name__ == "__main__":
    sys.exit(main())
