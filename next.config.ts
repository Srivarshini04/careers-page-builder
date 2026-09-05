import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so the bundler doesn't walk up to a parent lockfile.
  turbopack: { root: path.join(__dirname) },

  /*
   * Company logos and banners are recruiter-supplied URLs on arbitrary hosts, so the
   * app uses plain <img> rather than next/image (which requires a per-host allow-list).
   * The production path is uploading to Supabase Storage and serving one known origin
   * through the optimizer — see Tech Spec §Future improvements.
   */
  images: { remotePatterns: [] },
};

export default nextConfig;
