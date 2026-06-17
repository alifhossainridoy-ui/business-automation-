/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@rupzone/db", "@rupzone/meta-client", "@rupzone/shared-types"],
};

module.exports = nextConfig;
