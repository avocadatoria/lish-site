/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['frp-1.avocadatoria.com'],
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  sassOptions: {
    silenceDeprecations: ['legacy-js-api'],
  },
};

export default nextConfig;
