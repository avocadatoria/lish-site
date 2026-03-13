# CLAUDE.md — lish-site

## Project Overview
**LISH = Long Island Select Healthcare** — a nonprofit healthcare provider.

**Key facts:**
- LISH staff will manage the site themselves via Strapi UI after handoff
- ~100 pages, all CMS-managed content
- No design yet — generic/placeholder design for now
- Hosting TBD: Lightsail or EC2/CloudFront
- lish_strapi is the primary database (Strapi CMS content)
- No app database — all data lives in Strapi

## What This Site IS
- **Strapi-first CMS site** — Strapi provides all content
- **Next.js** drives page structure, renders Strapi content **server-side (SSR)** for SEO
- **Fastify API layer** sits between Next.js and Strapi — Next.js NEVER calls Strapi directly
- ~76 pages, replacing current WordPress site (lishcare.org)
- 6 physical locations
- Nginx reverse proxy
- FRP dev tunnels (frp-1, frp-2.avocadatoria.com)
- Prod domain: TBD (org is renaming)

## Data Flow (CRITICAL)
```
Browser → Next.js (SSR) → Fastify API → Strapi
```
- **Next.js gets ALL content from Fastify** — never from Strapi directly
- **All Strapi content is server-side rendered** for SEO
- Client-side rendering of Strapi content is possible but not currently planned

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
- **ESM everywhere** (import/export, no require)
- **No `next/image`** — use standard `<img>` tags
- **SCSS** (not Tailwind, not CSS-in-JS)
- **All env var values must be QUOTED** in .env files
- **NEVER use default/fallback values for env vars** — startup validation ensures they exist
- **MUI imports MUST use deep paths** (`import Button from '@mui/material/Button'`, NOT `from '@mui/material'`)
- **Use WrappedMUI components** from `components/ui/` and `components/ui/form-els/` — never raw MUI
- **Never hardcode machine-specific paths** in Nginx configs
- Prefers direct communication — give opinions, not just options
- Keep things simple — don't overcomplicate or over-engineer

## Tech Stack
- Node.js 24.x, React 19.x, Next.js 15.x (App Router), Fastify 5.x
- Strapi 5.x (primary CMS) with PostgreSQL (lish_strapi)
- AWS SDK v3 (SES for email, S3 + CloudFront OAC for Strapi media uploads)
- MUI 7 (with wrappers), react-hook-form 7.x, Zod
- Vitest + RTL + supertest, ESLint 9 flat config, Pino logging
- SCSS + CSS Modules

## Network Architecture
- **Nginx on port 3000** (entry point, dev and prod). NEVER 80, NEVER 443.
- Nginx routes: `/api/*` → Fastify :3002, everything else → Next.js :3001
- Strapi: Nginx :3004 → Strapi :1337
- **Nginx NEVER handles SSL** — terminates upstream (CloudFront)
- **Dev routing**: Browser → CloudFront → FRP server (EC2) → FRP client (local Mac) → Nginx → services
- **ALL domains (frp-1, frp-2, lish-dev-www, lish-dev-cms) are CNAMEs to a CloudFront distribution**
- CloudFront sits in front of EVERYTHING — dev and prod. FRP is just another origin behind CF.
- **Dev domains**: lish-dev-www.avocadatoria.com (main app), lish-dev-cms.avocadatoria.com (Strapi)
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
| Next.js pages | `app/` (public route group) |
| React hooks | `hooks/*.js` |
| Shared utils | `common/*.js` |
| Browser utils | `lib/*.js` |
| SCSS | `styles/_*.scss` |
| MUI wrappers | `components/ui/*.jsx` |
| Form elements | `components/ui/form-els/*.jsx` |
| Nginx configs | `nginx/*.nginx.conf` |
| Strapi | `cms/strapi/` |

## Key Patterns
- **SSR for all Strapi content** — SEO is paramount
- **Fastify is the ONLY data source for Next.js** — Next.js server fetches from Fastify, never Strapi directly
- **All email** through `common/mailer.js` (wraps SES), respects ENABLE_MAIL flag
- **Env vars**: add to `common/env.js` Zod schema + `.env.example`

## Removed from Scaffold
Auth0, iron-session, Stripe, Sequelize/app DB, WordPress, Anthropic AI, Google Calendar, Zoom, MediaConvert, SNS, CloudFront signing, MUI X date pickers, all authenticated/admin/sensitive routes
