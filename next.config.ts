import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Tenant is the first path segment: /{tenant}/…
  allowedDevOrigins: ["**.localhost"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
}

export default nextConfig
