# OrderBridge

A production-level multi-user marketplace where any user can become a seller, manage a menu and media gallery, and receive orders. Buyers place orders from sellers with full offline support and sync.

## Features

- **Authentication**: JWT access tokens (15 min) + refresh tokens (7 days) in HttpOnly cookies with rotation; verify email, reset password; rate-limited login (5/10 min).
- **Users & Sellers**: Every user can create a Seller Profile (display name, bio, categories, location, avatar). Ownership enforced on all mutations.
- **Seller Menu**: CRUD menu items (title, description, price, image, availability). Public read; only seller can create/update/delete.
- **Profile Media**: Up to 20 images/videos per seller (URL-based in MVP). Public read; only seller can manage.
- **Orders**: Buyers create orders; sellers accept/reject pending, mark completed. Buyers can cancel only PENDING. Admin can view all. Pagination, filtering, sorting.
- **Notifications**: Email (Resend) for verification, password reset, order created, order status changed. Web Push (VAPID) for seller on new order and buyer on status change.
- **Offline**: PWA with manifest; cache seller profiles and menu; offline order creation stored in IndexedDB (Dexie) and synced when back online; “Pending sync” banner.
- **Security**: CORS, secure cookies, ownership at query level, DTO validation, env-only secrets.
- **Deployment**: Docker Compose (Postgres + API); frontend on Vercel; backend on Render/Railway; DB (Neon/Railway/Supabase). Health endpoint, Swagger at `/swagger`.
- **Testing & CI**: Unit tests for AuthService and OrdersService (permission checks); GitHub Actions for install, lint, test, build.

## Tech Stack

| Layer        | Stack |
|-------------|--------|
| Monorepo    | pnpm workspaces |
| Frontend    | Next.js (App Router), TypeScript, Tailwind, TanStack Query |
| Backend     | NestJS, TypeScript, Prisma |
| Shared      | `@orderbridge/shared` — types + Zod schemas |
| Database    | PostgreSQL |
| Auth        | JWT (access + refresh), argon2, HttpOnly cookies |
| Email       | Resend (or SendGrid placeholder) |
| Push        | Web Push (VAPID) |
| Offline     | PWA + IndexedDB (Dexie) |

## Architecture (high level)

```mermaid
flowchart TB
  subgraph Client
    Web[Next.js App]
    PWA[PWA / Service Worker]
    IDB[(IndexedDB)]
    Web --> PWA
    Web --> IDB
  end

  subgraph API[NestJS API]
    Auth[Auth Module]
    Users[Users]
    Sellers[Sellers]
    Menu[Menu]
    Media[Media]
    Orders[Orders]
    Notifications[Notifications]
    Push[Push]
    Auth --> Users
    Sellers --> Menu
    Sellers --> Media
    Orders --> Notifications
    Orders --> Push
  end

  subgraph Data
    DB[(PostgreSQL)]
  end

  Web --> API
  API --> DB
  Push --> WebPush[Web Push]
  Notifications --> Resend[Resend]
```

## ER (conceptual)

```mermaid
erDiagram
  User ||--o| SellerProfile : has
  User ||--o{ RefreshToken : has
  User ||--o{ Order : "buys"
  SellerProfile ||--o{ MenuItem : has
  SellerProfile ||--o{ ProfileMedia : has
  SellerProfile ||--o{ Order : "sells"
  MenuItem ||--o{ Order : "ordered as"
  User ||--o{ PushSubscription : has

  User {
    uuid id PK
    string email
    string passwordHash
    string fullName
    enum role
    timestamp emailVerifiedAt
  }

  SellerProfile {
    uuid userId PK,FK
    string displayName
    string bio
    string[] categories
    string locationText
    string avatarUrl
  }

  MenuItem {
    uuid id PK
    uuid sellerId FK
    string title
    decimal price
    boolean isAvailable
  }

  Order {
    uuid id PK
    uuid buyerId FK
    uuid sellerId FK
    uuid menuItemId FK
    enum status
    string note
    timestamp scheduledFor
  }
```

## API overview

- **Auth**: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/verify-email`, `POST /auth/password/reset-request`, `POST /auth/password/reset`
- **Users**: `GET /users/me` (auth)
- **Sellers**: `GET /sellers`, `GET /sellers/:id`, `GET /sellers/me`, `POST /sellers/me`, `PATCH /sellers/me` (auth)
- **Menu**: `GET /sellers/:id/menu`, `POST /menu`, `PATCH /menu/:id`, `DELETE /menu/:id`, `PATCH /menu/:id/availability` (auth for write)
- **Media**: `GET /sellers/:id/media`, `POST /sellers/me/media`, `PATCH /sellers/me/media/:id`, `DELETE /sellers/me/media/:id` (auth for write)
- **Orders**: `POST /orders`, `GET /orders/my`, `GET /orders/incoming`, `GET /orders/all` (admin), `PATCH /orders/:id/status`, `PATCH /orders/:id/cancel`
- **Push**: `GET /push/vapid-public`, `POST /push/subscribe`, `DELETE /push/unsubscribe` (auth for subscribe/unsubscribe)
- **Health**: `GET /health`

Full API docs: run the API and open **Swagger** at `http://localhost:4000/swagger`.

## Setup (local)

1. **Prerequisites**: Node 18+, pnpm 9, PostgreSQL (or use Docker for DB only).

2. **Clone and install**
   ```bash
   cd OrderBridge  # or your repo name
   pnpm install
   ```

3. **Environment**
   - Copy `.env.example` to `apps/api/.env` and set at least:
     - `DATABASE_URL` (e.g. `postgresql://user:pass@localhost:5432/orderbridge`)
     - `JWT_SECRET` (min 32 chars)
   - For web: `apps/web/.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:4000` (optional; default is same).

4. **Database**
   ```bash
   pnpm db:migrate
   pnpm db:seed
   ```

5. **Run**
   ```bash
   pnpm dev
   ```
   - Web: http://localhost:3000  
   - API: http://localhost:4000  
   - Swagger: http://localhost:4000/swagger  

   Or run separately: `pnpm dev:api`, `pnpm dev:web`.

## Deployment checklist

- **Database**: Create Postgres on Neon / Railway / Supabase; set `DATABASE_URL` in backend env.
- **API**: Deploy NestJS to Render or Railway; set all env vars (including `FRONTEND_URL`, `CORS_ORIGIN`, `JWT_SECRET`, `RESEND_API_KEY`, `VAPID_*`).
- **Web**: Deploy Next.js to Vercel; set `NEXT_PUBLIC_API_URL` to your API URL.
- **Cookies**: Use `https` and set `CORS_ORIGIN` to the exact frontend origin so HttpOnly cookies work.
- **Migrations**: Run `prisma migrate deploy` in API build or release step.

## Security (why HttpOnly + rotation)

- **HttpOnly cookies**: Refresh tokens are not readable by JavaScript, so XSS cannot steal them.
- **Rotation**: Each refresh issues a new token and invalidates the previous one; a leaked token can only be used once and then is revoked, limiting damage.
- **Hashed in DB**: Stored refresh tokens are hashed so a DB leak does not expose plain tokens.

## Future improvements

- File upload for menu/media (e.g. Cloudinary signed upload).
- Real-time updates (WebSockets or SSE) for order status.
- Search and filters on marketplace (by category, location).
- Admin UI and more granular RBAC.
- E2E tests and Playwright.

## License

MIT.
