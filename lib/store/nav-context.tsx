"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import { withTenantPrefix } from "@/lib/tenant/host"

type StoreNavValue = {
  tenant: string
  /** App path without tenant prefix (`/carrinho`). */
  pathname: string
  /** Build a tenant-prefixed href from an app path. */
  href: (path: string) => string
}

const StoreNavContext = React.createContext<StoreNavValue | null>(null)

function stripTenantPath(pathname: string, tenant: string): string {
  const prefix = `/${tenant}`
  if (pathname === prefix || pathname === `${prefix}/`) return "/"
  if (pathname.startsWith(`${prefix}/`)) {
    return pathname.slice(prefix.length) || "/"
  }
  return pathname
}

export function StoreNavProvider({
  tenant,
  children,
}: {
  tenant: string
  children: React.ReactNode
}) {
  const fullPathname = usePathname()
  const value = React.useMemo<StoreNavValue>(
    () => ({
      tenant,
      pathname: stripTenantPath(fullPathname, tenant),
      href: (path: string) => withTenantPrefix(tenant, path),
    }),
    [tenant, fullPathname]
  )

  return (
    <StoreNavContext.Provider value={value}>{children}</StoreNavContext.Provider>
  )
}

export function useStoreNav() {
  const ctx = React.useContext(StoreNavContext)
  if (!ctx) {
    throw new Error("useStoreNav must be used within StoreNavProvider")
  }
  return ctx
}
