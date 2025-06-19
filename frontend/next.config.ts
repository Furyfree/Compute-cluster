import type { NextConfig } from "next";

// next.config.js
const nextConfig = {
  devIndicators: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              connect-src 'self' http://127.0.0.1:8000 http://localhost:8000;
              style-src 'self' 'unsafe-inline';
              font-src 'self' https://fonts.gstatic.com;
              script-src 'self' 'unsafe-inline' 'unsafe-eval';
              img-src 'self' data:;
            `
              .replace(/\s{2,}/g, " ")
              .trim(),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

export default nextConfig;
