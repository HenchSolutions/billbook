import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  reactCompiler: isProd,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [{ source: "/pricing", destination: "/", permanent: true }];
  },
  experimental: {
    // Smaller client bundles when importing from package barrel files (esp. lucide icons).
    optimizePackageImports: ["lucide-react", "recharts", "date-fns", "react-day-picker", "cmdk"],
    // Client Router Cache: repeat navigations can reuse prefetched RSC payloads (v15+ default dynamic stale is 0s).
    staleTimes: {
      dynamic: 30,
      static: 300,
    },
  },
};

export default nextConfig;
