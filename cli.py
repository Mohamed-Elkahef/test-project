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

    args = parser.parse_args()

    # Show help if no command provided
    if args.command is None:
        parser.print_help()
        return 0

    # Execute setup command
    if args.command == 'setup':
        manager = SetupManager(verbose=args.verbose)
        return manager.run_setup(skip_checks=args.skip_checks)

    return 0


if __name__ == "__main__":
    sys.exit(main())
