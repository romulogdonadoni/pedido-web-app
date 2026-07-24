import { getApiBaseUrl, withApiHeaders } from "@/lib/api/base-url"

/** Authenticated/anonymous fetch under `/store/{tenant}/…`. */
export async function storeFetch<T>(
  tenant: string,
  path: string,
  init?: RequestInit
): Promise<T> {
  const headers = withApiHeaders(init?.headers)
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const res = await fetch(
    `${getApiBaseUrl()}/store/${encodeURIComponent(tenant)}${path}`,
    {
      ...init,
      headers,
      cache: "no-store",
    }
  )
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: string
    } | null
    throw new Error(body?.error || `HTTP ${res.status}`)
  }
  return (await res.json()) as T
}
