import { headers } from "next/headers"
import { notFound } from "next/navigation"

import { getStoreMenu, type StoreMenu } from "@/lib/menu/catalog"
import { resolveTenant } from "@/lib/tenant/host"

export async function resolveStore(): Promise<{
  tenant: string
  menu: StoreMenu
} | null> {
  const headerStore = await headers()
  const tenant = resolveTenant({
    tenantHeader: headerStore.get("x-tenant-id"),
    cookieHeader: headerStore.get("cookie"),
  })
  if (!tenant) return null
  const menu = getStoreMenu(tenant)
  if (!menu) return null
  return { tenant, menu }
}

export async function requireStore() {
  const store = await resolveStore()
  if (!store) notFound()
  return store
}
