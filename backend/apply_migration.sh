#!/bin/bash
# Task ID: 364c8938
# Script to apply the created_by nullable migration

echo "Applying migration: Make orders.created_by nullable"
echo "=================================================="

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "Error: psql command not found. Please install PostgreSQL client."
    exit 1
fi

# Get database credentials from environment or use defaults
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

echo "Database configuration:"
echo "  User: $DB_USER"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo ""
echo "Running migration..."

# Run the migration
psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -f migrations/001_make_created_by_nullable.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "Migration applied successfully!"
    echo "Guest orders can now be created without authentication."
else
    echo ""
    echo "Migration failed. Please check the error messages above."
    exit 1
fi
