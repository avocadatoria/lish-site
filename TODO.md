# TODO

## Security
- [ ] Add Content Security Policy headers (defense-in-depth for dangerouslySetInnerHTML)
- [ ] Evaluate risk of raw-html-embed blocks bypassing all sanitization — currently any Strapi admin can inject arbitrary JS via CKEditor raw HTML embed
- [ ] Audit Strapi API token scope — ensure it's read-only if write access isn't needed from Fastify (except for inquiries)
- [ ] Add CSRF protection to POST /api/inquiries

## CloudFront Headers (Production)
- [ ] `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` (HSTS)
- [ ] `Content-Security-Policy` (see Security section above)
- [ ] `Permissions-Policy` (disable camera, microphone, geolocation, etc. — site doesn't use them)

## Preview
- [ ] Draft-aware nav: layout.js can't read searchParams, so nav always shows published state. Need a way to pass draft status to the layout's nav fetch during preview (move nav to page components, or client-side fetch, or middleware approach).

## Production Hardening
- [ ] Configure CORS_ORIGIN for production domain
- [ ] Set STRAPI_DB_SSL=true in production
- [ ] Set up CloudWatch log groups for Pino JSON output
- [ ] Add health check monitoring/alerting
- [ ] Configure SSL certificate on load balancer

## Code Quality
- [ ] Add integration tests for all API routes (supertest)
- [ ] Set up CI/CD pipeline (GitHub Actions)
