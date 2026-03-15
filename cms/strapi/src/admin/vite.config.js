const { mergeConfig } = require('vite');

module.exports = (config) => {
  return mergeConfig(config, {
    server: {
      allowedHosts: [process.env.STRAPI_PUBLIC_URL ? new URL(process.env.STRAPI_PUBLIC_URL).hostname : 'localhost'],
    },
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  });
};
