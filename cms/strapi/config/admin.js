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

        let pathname;

        if (uid === 'api::page.page') {
          const document = await strapi.documents(uid).findOne({
            documentId,
            populate: { Section: { fields: ['URLSlug'] } },
          });
          if (!document || !document.Section?.URLSlug) return null;
          pathname = document.IsSectionRoot
            ? `/${document.Section.URLSlug}`
            : `/${document.Section.URLSlug}/${document.Slug}`;
        } else if (uid === 'api::homepage.homepage' || uid === 'api::main-navigation.main-navigation') {
          pathname = `/`;
        } else if (uid === 'api::service.service') {
          const document = await strapi.documents(uid).findOne({ documentId });
          if (!document || !document.URLSlug) return null;
          pathname = `/services/${document.URLSlug}`;
        } else {
          return null;
        }
        const params = new URLSearchParams({ url: pathname, secret: previewSecret, status });
        return `${clientUrl}/preview?${params}`;
      },
    },
  },
});
