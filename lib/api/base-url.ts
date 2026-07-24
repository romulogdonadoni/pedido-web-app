/** Shared API origin for pedido-app (browser + RSC). */
export function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    process.env.API_URL?.replace(/\/$/, "") ||
    "http://localhost:5247"
  )
}

/** Merge default API headers (incl. ngrok free interstitial bypass). */
export function withApiHeaders(init?: HeadersInit): Headers {
  const headers = new Headers(init)
  const baseUrl = getApiBaseUrl()
  if (/ngrok/i.test(baseUrl) && !headers.has("ngrok-skip-browser-warning")) {
    headers.set("ngrok-skip-browser-warning", "true")
  }
  return headers
}
