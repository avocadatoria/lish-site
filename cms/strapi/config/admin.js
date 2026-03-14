module.exports = ({ env }) => ({
  url: '/admin',
  auth: {
    secret: env('STRAPI_ADMIN_JWT_SECRET'),
  },
  apiToken: {
    salt: env('STRAPI_API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('STRAPI_TRANSFER_TOKEN_SALT'),
    },
  },
  secrets: {
    encryptionKey: env('STRAPI_ENCRYPTION_KEY'),
  },
  flags: {
    nps: env.bool('FLAG_NPS', false),
    promoteEE: env.bool('FLAG_PROMOTE_EE', false),
  },
  preview: {
    enabled: true,
    config: {
      allowedOrigins: env('CLIENT_URL'),
      async handler(uid, { documentId, locale, status }) {
        const clientUrl = env('CLIENT_URL');
        const previewSecret = env('PREVIEW_SECRET');

        // Only Pages support preview for now
        if (uid !== 'api::page.page') return null;

        const document = await strapi.documents(uid).findOne({
          documentId,
          populate: { Section: { fields: ['URLSlug'] } },
        });

        if (!document || !document.Section?.URLSlug || !document.Slug) return null;

        const pathname = `/${document.Section.URLSlug}/${document.Slug}`;
        const params = new URLSearchParams({ url: pathname, secret: previewSecret, status });
        return `${clientUrl}/preview?${params}`;
      },
    },
  },
});
