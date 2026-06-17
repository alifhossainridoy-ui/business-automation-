/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@rupzone/ai-client",
    "@rupzone/db",
    "@rupzone/meta-client",
    "@rupzone/notify",
    "@rupzone/queue",
    "@rupzone/shared-types",
    "@rupzone/whatsapp-client",
  ],
};

module.exports = nextConfig;
