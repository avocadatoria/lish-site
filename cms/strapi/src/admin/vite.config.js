const { mergeConfig } = require('vite');

module.exports = (config) => {
  return mergeConfig(config, {
    server: {
      allowedHosts: ['frp-2.avocadatoria.com'],
    },
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  });
};
