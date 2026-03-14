module.exports = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        directives: {
          'img-src': ["'self'", 'data:', 'blob:', 'https://lish-dev-www.avocadatoria.com'],
          'media-src': ["'self'", 'data:', 'blob:', 'https://lish-dev-www.avocadatoria.com'],
        },
      },
    },
  },
  'strapi::cors',
  { name: 'strapi::poweredBy', config: { poweredBy: '' } },
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
