import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        /*
         * The floor plan is meant to be embedded on other sites, so framing is
         * opened up explicitly for this route only. Replace `*` with the hosts
         * you actually want to allow before going live, e.g.
         *   frame-ancestors 'self' https://ipc75.com https://partner.example
         */
        source: "/embed/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors *" },
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
      {
        // Every other route stays un-framable.
        source: "/((?!embed).*)",
        headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }],
      },
    ];
  },
};

export default nextConfig;
