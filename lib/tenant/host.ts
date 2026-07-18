export const TENANT_COOKIE = "whitelabel.pedido.tenant"
export const TENANT_HEADER = "x-tenant-id"

const TENANT_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/

/** First path segments that must never be treated as a tenant slug. */
const RESERVED_SEGMENTS = new Set([
  "www",
  "app",
  "api",
  "auth",
  "admin",
  "mail",
  "status",
  "docs",
  "pedido",
  "busca",
  "carrinho",
  "perfil",
  "pedidos",
  "checkout",
  "item",
  "_next",
])

export function getRootDomain() {
  return (
    process.env.NEXT_PUBLIC_ROOT_DOMAIN?.replace(/^\./, "").toLowerCase() ||
    process.env.ROOT_DOMAIN?.replace(/^\./, "").toLowerCase() ||
    "whitelabel.com.br"
  )
}

export function isValidTenantSlug(value: string) {
  return TENANT_RE.test(value) && !RESERVED_SEGMENTS.has(value)
}

/**
 * Resolve tenant from the first path segment.
 * Examples:
 * - /cowboy-burger-67 → cowboy-burger-67
 * - /cowboy-burger-67/carrinho → cowboy-burger-67
 * - /carrinho → null
 */
export function resolveTenantFromPath(
  pathname: string | null | undefined
): string | null {
  if (!pathname) return null
  const segment = pathname.split("/").filter(Boolean)[0]?.toLowerCase()
  if (!segment) return null
  return isValidTenantSlug(segment) ? segment : null
}

/** Split `/{tenant}/rest` into tenant + remaining pathname (for rewrite). */
export function splitTenantPath(pathname: string): {
  tenant: string | null
  pathname: string
} {
  const segments = pathname.split("/").filter(Boolean)
  const first = segments[0]?.toLowerCase()
  if (!first || !isValidTenantSlug(first)) {
    return { tenant: null, pathname: pathname || "/" }
  }
  const rest = segments.slice(1)
  return {
    tenant: first,
    pathname: rest.length === 0 ? "/" : `/${rest.join("/")}`,
  }
}

export function withTenantPrefix(tenant: string, pathname: string): string {
  if (pathname === "/") return `/${tenant}`
  return `/${tenant}${pathname.startsWith("/") ? pathname : `/${pathname}`}`
}

export function readTenantCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${TENANT_COOKIE}=([^;]+)`)
  )
  if (!match?.[1]) return null
  const value = decodeURIComponent(match[1]).toLowerCase()
  return isValidTenantSlug(value) ? value : null
}

export function resolveTenant(input: {
  pathname?: string | null
  tenantHeader?: string | null
  cookieHeader?: string | null
}): string | null {
  const fromHeader = input.tenantHeader?.trim().toLowerCase()
  if (fromHeader && isValidTenantSlug(fromHeader)) return fromHeader

  return (
    resolveTenantFromPath(input.pathname) ||
    readTenantCookie(input.cookieHeader ?? null)
  )
}
