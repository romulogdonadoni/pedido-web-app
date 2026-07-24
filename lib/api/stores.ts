import { getApiBaseUrl, withApiHeaders } from "@/lib/api/base-url"

export type StoreDirectoryItem = {
  identifier: string
  name: string
  logoUrl: string | null
  bannerUrl: string | null
  isOpen: boolean
  addressLine: string | null
  addressNumber: string | null
  neighborhood: string | null
  city: string | null
  state: string | null
  zip: string | null
  lat: number | null
  lng: number | null
  distanceKm: number | null
}

export type FetchStoresParams = {
  q?: string
  openOnly?: boolean
  lat?: number
  lng?: number
  radiusKm?: number
  take?: number
}

function toCamelStore(raw: Record<string, unknown>): StoreDirectoryItem {
  return {
    identifier: String(raw.identifier ?? raw.Identifier ?? ""),
    name: String(raw.name ?? raw.Name ?? ""),
    logoUrl: (raw.logoUrl ?? raw.LogoUrl ?? null) as string | null,
    bannerUrl: (raw.bannerUrl ?? raw.BannerUrl ?? null) as string | null,
    isOpen: Boolean(raw.isOpen ?? raw.IsOpen ?? false),
    addressLine: (raw.addressLine ?? raw.AddressLine ?? null) as string | null,
    addressNumber: (raw.addressNumber ?? raw.AddressNumber ?? null) as
      | string
      | null,
    neighborhood: (raw.neighborhood ?? raw.Neighborhood ?? null) as
      | string
      | null,
    city: (raw.city ?? raw.City ?? null) as string | null,
    state: (raw.state ?? raw.State ?? null) as string | null,
    zip: (raw.zip ?? raw.Zip ?? null) as string | null,
    lat: (raw.lat ?? raw.Lat ?? null) as number | null,
    lng: (raw.lng ?? raw.Lng ?? null) as number | null,
    distanceKm: (raw.distanceKm ?? raw.DistanceKm ?? null) as number | null,
  }
}

export async function fetchStores(
  params: FetchStoresParams = {}
): Promise<StoreDirectoryItem[]> {
  const qs = new URLSearchParams()
  if (params.q?.trim()) qs.set("q", params.q.trim())
  if (params.openOnly) qs.set("openOnly", "true")
  if (params.lat != null) qs.set("lat", String(params.lat))
  if (params.lng != null) qs.set("lng", String(params.lng))
  if (params.radiusKm != null) qs.set("radiusKm", String(params.radiusKm))
  if (params.take != null) qs.set("take", String(params.take))

  const url = `${getApiBaseUrl()}/stores${qs.size ? `?${qs}` : ""}`
  const response = await fetch(url, {
    method: "GET",
    headers: withApiHeaders(),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Falha ao listar lojas (${response.status})`)
  }

  const data = (await response.json()) as unknown
  if (!Array.isArray(data)) return []
  return data.map((item) => toCamelStore(item as Record<string, unknown>))
}
