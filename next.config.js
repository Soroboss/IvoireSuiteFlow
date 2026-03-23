/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/book/residence-ivoiresuite-angre",
        destination: "/book/residence-angre-cocody",
        permanent: true
      }
    ];
  }
};

module.exports = nextConfig;
