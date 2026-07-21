import type { NextConfig } from "next"

function cdnRemotePattern() {
  const raw = process.env.NEXT_PUBLIC_CDN_URL?.trim()
  if (!raw) return null
  try {
    const url = new URL(raw)
    return {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
    }
  } catch {
    return null
  }
}

const cdn = cdnRemotePattern()

const nextConfig: NextConfig = {
  // Tenant is the first path segment: /{tenant}/…
  allowedDevOrigins: ["**.localhost"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Cloudflare R2 public buckets (*.r2.dev)
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      ...(cdn ? [cdn] : []),
    ],
  },
}

export default nextConfig
