import { NextResponse, type NextRequest } from "next/server"

import {
  TENANT_COOKIE,
  TENANT_HEADER,
  readTenantCookie,
  splitTenantPath,
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

function forwardRequestHeaders(request: NextRequest, tenant: string | null) {
  const requestHeaders = new Headers(request.headers)
  const host = request.headers.get("host")
  if (host) {
    requestHeaders.set("x-forwarded-host", host)
    requestHeaders.set(
      "x-forwarded-proto",
      host.includes("localhost") || host.startsWith("127.") ? "http" : "https"
    )
  }
  if (tenant) {
    requestHeaders.set(TENANT_HEADER, tenant)
  }
  return requestHeaders
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const { tenant: pathTenant, pathname: strippedPath } =
    splitTenantPath(pathname)
  const cookieTenant = readTenantCookie(request.headers.get("cookie"))

  // Keep shareable URLs: bare app paths → /{tenant}/…
  if (!pathTenant && cookieTenant) {
    const url = request.nextUrl.clone()
    url.pathname = withTenantPrefix(cookieTenant, pathname)
    return withTenantCookie(NextResponse.redirect(url), cookieTenant)
  }

  const tenant = pathTenant
  const requestHeaders = forwardRequestHeaders(request, tenant)

  if (pathTenant && strippedPath !== pathname) {
    const url = request.nextUrl.clone()
    url.pathname = strippedPath
    return withTenantCookie(
      NextResponse.rewrite(url, { request: { headers: requestHeaders } }),
      tenant
    )
  }

  return withTenantCookie(
    NextResponse.next({ request: { headers: requestHeaders } }),
    tenant
  )
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
}
