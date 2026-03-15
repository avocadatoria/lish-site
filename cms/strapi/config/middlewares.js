module.exports = ({ env }) => [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        directives: {
          'img-src': ["'self'", 'data:', 'blob:', env('AWS_S3_UPLOAD_CDN_URL')],
          'media-src': ["'self'", 'data:', 'blob:', env('AWS_S3_UPLOAD_CDN_URL')],
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
