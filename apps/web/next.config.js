/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@khedma/shared'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

module.exports = nextConfig;
