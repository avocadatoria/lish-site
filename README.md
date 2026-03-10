# Kitchen Sink Webapp

Kitchen-sink template webapp — subtract features per client project.

## Prerequisites

- Node.js 24.x
- pnpm 10.x
- PostgreSQL 14+
- Nginx (local dev: `brew install nginx`)

## Quick Start

```bash
# Clone and install
git clone <repo-url>
cd scaffold-master
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials (all values must be quoted)

# Database setup
createdb scaffold_dev
pnpm db:migrate
pnpm db:seed        # optional: demo data

# Strapi CMS setup (see "Strapi CMS" section below for full details)
pnpm install:strapi
createdb scaffold_strapi
cp cms/strapi/.env.example cms/strapi/.env
# Edit cms/strapi/.env — generate secrets, set DB credentials
pnpm build:strapi

# Nginx (local dev)
cp nginx/dev.nginx.conf /usr/local/etc/nginx/nginx.conf
nginx -t && nginx -s reload

# Start development
pnpm dev            # Runs Next.js (:3001) + Fastify (:3002) + Strapi (:1337) + Nginx + FRP
```

Visit `https://frp-1.avocadatoria.com` (all traffic goes through the FRP tunnel in dev).

## Architecture

```
Browser → Nginx :3000  (main app)
           ├── /api/*  → Fastify :3002
           └── /*      → Next.js :3001

        → Nginx :3004  (Strapi CMS — separate port + FRP tunnel)
           └── /*      → Strapi  :1337
```

- **Nginx** is the entry point (port 3000 for the main app, port 3004 for Strapi).
- **Next.js** handles SSR (SEO-only) and client-side rendering.
- **Fastify** handles all API logic, auth, database, and external services.
- **Strapi** is the headless CMS on its own port. Admin at `:3443/admin`, content flows through Fastify.
- **SSL terminates upstream** (FRP tunnel in dev, ALB in prod), never at Nginx.

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start all services (Next.js + Fastify + Strapi + Nginx + FRP) |
| `pnpm dev:next` | Start Next.js only (port 3001) |
| `pnpm dev:api` | Start Fastify only (port 3002) |
| `pnpm dev:strapi` | Start Strapi only (port 1337) |
| `pnpm build` | Production build (Next.js) |
| `pnpm build:strapi` | Build Strapi admin panel (required after config changes) |
| `pnpm start` | Production start (Next.js + Fastify + Strapi) |
| `pnpm install:strapi` | Install Strapi dependencies (`cms/strapi/node_modules`) |
| `pnpm lint` | ESLint check |
| `pnpm lint:fix` | ESLint auto-fix |
| `pnpm test` | Run tests (Vitest) |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Run tests with coverage |
| `pnpm db:migrate` | Run pending migrations (app DB) |
| `pnpm db:migrate:undo` | Undo last migration |
| `pnpm db:seed` | Run all seeders |
| `pnpm db:seed:undo` | Undo all seeders |
| `pnpm db:migration:create <name>` | Generate new migration |

## Project Structure

```
scaffold-master/
├── app/                    # Next.js App Router pages
│   ├── (public)/           # No auth required
│   ├── (authenticated)/    # Login required
│   ├── (sensitive)/        # Fresh auth required (5 min)
│   └── (admin)/            # Admin access only
├── components/
│   ├── common/             # Header, Footer, Navigation
│   ├── features/           # AiChat, WordPressContent
│   ├── forms/              # ProfileForm, OrganizationForm
│   └── ui/                 # WrappedMUI components (31 components)
├── hooks/                  # React hooks (useAuth, useApi, useAi, etc.)
├── lib/                    # Browser utilities (api-client, logger)
├── common/                 # Shared code (env, logger, mailer, validation)
├── server/                 # Fastify API
│   ├── plugins/            # Session, auth, CORS, error handler, SSE, audit
│   ├── routes/             # All /api/* route handlers
│   ├── services/           # External service wrappers (Auth0, Stripe, AWS, etc.)
│   ├── startup/            # Env/DB/model/service validation
│   └── cron/               # Scheduled jobs
├── db/
│   ├── models/             # Sequelize models (ESM)
│   ├── migrations/         # Migration files (CJS)
│   └── seeders/            # Seed data (CJS)
├── cms/
│   └── strapi/             # Strapi CMS (separate sub-project, own node_modules)
│       ├── config/         # database.js, server.js, admin.js
│       ├── src/api/        # Content type definitions (Page, BlogPost)
│       └── .env            # Strapi-only env vars (secrets, DB creds)
├── styles/                 # SCSS system (variables, breakpoints, mixins, reset)
├── nginx/                  # Nginx configs (dev + prod)
└── tests/                  # Vitest + RTL + supertest
```

## Key Features

- **Auth**: Auth0 (OIDC/PKCE) with three access levels (public, authenticated, fresh)
- **Database**: PostgreSQL + Sequelize (PascalCase tables, camelCase columns, soft deletes)
- **Payments**: Stripe Checkout, subscriptions, Customer Portal, webhooks
- **CMS**: Strapi (primary) + WordPress REST API (secondary)
- **AI**: Anthropic streaming chat via Vercel AI SDK
- **AWS**: S3 uploads, SES email, SNS notifications, MediaConvert, CloudFront CDN
- **Calendar**: Google Calendar integration (per-user OAuth)
- **Meetings**: Zoom meeting creation (Server-to-Server OAuth)
- **Real-time**: Server-Sent Events for live notifications
- **Search**: PostgreSQL full-text search
- **Export**: CSV export for any resource
- **Admin**: User management, audit logs, system stats
- **SEO**: Sitemap, robots.txt, JSON-LD structured data
- **UI**: 31 MUI component wrappers (WrappedMUI), react-hook-form integration

## Strapi CMS

Strapi v5 is the primary headless CMS. It runs as a separate sub-project at `cms/strapi/` with its own database, dependencies, and `.env`. It has its own nginx port (3004) and FRP tunnel (public port 3443). The browser reads CMS content through Fastify at `/api/strapi/*`.

**Full documentation: [STRAPI.md](./STRAPI.md)** — covers setup, admin panel usage, content types, API endpoints, nginx proxy config, troubleshooting, and removal instructions.

Quick start:
```bash
pnpm install:strapi
createdb scaffold_strapi
cp cms/strapi/.env.example cms/strapi/.env   # generate secrets, set DB creds
pnpm build:strapi
pnpm dev
# → Admin panel at https://frp-2.avocadatoria.com/admin
```

## Auth Flow

1. User clicks Login → redirected to Auth0 (PKCE flow)
2. Auth0 callback → Fastify exchanges code for tokens
3. User info fetched → User upserted in DB
4. iron-session cookie set (encrypted, browser-side)
5. Redirect to dashboard

**Access levels:**
- **Public**: No auth needed
- **Authenticated**: Valid session required
- **Fresh Auth**: Session must be < 5 minutes old (for billing/settings)

## SCSS Breakpoint System

5-tier mobile-first system:

| Tier | Range | Mixin |
|------|-------|-------|
| Mobile | 0–767px | (base styles) |
| Tablet | 768–1023px | `@include tablet-up` |
| Desktop S | 1024–1279px | `@include desktop-sm-up` |
| Desktop M | 1280–1535px | `@include desktop-md-up` |
| Desktop L | 1536px+ | `@include desktop-lg-up` |

Also: `*-only` and `*-down` variants.

## Environment Variables

All values in `.env` must be quoted. See `.env.example` for the complete list.

Key variables:
- `APP_URL` — Full base URL (e.g. `"https://frp-1.avocadatoria.com"`)
- `NEXT_PUBLIC_APP_ENV` — Environment identifier (e.g. `"localdev-steve"`)
- `NONPROD_EMAIL_SUBJECT_PREFIX` — Must be non-empty outside production
- `ENABLE_MAIL` — `"true"` or `"false"` (logs instead of sending when false)

## Subtracting Features

This scaffold includes everything. To create a client project:

1. Fork/clone the repo
2. Remove unused route files from `server/routes/`
3. Remove their registrations from `server/routes/index.js`
4. Remove unused service files from `server/services/`
5. Remove unused page directories from `app/`
6. Remove unused dependencies from `package.json`
7. Remove unused env vars from `.env.example` and `common/env.js`
8. Run `pnpm install` to clean up lockfile

## Deployment (AWS EC2)

1. Set up EC2 instance with Node.js 24, PostgreSQL, Nginx
2. Configure load balancer with SSL certificate
3. Copy `nginx/prod.conf` to Nginx config
4. Set environment variables
5. `pnpm install --frozen-lockfile`
6. `pnpm db:migrate`
7. `pnpm build`
8. `pnpm start` (use PM2 or systemd for process management)
