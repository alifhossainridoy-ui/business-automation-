/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@rupzone/ai-client",
    "@rupzone/db",
    "@rupzone/meta-client",
    "@rupzone/queue",
    "@rupzone/shared-types",
  ],
};

module.exports = nextConfig;
