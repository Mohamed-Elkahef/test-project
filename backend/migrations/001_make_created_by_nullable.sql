-- Task ID: 364c8938
-- Migration: Make orders.created_by column nullable to support guest orders
-- Date: 2026-03-05
-- Description: This migration removes the NOT NULL constraint from the created_by column
--              in the orders table to allow guest users to create orders without authentication.

-- Connect to database
\c order_management;

-- Start transaction
BEGIN;

-- Alter orders table to make created_by nullable
ALTER TABLE orders ALTER COLUMN created_by DROP NOT NULL;

-- Verify the change
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'orders'
        AND column_name = 'created_by'
        AND is_nullable = 'YES'
    ) THEN
        RAISE NOTICE 'SUCCESS: created_by column is now nullable';
    ELSE
        RAISE EXCEPTION 'FAILED: created_by column is still NOT NULL';
    END IF;
END $$;

-- Commit transaction
COMMIT;
