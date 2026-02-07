# Manual migrations

Run these SQL scripts in order in the Supabase SQL Editor (Dashboard → SQL Editor) or via `psql` when you need to change the database schema.

## 001_products.sql

Creates the `product` table used by the product CRUD and the landing page “last 5 products” list.

**Table: `product`**

| Column       | Type         | Description                    |
| ------------ | ------------ | ------------------------------ |
| id           | UUID         | Primary key (auto-generated)   |
| name         | TEXT         | Product name (required)        |
| description  | TEXT         | Optional description           |
| price        | NUMERIC(12,2)| Optional price                 |
| created_at   | TIMESTAMPTZ  | Set on insert                  |
| updated_at   | TIMESTAMPTZ  | Set on insert/update (trigger) |
| created_by   | BIGINT       | Optional FK to `epa_user.id`   |

**Steps**

1. Open [Supabase](https://supabase.com) → your project → **SQL Editor**.
2. Paste the contents of `001_products.sql`.
3. Run the script.

After that, the app can create/read/update/delete products and show the last 5 on the landing page.
