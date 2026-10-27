/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve.alias['lucide.react'] = require.resolve('lucide-react/dist/cjs/lucide-react.js');
    return config;
  },
};

module.exports = nextConfig;
