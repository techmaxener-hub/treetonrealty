import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Vercel ignores this (it deploys from the regular build output), but
  // it's what makes `.next/standalone/server.js` exist -- a self-contained
  // Node server with only the dependencies it actually needs, which is
  // what a non-Vercel Node host (e.g. Hostinger's Node.js app hosting)
  // runs directly. See DEPLOY_HOSTINGER.md.
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
