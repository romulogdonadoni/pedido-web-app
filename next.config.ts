import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Storefront host: pedido.localhost (tenant is a path segment)
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
