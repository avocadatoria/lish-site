const { mergeConfig } = require('vite');

module.exports = (config) => {
  return mergeConfig(config, {
    server: {
      allowedHosts: ['lish-dev-cms.avocadatoria.com'],
    },
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  });
};
