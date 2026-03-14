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
  async headers() {
    return [{
      source: `/:path*`,
      headers: [
        { key: `X-Content-Type-Options`, value: `nosniff` },
        { key: `Content-Security-Policy`, value: `frame-ancestors 'self' ${process.env.CMS_URL}` },
        { key: `Referrer-Policy`, value: `strict-origin-when-cross-origin` },
        { key: `X-DNS-Prefetch-Control`, value: `off` },
        { key: `X-Permitted-Cross-Domain-Policies`, value: `none` },
      ],
    }];
  },
};

export default nextConfig;
