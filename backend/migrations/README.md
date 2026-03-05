# Database Migrations

This directory contains SQL migration scripts for the Order Management application.

## Running Migrations

To run a migration script, use the PostgreSQL command-line tool:

```bash
psql -U <username> -h <host> -f migrations/001_make_created_by_nullable.sql
```

Or if you're already connected to the database:

```sql
\i migrations/001_make_created_by_nullable.sql
```

## Migration History

| Migration ID | Date       | Description                                    |
|--------------|------------|------------------------------------------------|
| 001          | 2026-03-05 | Make orders.created_by nullable for guest orders |

## Notes

- Always backup your database before running migrations
- Migrations are numbered sequentially (001, 002, etc.)
- Each migration should be idempotent where possible
- Test migrations in a development environment first
