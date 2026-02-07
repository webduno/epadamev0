-- Products table for simple CRUD
-- Run this in your Supabase SQL editor or psql

CREATE TABLE IF NOT EXISTS product (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by BIGINT REFERENCES epa_user(id) ON DELETE SET NULL
);

-- Index for "last N added" queries on landing
CREATE INDEX IF NOT EXISTS idx_product_created_at ON product (created_at DESC);

-- Optional: trigger to keep updated_at in sync (run in Supabase SQL editor)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS product_updated_at ON product;
CREATE TRIGGER product_updated_at
  BEFORE UPDATE ON product
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
