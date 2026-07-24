import { NextResponse, type NextRequest } from "next/server"

import {
  TENANT_COOKIE,
  readTenantCookie,
  resolveTenantFromPath,
  withTenantPrefix,
} from "@/lib/tenant/host"

function withTenantCookie(response: NextResponse, tenant: string | null) {
  if (!tenant) return response
  response.cookies.set(TENANT_COOKIE, tenant, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  })
  return response
}

function isMarketplacePath(pathname: string) {
  return pathname === "/" || pathname === ""
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const pathTenant = resolveTenantFromPath(pathname)
  const cookieTenant = readTenantCookie(request.headers.get("cookie"))

  // Marketplace owns `/` — never force cookie-tenant redirect there.
  // Bare store paths (`/carrinho`, `/pedidos`, …) redirect to /{tenant}/…
  if (!pathTenant && cookieTenant && !isMarketplacePath(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = withTenantPrefix(cookieTenant, pathname)
    return withTenantCookie(NextResponse.redirect(url), cookieTenant)
  }

  return withTenantCookie(NextResponse.next(), pathTenant)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
}
