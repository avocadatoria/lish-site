/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['lish-dev-www.avocadatoria.com'],
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  sassOptions: {
    silenceDeprecations: ['legacy-js-api'],
  },
};

export default nextConfig;
