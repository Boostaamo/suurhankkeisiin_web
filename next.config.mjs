/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  trailingSlash: false,
  async headers() {
    return [
      {
        // Kuntien sivuille upotettava näkymä (/upotus/...) saa näkyä iframessa; muu sivusto ei.
        source: "/((?!upotus/).*)",
        headers: [{ key: "X-Frame-Options", value: "DENY" }],
      },
      {
        source: "/upotus/:path*",
        headers: [{ key: "Content-Security-Policy", value: "frame-ancestors *" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
