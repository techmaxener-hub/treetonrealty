import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pins the workspace root to this project -- a stray lockfile in a parent
  // directory (outside this repo) otherwise makes Next.js guess the wrong root.
  outputFileTracingRoot: __dirname,
  // Static generation talks to Supabase (Tokyo region) over a network that has shown
  // intermittent multi-second latency spikes on this machine -- the 60s default has
  // been observed to time out under concurrent page builds even though the same
  // queries resolve in ~1s standalone. Generous headroom, not a fix for a real bug.
  staticPageGenerationTimeout: 180,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "leeksduuapufssuhykoq.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
