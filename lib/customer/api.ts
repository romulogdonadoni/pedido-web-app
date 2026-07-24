import { toBrWhatsAppPhone } from "@/lib/phone/br"
import { storeFetch } from "@/lib/api/store-fetch"

export type CustomerAddress = {
  street: string
  number: string
  complement: string | null
  neighborhood: string
  city: string | null
  reference: string | null
}

export type CustomerProfile = {
  phone: string
  name: string | null
  email: string | null
  addresses: CustomerAddress[]
}

export type SendOtpResult = {
  sent: boolean
  phoneDisplay: string
  expiresInSeconds: number
}

export type VerifyOtpResult = {
  token: string
  expiresAtUtc: string
  profile: CustomerProfile
}

const SESSION_KEY = (tenant: string) =>
  `whitelabel.pedido.customer.session.${tenant}`

export type CustomerSession = {
  token: string
  phone: string
  expiresAtUtc: string
  profile: CustomerProfile
}

export function loadCustomerSession(tenant: string): CustomerSession | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(SESSION_KEY(tenant))
    if (!raw) return null
    const parsed = JSON.parse(raw) as CustomerSession
    if (!parsed?.token || !parsed?.expiresAtUtc) return null
    if (new Date(parsed.expiresAtUtc).getTime() <= Date.now()) {
      localStorage.removeItem(SESSION_KEY(tenant))
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function saveCustomerSession(tenant: string, session: CustomerSession) {
  localStorage.setItem(SESSION_KEY(tenant), JSON.stringify(session))
}

export function clearCustomerSession(tenant: string) {
  localStorage.removeItem(SESSION_KEY(tenant))
}

export function sendCustomerOtp(tenant: string, phone: string) {
  return storeFetch<SendOtpResult>(tenant, "/customer/otp/send", {
    method: "POST",
    body: JSON.stringify({ phone: toBrWhatsAppPhone(phone) }),
  })
}

export function verifyCustomerOtp(tenant: string, phone: string, code: string) {
  return storeFetch<VerifyOtpResult>(tenant, "/customer/otp/verify", {
    method: "POST",
    body: JSON.stringify({
      phone: toBrWhatsAppPhone(phone),
      code: code.trim(),
    }),
  })
}

export function fetchCustomerProfile(tenant: string, token: string) {
  return storeFetch<CustomerProfile>(tenant, "/customer/profile", {
    headers: { "X-Customer-Token": token },
  })
}

export type CustomerOrderSummary = {
  id: string
  publicNumber: string
  status: string
  fulfillment: string
  total: number
  createdAtUtc: string
  linesCount: number
}

export function fetchCustomerOrders(tenant: string, token: string) {
  return storeFetch<CustomerOrderSummary[]>(tenant, "/customer/orders", {
    headers: { "X-Customer-Token": token },
  })
}

/** True when API rejected the customer session (missing/expired/invalid token). */
export function isCustomerSessionError(err: unknown): boolean {
  if (!(err instanceof Error)) return false
  const msg = err.message.toLowerCase()
  return (
    msg.includes("sessão") ||
    msg.includes("401") ||
    msg.includes("unauthorized") ||
    msg.includes("http 401")
  )
}
