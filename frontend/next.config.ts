import type { NextConfig } from "next";

// Security headers for every page. (HTTPS-only headers such as HSTS are added by the host, e.g. Vercel.)
const securityHeaders = [
  // Nobody may show this admin panel inside an <iframe> (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // The browser must trust the declared file type and not guess it.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Do not leak page addresses to other sites.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // This panel never needs the camera, microphone or location.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Pin the project root. Without this Next.js warns when a stray package-lock.json
  // exists in a parent folder (e.g. the home directory).
  turbopack: {
    root: import.meta.dirname,
  },
  // Do not announce "X-Powered-By: Next.js".
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Production on Vercel: the frontend and the backend live on different domains, and a login cookie from another
  // domain is blocked by browsers. So the browser always calls /api/* on the frontend's own domain (set
  // NEXT_PUBLIC_API_URL empty) and Next.js forwards it to the backend. Without BACKEND_URL (local development)
  // nothing is forwarded and the browser calls http://localhost:5000 directly.
  async rewrites() {
    const backend = process.env.BACKEND_URL?.replace(/\/+$/, "");
    return backend ? [{ source: "/api/:path*", destination: `${backend}/api/:path*` }] : [];
  },
};

export default nextConfig;
