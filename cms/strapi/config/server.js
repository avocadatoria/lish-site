module.exports = ({ env }) => ({
  host: env('STRAPI_HOST'),
  port: env.int('STRAPI_PORT'),
  url: env('STRAPI_PUBLIC_URL'),
  app: {
    keys: env.array('STRAPI_APP_KEYS'),
  },
  webhooks: {
    populateRelations: false,
  },
});
