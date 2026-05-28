/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'export',
  assetPrefix: './',
  images: { unoptimized: true },
  trailingSlash: true,
};
module.exports = nextConfig;
