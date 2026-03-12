# Strapi CMS

Strapi v5 is the primary headless CMS. It runs as a **separate Node.js sub-project** inside `cms/strapi/` with its own `node_modules`, its own `.env`, and its own PostgreSQL database (`lish_strapi`).

> **Official docs:** [docs.strapi.io](https://docs.strapi.io/dev-docs/intro) | [REST API reference](https://docs.strapi.io/dev-docs/api/rest) | [Content-Type Builder](https://docs.strapi.io/dev-docs/backend-customization/models)

---

## Table of Contents

- [Architecture](#architecture)
- [First-Time Setup](#first-time-setup)
- [Environment Variables](#environment-variables)
- [Nginx Proxy Configuration](#nginx-proxy-configuration)
- [Admin Panel](#admin-panel)
  - [Create Your First Admin User](#create-your-first-admin-user)
  - [Create an API Token](#create-an-api-token)
  - [Set API Permissions](#set-api-permissions)
  - [Manage Content](#manage-content)
- [Content Types](#content-types)
  - [Page](#page)
  - [Adding New Content Types](#adding-new-content-types)
- [How the App Communicates with Strapi](#how-the-app-communicates-with-strapi)
  - [Fastify Service Layer](#fastify-service-layer)
  - [Fastify API Endpoints](#fastify-api-endpoints)
  - [Query Parameters](#query-parameters)
  - [Example Next.js Pages](#example-nextjs-pages)
- [Vite Configuration](#vite-configuration)
- [Scripts](#scripts)
- [File Inventory](#file-inventory)
- [Troubleshooting](#troubleshooting)
- [Removing Strapi for a Client Project](#removing-strapi-for-a-client-project)

---

## Architecture

Strapi runs on its **own nginx port** (3004), served through a **dedicated FRP tunnel** (public port 3443). This keeps it completely isolated from the main app — no sub-path mounting, no shared auth, no URL rewriting.

```
Browser
  |
  |-- https://frp-1.avocadatoria.com          (main app)
  |     -> Nginx :3000
  |         |-- /api/*  -> Fastify :3002  -> Strapi :1337/api/*  (content API)
  |         '-- /*      -> Next.js :3001                          (app pages)
  |
  '-- https://frp-2.avocadatoria.com     (Strapi admin)
        -> Nginx :3004
            '-- /*      -> Strapi  :1337                          (admin + API)
```

Key points:

- **The browser never talks to Strapi directly for content.** All CMS content flows through Fastify (`/api/strapi/*`), which authenticates with Strapi using a Bearer API token.
- **The admin panel lives on its own endpoint.** `https://frp-2.avocadatoria.com/admin` — completely separate from the main app's domain/port.
- **Strapi has its own database** (`lish_strapi`) on the same PostgreSQL server. It never touches the app database (`lish_dev`).
- **Strapi is NOT a pnpm workspace member.** It's a self-contained sub-project with its own `node_modules/`. Install its dependencies separately with `pnpm install:strapi`.
- **Port-per-service pattern.** Each backend service (Strapi, future WordPress, etc.) gets its own nginx server block and FRP tunnel. This avoids sub-path conflicts entirely.

---

## First-Time Setup

```bash
# 1. Install Strapi's dependencies (separate from the main project)
pnpm install:strapi

# 2. Create the Strapi database
createdb lish_strapi

# 3. Create Strapi's env file from the example
cp cms/strapi/.env.example cms/strapi/.env

# 4. Generate secrets — run this command 5 times, once for each secret field:
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
#    Paste each generated value into cms/strapi/.env for:
#      STRAPI_APP_KEYS (generate 4, comma-separated)
#      STRAPI_ADMIN_JWT_SECRET
#      STRAPI_API_TOKEN_SALT
#      STRAPI_TRANSFER_TOKEN_SALT
#      STRAPI_ENCRYPTION_KEY

# 5. Build the admin panel (required before first run)
pnpm build:strapi

# 6. Start everything
pnpm dev
```

After startup, go to `https://frp-2.avocadatoria.com/admin` to create your admin user (see [Admin Panel](#admin-panel)).

---

## Environment Variables

Strapi uses **two separate `.env` files**. This keeps the sub-project modular — when removing Strapi from a client project, you delete `cms/strapi/` and the two root env vars, and you're done.

### `cms/strapi/.env` — Strapi server internals

These are consumed only by Strapi itself. See `cms/strapi/.env.example` for the template.

| Variable | Description | Example                            |
|----------|-------------|------------------------------------|
| `STRAPI_HOST` | Bind address | `"0.0.0.0"`                        |
| `STRAPI_PORT` | Listen port | `"1337"`                           |
| `STRAPI_PUBLIC_URL` | Full public URL (used for admin asset paths, CORS) | `"https://frp-2.avocadatoria.com"` |
| `STRAPI_APP_KEYS` | 4 comma-separated base64 keys (session signing) | `"key1,key2,key3,key4"`            |
| `STRAPI_ADMIN_JWT_SECRET` | Admin panel JWT signing secret | base64 string                      |
| `STRAPI_API_TOKEN_SALT` | Salt for hashing API tokens | base64 string                      |
| `STRAPI_TRANSFER_TOKEN_SALT` | Salt for data transfer tokens | base64 string                      |
| `STRAPI_ENCRYPTION_KEY` | Encryption key for sensitive data | base64 string                      |
| `STRAPI_DB_HOST` | PostgreSQL host | `"localhost"`                      |
| `STRAPI_DB_PORT` | PostgreSQL port | `"5432"`                           |
| `STRAPI_DB_NAME` | Database name | `"lish_strapi"`                    |
| `STRAPI_DB_USER` | Database user | `"postgres"`                       |
| `STRAPI_DB_PASSWORD` | Database password | `"postgres"`                       |

Generate secrets with:
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
```

### Root `.env` — what Fastify needs

Only two variables in the root `.env`:

| Variable | Description | Example |
|----------|-------------|---------|
| `STRAPI_URL` | Internal URL for Fastify -> Strapi calls | `"http://localhost:1337"` |
| `STRAPI_API_TOKEN` | API token created in Strapi admin (see [Create an API Token](#create-an-api-token)) | `"your-token-here"` |

Both are validated at startup by `common/env.js` (Zod schema).

---

## Nginx Proxy Configuration

Strapi gets its **own nginx server block on port 3004**, completely separate from the main app on port 3000. No sub-path stripping, no auth header juggling — just a clean reverse proxy.

```nginx
# In nginx/dev.nginx.conf and nginx/prod.nginx.conf:

upstream strapi {
    server 127.0.0.1:1337;
}

server {
    listen       3004;
    server_name  localhost;

    location / {
        proxy_pass         http://strapi;
        proxy_http_version 1.1;
        ...
        client_max_body_size 50m;
    }
}
```

No Basic Auth on this server block — the Strapi admin panel handles its own JWT-based authentication. The FRP tunnel on port 3443 is the access control layer (only people who know the URL can reach it).

### Port-per-service pattern

Each backend service follows the same pattern:

| Service | Nginx port | Process port | Public endpoint |
|---------|-----------|-------------|----------------|
| Main app | 3000 | Next.js 3001, Fastify 3002 | `frp-1.avocadatoria.com` |
| Strapi | 3004 | 1337 | `frp-2.avocadatoria.com` |
| WordPress | 3005 | (TBD) | `frp-3.avocadatoria.com` (future) |

### Relevant files

- `nginx/dev.nginx.conf` — local development
- `nginx/prod.nginx.conf` — production EC2

After editing, deploy with:
```bash
cp nginx/dev.nginx.conf /usr/local/etc/nginx/nginx.conf && nginx -t && nginx -s reload
```

---

## Admin Panel

**URL:** `https://frp-2.avocadatoria.com/admin`

The admin panel is Strapi's built-in React UI. It's completely separate from the app's auth system — it has its own admin users, its own JWT tokens, its own login flow.

> **Strapi Admin Docs:** [docs.strapi.io/user-docs/intro](https://docs.strapi.io/user-docs/intro)

### Create Your First Admin User

1. Go to `https://frp-2.avocadatoria.com/admin`
2. You'll see a registration form (only appears when no admin exists)
3. Fill in name, email, password
4. Click **Let's start** — you'll land on the Strapi dashboard

### Create an API Token

The Fastify service layer authenticates with Strapi using an API token. Without it, the `/api/strapi/*` endpoints won't work.

1. In the Strapi admin sidebar, click **Settings** (gear icon, bottom-left)
2. Under **Global Settings**, click **API Tokens**
3. Click **Create new API Token**
4. Fill in:
   - **Name:** `Fastify` (or any descriptive name)
   - **Description:** `Used by the Fastify API layer to read CMS content`
   - **Token duration:** Unlimited (or set an expiry if you prefer)
   - **Token type:** **Read-only** (choose Full Access if Fastify will also create/update content)
5. Click **Save** — the token is shown **once**. Copy it immediately.
6. Paste into the root `.env`:
   ```
   STRAPI_API_TOKEN="the-token-you-just-copied"
   ```
7. Restart Fastify (`pnpm dev` or `pnpm dev:api`)

> **Strapi API Token Docs:** [docs.strapi.io/user-docs/settings/API-tokens](https://docs.strapi.io/user-docs/settings/API-tokens)

### Set API Permissions

By default, Strapi's REST API returns 403 for unauthenticated requests. The Fastify service uses a Bearer token so it doesn't need public access, but if you want content to be publicly readable (e.g., for testing with curl):

1. **Settings** -> **Users & Permissions** (under Plugin section) -> **Roles** -> **Public**
2. Under each content type (Page, Blog Post), check **find** and **findOne**
3. Click **Save**

> **Strapi Permissions Docs:** [docs.strapi.io/user-docs/users-roles-permissions](https://docs.strapi.io/user-docs/users-roles-permissions)

### Manage Content

1. Click **Content Manager** in the Strapi admin sidebar
2. Select a content type (e.g., Page)
3. Click **Create new entry**
4. Fill in the fields
5. Click **Save** (creates a draft)
6. Click **Publish** (makes it available via the API)

**Important:** Content must be **Published** to appear in API responses. Draft content is only visible in the admin panel.

> **Strapi Content Manager Docs:** [docs.strapi.io/user-docs/content-manager](https://docs.strapi.io/user-docs/content-manager)

---

## Content Types

One starter collection type is included, defined as code in `cms/strapi/src/api/`.

### Page

Generic CMS-managed pages (about, terms, landing pages, etc.).

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | String | Yes | |
| `slug` | UID | Yes | Auto-generated from title |
| `excerpt` | Text | No | Short summary |
| `content` | Rich text | No | Full page content (Markdown/HTML) |
| `seoTitle` | String | No | `<title>` tag override |
| `seoDescription` | Text | No | Meta description override |

**Schema:** `cms/strapi/src/api/page/content-types/page/schema.json`
**Strapi admin:** Content Manager -> Page

### Adding New Content Types

**Option A — Via the admin panel** (easiest for exploration):

1. Go to **Content-Type Builder** in the Strapi admin sidebar
2. Click **Create new collection type** (or single type)
3. Add fields using the visual builder
4. Click **Save** — Strapi restarts and auto-generates files in `cms/strapi/src/api/`
5. **Commit the generated files** to the repo

> **Note:** The Content-Type Builder is only available when running `strapi develop` (not `strapi start`).


```javascript
// routes/your-type.js
'use strict';
const { createCoreRouter } = require('@strapi/strapi').factories;
module.exports = createCoreRouter('api::your-type.your-type');
```

After adding, restart Strapi. It auto-migrates the database to match the schema.

> **Strapi Content-Type Docs:** [docs.strapi.io/dev-docs/backend-customization/models](https://docs.strapi.io/dev-docs/backend-customization/models)

---

## How the App Communicates with Strapi

### Fastify Service Layer

**File:** `server/services/strapi.js`

The Fastify service is the **only** code that talks to Strapi's REST API. It uses the `STRAPI_URL` and `STRAPI_API_TOKEN` env vars from the root `.env`.

All requests include:
```
Authorization: Bearer <STRAPI_API_TOKEN>
Content-Type: application/json
```

Four functions are exported:

| Function | Description |
|----------|-------------|
| `getEntries(pluralApiId, params)` | List entries from a collection. Returns `{ data, meta }`. |
| `getEntry(pluralApiId, documentId, params)` | Single entry by Strapi document ID. Returns `{ data, meta }`. |
| `getEntryBySlug(pluralApiId, slug, params)` | Single entry by slug field. Returns the entry object (or throws 404). |
| `getSingleType(singularApiId, params)` | Fetch a single-type entry (e.g., a homepage config). Returns `{ data, meta }`. |

### Fastify API Endpoints

**File:** `server/routes/strapi.js`

These routes are registered at `/api/strapi/*` and are accessible to the browser through Nginx.

| Method | Endpoint | Maps to | Example |
|--------|----------|---------|---------|
| GET | `/api/strapi/:collection` | `getEntries` | `/api/strapi/pages` |
| GET | `/api/strapi/:collection/:documentId` | `getEntry` | `/api/strapi/pages/abc123` |
| GET | `/api/strapi/slug/:collection/:slug` | `getEntryBySlug` | `/api/strapi/slug/pages/about-us` |
| GET | `/api/strapi/single/:singleType` | `getSingleType` | `/api/strapi/single/homepage` |

> **Note:** The `slug` route is registered before `:documentId` to avoid parameter clashing.

### Query Parameters

All endpoints pass query params through to Strapi's REST API. Common params:

| Param | Example | Description |
|-------|---------|-------------|
| `populate` | `populate=*` | Include relations/media. `*` = all, or specify fields. |
| `filters` | `filters[category][$eq]=news` | [Filter syntax](https://docs.strapi.io/dev-docs/api/rest/filters-locale-publication) |
| `sort` | `sort=createdAt:desc` | Sort order |
| `fields` | `fields[0]=title&fields[1]=slug` | Select specific fields |
| `pagination[page]` | `pagination[page]=2` | Page number |
| `pagination[pageSize]` | `pagination[pageSize]=10` | Results per page (max 100, see `config/api.js`) |

> **Strapi REST API Docs:** [docs.strapi.io/dev-docs/api/rest](https://docs.strapi.io/dev-docs/api/rest)

### Example Next.js Pages

Two example pages demonstrate both rendering strategies:

**Server-side rendered (SEO):** `app/(public)/strapi-ssr/page.js`
- Server Component — fetches from Fastify directly at `${API_URL}/api/strapi/pages?populate=*`
- Uses `next: { revalidate: 60 }` for ISR (re-fetches every 60 seconds)
- Good for SEO pages (content is in the HTML)

**Client-side rendered:** `app/(public)/strapi-client/page.js`
- Client Component (`'use client'`) — uses `apiFetch('/api/strapi/pages?populate=*')`
- Fetches through Nginx from the browser
- Good for authenticated or interactive pages

---

## Vite Configuration

**File:** `cms/strapi/src/admin/vite.config.js`

Strapi's admin panel uses Vite. The custom config adds `frp-1.avocadatoria.com` to `server.allowedHosts` so the Vite dev server doesn't block requests from the FRP tunnel.

> **Note:** In development, Strapi runs with `--no-watch-admin` (see [Scripts](#scripts)), which serves the pre-built admin panel instead of running Vite's dev server. The Vite config is still needed if you run `strapi develop` without `--no-watch-admin` for admin customization work.

---

## Scripts

All scripts are in the root `package.json`:

| Script | Command | Description |
|--------|---------|-------------|
| `pnpm dev:strapi` | `cd cms/strapi && pnpm exec strapi develop --no-watch-admin` | Start Strapi in dev mode, serving pre-built admin |
| `pnpm start:strapi` | `cd cms/strapi && pnpm exec strapi start` | Start Strapi in production mode |
| `pnpm build:strapi` | `cd cms/strapi && pnpm exec strapi build` | Build the admin panel (required after config/plugin changes) |
| `pnpm install:strapi` | `cd cms/strapi && pnpm install` | Install Strapi's dependencies |

`pnpm dev` and `pnpm start` both include Strapi via `concurrently`.

**Why `--no-watch-admin`?** Without it, `strapi develop` runs a Vite dev server that serves ES modules on-demand — each `import` becomes a separate HTTP request. When accessed through the FRP tunnel, this creates hundreds of requests with added latency per round-trip. `--no-watch-admin` serves the pre-built admin as static files instead, giving fast page loads.

**When to rebuild:** Run `pnpm build:strapi` after:
- Changing `config/admin.js` (admin URL, secrets)
- Changing `src/admin/vite.config.js`
- Installing/removing Strapi plugins
- Upgrading Strapi

---

## File Inventory

```
cms/strapi/
├── .env                                    # Strapi secrets + DB creds (gitignored)
├── .env.example                            # Template for .env
├── .gitignore                              # Strapi-specific ignores
├── package.json                            # Strapi v5.38.0, pg, React deps
├── config/
│   ├── admin.js                            # Admin panel path (/admin), JWT secret, token salts
│   ├── api.js                              # REST API defaults (limit 25, max 100)
│   ├── database.js                         # PostgreSQL connection (STRAPI_DB_* env vars)
│   ├── middlewares.js                       # Middleware stack (Strapi defaults)
│   ├── plugins.js                          # Plugin config (empty — defaults)
│   └── server.js                           # Host, port, public URL, app keys
├── src/
│   ├── admin/
│   │   └── vite.config.js                  # allowedHosts for FRP tunnel
│   ├── api/
│   │   └── page/                           # Page content type
│   │       ├── content-types/page/schema.json
│   │       ├── controllers/page.js
│   │       ├── routes/page.js
│   │       └── services/page.js
│   └── index.js                            # App lifecycle hooks (register, bootstrap)
├── build/                                  # Built admin panel (gitignored)
├── node_modules/                           # Strapi's own deps (gitignored)
└── .strapi/                                # Strapi cache/generated files (gitignored)
```

**Files outside `cms/strapi/` that relate to Strapi:**

| File | What it does |
|------|-------------|
| `server/services/strapi.js` | Fastify service — fetches from Strapi REST API with Bearer token |
| `server/routes/strapi.js` | Fastify routes — `/api/strapi/*` endpoints |
| `server/routes/index.js` | Registers strapi routes (`fastify.register(...)`) |
| `common/env.js` | Validates `STRAPI_URL` and `STRAPI_API_TOKEN` at startup |
| `nginx/dev.nginx.conf` | Strapi upstream + dedicated server block on port 3004 |
| `nginx/prod.nginx.conf` | Same as dev, with prod-specific paths |
| `app/(public)/strapi-ssr/page.js` | SSR example page |
| `app/(public)/strapi-client/page.js` | Client-side example page |
| `.env.example` | Documents `STRAPI_URL` and `STRAPI_API_TOKEN` |

---

## Troubleshooting

### "Blocked request. This host is not allowed."
Strapi's Vite dev server doesn't recognize the FRP tunnel hostname. This shouldn't happen in normal dev (we use `--no-watch-admin`), but if you run `strapi develop` without that flag, the fix is in `cms/strapi/src/admin/vite.config.js` — add your hostname to `server.allowedHosts`.

### `ENOENT: .../build/index.html` on startup
The admin panel hasn't been built. Run `pnpm build:strapi`.

### Port 1337 already in use
Another Strapi instance is running. Kill it: `lsof -ti :1337 | xargs kill -9`

### Content not appearing in API responses
1. Is the content **Published** (not Draft)?
2. Is the API token valid? Check `STRAPI_API_TOKEN` in root `.env`.
3. Are API permissions set? See [Set API Permissions](#set-api-permissions).
4. Are you using `?populate=*` to include relations/media?

### Strapi auto-appends `JWT_SECRET` to `.env`
The `users-permissions` plugin auto-generates a `JWT_SECRET` on first boot if one isn't set. Make sure `cms/strapi/.env` has a `JWT_SECRET` value (the `.env.example` might not include it — Strapi adds it automatically).

### Upload URLs use `/uploads/...` not an absolute URL
This is expected. With the port-based architecture, `/uploads/...` resolves correctly relative to Strapi's own endpoint (`https://frp-2.avocadatoria.com/uploads/...`). No URL rewriting needed.

---

## Removing Strapi for a Client Project

If a client project doesn't need a CMS, remove these in order:

1. **Delete the sub-project:** `rm -rf cms/strapi/`
2. **Delete the Fastify service and routes:**
   - `server/services/strapi.js`
   - `server/routes/strapi.js`
3. **Unregister the routes** in `server/routes/index.js` — remove the `strapi.js` import/register line
4. **Remove env vars:**
   - Root `.env`: delete `STRAPI_URL` and `STRAPI_API_TOKEN`
   - Root `.env.example`: same
   - `common/env.js`: remove the `STRAPI_URL` and `STRAPI_API_TOKEN` entries from the Zod schema
5. **Remove scripts** from `package.json`:
   - Delete: `dev:strapi`, `start:strapi`, `build:strapi`, `install:strapi`
   - Update `dev` concurrently command: remove `\"pnpm dev:strapi\"`
   - Update `start` concurrently command: remove `\"pnpm start:strapi\"`
   - Update `predev`: remove `lsof -ti :1337 | xargs kill -9 2>/dev/null;` and `lsof -ti :3004 | xargs kill -9 2>/dev/null;`
6. **Remove nginx config** from both `nginx/dev.nginx.conf` and `nginx/prod.nginx.conf`:
   - Delete `upstream strapi { ... }` block
   - Delete the Strapi `server { listen 3004; ... }` block
7. **Remove example pages:**
   - `app/(public)/strapi-ssr/`
   - `app/(public)/strapi-client/`
8. **Remove from `.gitignore`:** delete the `cms/strapi/pnpm-lock.yaml` line
9. **Drop the database:** `dropdb lish_strapi`
