const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['api.olamaps.com'],
  },
  env: {
    OLA_MAPS_API_KEY: process.env.OLA_MAPS_API_KEY,
  },
};

module.exports = withPWA(nextConfig);
