# TODO

## Post-Scaffold Setup
- [ ] Configure Strapi content models (separate service, own PostgreSQL)
- [ ] Configure Stripe products/prices in Stripe Dashboard
- [ ] Set up Auth0 tenant, application, and callback URLs
- [ ] Create PostgreSQL database and run migrations
- [ ] Set up AWS credentials (S3 bucket, SES verified domain, SNS topics)
- [ ] Configure Google Cloud project for Calendar API OAuth
- [ ] Create Zoom Server-to-Server OAuth app

## Production Hardening
- [ ] Add rate limiting (`@fastify/rate-limit`) to auth and public endpoints
- [ ] Add security headers (`@fastify/helmet`, CSP headers)
- [ ] Configure CORS origins for production domain
- [ ] Set up CloudWatch log groups for Pino JSON output
- [ ] Add health check monitoring/alerting
- [ ] Configure SSL certificate on load balancer
- [ ] Set up FRP for staging/dev environments

## Features to Add Per Client
- [ ] Termly.io GDPR/cookie consent integration
- [ ] i18n support (next-intl) if needed
- [ ] Dark mode theme toggle in ThemeRegistry
- [ ] Email templates (HTML) for transactional emails
- [ ] Stripe webhook event replay/recovery
- [ ] File upload progress UI with WrappedMUIFileUpload + S3
- [ ] Push notifications (web push API)
- [ ] Two-factor authentication via Auth0
- [ ] Social login providers (Google, GitHub, etc.)

## Code Quality
- [ ] Add integration tests for all API routes (supertest)
- [ ] Add E2E tests with Puppeteer for critical flows
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Add pre-commit hooks (lint-staged + husky)
- [ ] Code coverage targets (>80%)
