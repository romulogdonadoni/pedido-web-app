/** Relative app path for store home; withTenantPrefix maps to `/{tenant}`. */
export const STORE_HOME_PATH = "/"

export const TENANT_COOKIE = "whitelabel.pedido.tenant"

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
  "loja",
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
 * - /{tenant} → tenant
 * - /{tenant}/carrinho → tenant
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

export function withTenantPrefix(tenant: string, pathname: string): string {
  if (pathname === "/" || pathname === "" || pathname === "/loja") {
    return `/${tenant}`
  }
  return `/${tenant}${pathname.startsWith("/") ? pathname : `/${pathname}`}`
}

/** True when the (full or stripped) path is the store menu home. */
export function isStoreHomePath(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  if (pathname === "/" || pathname === "" || pathname === "/loja") return true
  const segments = pathname.split("/").filter(Boolean)
  if (segments.length === 1 && isValidTenantSlug(segments[0]!)) return true
  if (
    segments.length === 2 &&
    isValidTenantSlug(segments[0]!) &&
    segments[1] === "loja"
  ) {
    return true
  }
  return false
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
