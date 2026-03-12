# Safe recovery: failed migration → new optional-fields migration

**Goal:** Restore Marketplace by applying only the minimal migration (beans + machineType). No DB reset, no row deletion.

---

## 1. Exact Prisma commands (run in this order)

From the **repo root** or from **`apps/api`**:

```bash
# 1) Go to API app (if not already there)
cd apps/api

# 2) Mark the OLD failed migration as rolled back (so Prisma won’t re-apply it)
npx prisma migrate resolve --rolled-back "20250309000000_add_coffee_seller_fields"

# 3) Apply pending migrations (runs only the new one: add beans + machine_type)
npx prisma migrate deploy

# 4) Optional: ensure seller rows exist (creates/updates 2 sellers + menu; safe to run multiple times)
npx prisma db seed
```

**Order matters:** run (2) before (3). Do not run `prisma migrate dev` or `prisma migrate reset`.

---

## 2. Manual SQL (only if strictly needed)

You do **not** need manual SQL for the normal path. Use it only if:

- Step (2) or (3) fails with a clear error, and
- You’ve confirmed the DB already has `seller_profiles` but is missing `beans` or `machine_type`.

Then run this in your DB client (e.g. Neon SQL Editor), then run step (3) again or mark the new migration as applied:

```sql
ALTER TABLE "seller_profiles" ADD COLUMN IF NOT EXISTS "beans" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "seller_profiles" ADD COLUMN IF NOT EXISTS "machine_type" TEXT;
```

If you ran that manually and then want to mark the new migration as applied without re-running it:

```bash
cd apps/api
npx prisma migrate resolve --applied "20250309100000_add_optional_beans_machine_type"
```

---

## 3. Verify the migration succeeded

**A. Migration status**

```bash
cd apps/api
npx prisma migrate status
```

Expected:

- No failed migrations.
- `20240220000000_init` applied.
- `20250309000000_add_coffee_seller_fields` rolled back (not applied).
- `20250309100000_add_optional_beans_machine_type` applied.

**B. Schema in DB (optional)**

In your DB client:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'seller_profiles'
  AND column_name IN ('beans', 'machine_type');
```

Expected: one row for `beans` (type array, nullable per your DB), one for `machine_type` (text, nullable). Existing rows should have `beans = '{}'` and `machine_type = NULL` if you didn’t seed yet.

---

## 4. Verify GET /sellers returns seller rows

**A. Start the API** (if not already running):

```bash
# From repo root
pnpm dev:api
```

Wait until it logs that it’s listening (e.g. port 4000).

**B. Call the endpoint**

Browser or curl:

```bash
curl -s "http://localhost:4000/sellers?page=1&limit=50"
```

Or open: `http://localhost:4000/sellers?page=1&limit=50`

**Expected:** HTTP 200 and JSON like:

```json
{
  "data": [
    {
      "userId": "...",
      "displayName": "...",
      "bio": "...",
      "categories": [...],
      "locationText": "...",
      "avatarUrl": null,
      "beans": [],
      "machineType": null,
      "coverMedia": null,
      "createdAt": "...",
      "updatedAt": "...",
      "user": { "id": "...", "fullName": "..." }
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 50,
  "totalPages": 1
}
```

If you ran the seed, `data` should have 2 sellers. If the list is empty, run step (4) from section 1 (`npx prisma db seed`) and call GET /sellers again.

---

## 5. Verify Marketplace renders sellers again

**A. Start the web app** (if not already running):

```bash
# From repo root
pnpm dev:web
```

**B. Open Marketplace**

In the browser: `http://localhost:3000/marketplace` (or your dev URL).

**Expected:**

- No “Error loading sellers.”
- At least one seller card (e.g. “Alice’s Coffee Corner”, “Bob’s Home Roast” if seed was run).
- Each card shows display name, location, bio, optional beans/equipment, “View profile” / “See menu”.

If you see “No home coffee sellers yet”, then GET /sellers is returning `data: []` — run seed (section 1 step 4) and refresh.

---

## Scope

Limited to restoring Marketplace (sellers list + optional beans/machineType). No orders or online presence changes.
