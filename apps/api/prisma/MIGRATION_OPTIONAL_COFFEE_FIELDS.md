# Optional coffee fields (beans, machineType)

## What this migration does

Adds two **optional** columns to `seller_profiles` only. No tables or rows are dropped. Existing rows stay valid.

### SQL applied (by `prisma migrate deploy` or when you run the migration)

```sql
ALTER TABLE "seller_profiles" ADD COLUMN IF NOT EXISTS "beans" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "seller_profiles" ADD COLUMN IF NOT EXISTS "machine_type" TEXT;
```

- **beans**: Array of text. Existing rows get default `[]` (empty array). New rows can set it or leave default.
- **machine_type**: Single text, nullable. Existing rows get `NULL`. New rows can set it or leave `NULL`.

So: old seller profiles keep working with `beans = []` and `machine_type = NULL`; new ones can optionally set these.

## If the previous migration failed

The migration `20250309000000_add_coffee_seller_fields` may be marked as failed in your database. Before applying the new one:

1. **Mark the old migration as rolled back** (so Prisma doesn’t try to re-apply it):

   ```bash
   cd apps/api
   npx prisma migrate resolve --rolled-back "20250309000000_add_coffee_seller_fields"
   ```

2. **Apply migrations** (this will run only the new optional-fields migration):

   ```bash
   npx prisma migrate deploy
   ```

3. **Seed** (optional):

   ```bash
   npx prisma db seed
   ```

No reset, no drop, no data loss.
