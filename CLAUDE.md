# CLAUDE.md — lish-site

## Project Overview
**LISH = Long Island Select Healthcare** — a nonprofit healthcare provider.
This is a **CMS-driven website (~100 pages)**, cloned from `scaffold-master`. Unlike the scaffold, this is a real client site — strip what's not needed, build what is.

**Key facts:**
- LISH staff will manage the site themselves via Strapi UI after handoff
- ~100 pages, all CMS-managed content
- No design yet — generic/placeholder design for now
- Hosting TBD: Lightsail or EC2/CloudFront
- lish_dev database may or may not be needed (for non-Strapi stuff — TBD)
- lish_strapi is the primary database (Strapi CMS content)
- Scaffold-master source: `/Users/steve/projects/scaffold-master/`

## Removing from Scaffold
- Stripe / payments
- Auth0 / user authentication (Strapi has its own auth)
- Organizations / invitations / membership
- AI features (Anthropic/Vercel AI SDK)
- Google Calendar / Zoom integrations
- WordPress secondary CMS
- MediaConvert video processing
- Complex user attributes system
- Termly: keeping parked for now, may remove later

## What This Site IS
- Next.js drives page structure; Strapi provides content for most sections
- Fastify API layer stays — needed for contact forms, appointment requests, Strapi proxy
- ~76 pages, replacing current WordPress site
- LISH staff manage content via Strapi UI after handoff
- 6 physical locations
- Nginx reverse proxy (same pattern as scaffold)
- FRP dev tunnels: same as scaffold (frp-1, frp-2.avocadatoria.com)
- Prod domain: TBD (org is renaming)

## Strapi Content Types (already set up in CMS)
- **Page** — one per site page. Some fully CMS-driven, others partially. Client can always find/edit any page's text.
- **Section** — nav-level grouping. Name for page header + optional different name for nav bar.
- **Person** — providers, exec team, board members, anyone. Parent is either a PagePart (providers) or a Page (execs, board).
- **Location** — 6 locations. Drives the Contact page (location-specific).
- **TextSnippet** — reusable text: phone, email, copyright, EEOC statement, etc. Change once, updates everywhere.
- **PagePart** — currently only for Our Providers page. Groups providers by medical specialty.

## Strapi Relationships
- Person → PagePart (if provider) OR Person → Page (if exec/board)
- PagePart → Page (Our Providers page)
- Page → Section

## Steve's Preferences (MUST FOLLOW — ALWAYS)
- **JavaScript, NOT TypeScript** (firm, no exceptions)
- **pnpm ONLY** — no npm, no npx. Use `pnpm`, `pnpx`, `pnpm exec`
- **ESM everywhere** (import/export, no require) — except Sequelize CLI compat files (.cjs)
- **No `next/image`** — use standard `<img>` tags
- **SCSS** (not Tailwind, not CSS-in-JS)
- **All env var values must be QUOTED** in .env files
- **NEVER use default/fallback values for env vars** — startup validation ensures they exist
- **MUI imports MUST use deep paths** (`import Button from '@mui/material/Button'`, NOT `from '@mui/material'`)
- **Use WrappedMUI components** from `components/ui/` and `components/ui/form-els/` — never raw MUI
- **Sequelize**: PascalCase tables, camelCase columns, no pluralization, paranoid (soft deletes)
- **Never hardcode machine-specific paths** in Nginx configs
- Prefers direct communication — give opinions, not just options

## Tech Stack
- Node.js 24.x, React 19.x, Next.js 15.x (App Router), Fastify 5.x
- PostgreSQL 14 + Sequelize 6.x, Auth0 + iron-session, Stripe, MUI 7 (Prendox wrappers)
- Strapi 5.x (primary CMS), WordPress REST API (secondary CMS)
- AWS SDK v3 (S3, SES, SNS, MediaConvert, CloudFront), Anthropic SDK + Vercel AI SDK
- Vitest + RTL + supertest, ESLint 9 flat config, Pino logging
- SCSS + CSS Modules, react-hook-form 7.x, Zod for env validation

## Network Architecture
- **Nginx on port 3000** (entry point, dev and prod). NEVER 80, NEVER 443.
- Nginx routes: `/api/*` → Fastify :3002, everything else → Next.js :3001
- Strapi: Nginx :3004 → Strapi :1337
- **Nginx NEVER handles SSL** — terminates upstream (FRP/CloudFront/ALB)
- **Dev**: FRP tunnels are the ONLY entry point (frp-1.avocadatoria.com for main, frp-2 for Strapi)
- **Prod**: CloudFront → ALB → EC2 → Nginx → services

## Critical File Locations
- **Strapi .env lives at `cms/strapi/.env`** — NOT `cms/.env`. Strapi runs from `cms/strapi/` directory.
- **Main app .env lives at root `.env`**

## Key Directories
| What | Where |
|------|-------|
| Fastify entry/factory | `server/index.js`, `server/app.js` |
| API routes | `server/routes/*.js` |
| Services | `server/services/*.js` |
| Sequelize models | `db/models/*.js` |
| Migrations (CJS) | `db/migrations/*.cjs` |
| Next.js pages | `app/` (route groups: public, authenticated, sensitive, admin) |
| React hooks | `hooks/*.js` |
| Shared utils | `common/*.js` |
| Browser utils | `lib/*.js` |
| SCSS | `styles/_*.scss` |
| MUI wrappers | `components/ui/*.jsx` |
| Form elements | `components/ui/form-els/*.jsx` |
| Nginx configs | `nginx/*.nginx.conf` |
| Strapi | `cms/strapi/` |

## Key Patterns
- **SSR is SEO-only** — user interactions are client-side (`'use client'`)
- **API is the ONLY data source** — Next.js server fetches from Fastify, never DB directly
- **Auth flow**: Login → Auth0 (PKCE) → callback → upsert User → iron-session cookie
- **Three access tiers**: requireAuth, requireFreshAuth (< 5 min), requireAdmin
- **All email** through `common/mailer.js` (wraps SES), respects ENABLE_MAIL flag
- **Env vars**: add to `common/env.js` Zod schema + `.env.example`
