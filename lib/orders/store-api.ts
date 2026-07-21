import type { CartLine } from "@/lib/cart/types"

function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    process.env.API_URL?.replace(/\/$/, "") ||
    "http://localhost:5247"
  )
}

async function storeFetch<T>(
  tenant: string,
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${getApiBaseUrl()}/store/${encodeURIComponent(tenant)}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "Ngrok-Skip-Browser-Warning": "true",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error || `HTTP ${res.status}`)
  }
  return (await res.json()) as T
}

export type CheckoutConfig = {
  mercadoPagoEnabled: boolean
  publicKey: string | null
  deliveryFee: number
  minOrder: number
}

export type StoreOrderPayment = {
  id: string
  status: string
  paymentMethodId: string | null
  statusDetail: string | null
  pixQrCode: string | null
  pixQrCodeBase64: string | null
  mercadoPagoPaymentId: number | null
}

export type StoreOrder = {
  id: string
  publicNumber: string
  status: string
  fulfillment: string
  paymentMethod: string
  customerName: string
  customerPhone: string
  customerEmail: string | null
  subtotal: number
  deliveryFee: number
  total: number
  note: string | null
  createdAtUtc: string
  lines: {
    id: string
    name: string
    quantity: number
    unitPrice: number
    lineTotal: number
    imageUrl: string | null
    note: string | null
    optionsJson: string | null
  }[]
  latestPayment: StoreOrderPayment | null
  statusHistory?: { status: string; occurredAtUtc: string }[]
}

export function fetchCheckoutConfig(tenant: string) {
  return storeFetch<CheckoutConfig>(tenant, "/checkout-config")
}

export function createStoreOrder(
  tenant: string,
  body: {
    fulfillment: string
    paymentMethod: string
    customerName: string
    customerPhone: string
    customerEmail?: string | null
    subtotal: number
    deliveryFee: number
    note?: string | null
    lines: {
      name: string
      quantity: number
      unitPrice: number
      productId?: string | null
      productGroupId?: string | null
      imageUrl?: string | null
      optionsJson?: string | null
      note?: string | null
    }[]
    addressStreet?: string | null
    addressNumber?: string | null
    addressComplement?: string | null
    addressNeighborhood?: string | null
    addressCity?: string | null
    addressReference?: string | null
  }
) {
  return storeFetch<StoreOrder>(tenant, "/orders", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export function getStoreOrder(tenant: string, orderId: string) {
  return storeFetch<StoreOrder>(tenant, `/orders/${orderId}`)
}

export function processStorePayment(
  tenant: string,
  orderId: string,
  body: {
    token?: string | null
    paymentMethodId?: string | null
    installments?: number | null
    issuerId?: string | null
    payerEmail?: string | null
    identificationType?: string | null
    identificationNumber?: string | null
  }
) {
  return storeFetch<StoreOrder>(tenant, `/orders/${orderId}/payments`, {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export function cartLinesToOrderPayload(lines: CartLine[]) {
  return lines.map((line) => {
    const fixedItems = line.fixedItems ?? []
    const slotSelections = line.slotSelections ?? []
    const selectedOptions = line.selectedOptions
    const hasDetails =
      selectedOptions.length > 0 ||
      slotSelections.length > 0 ||
      fixedItems.length > 0

    return {
      name: line.name,
      quantity: line.qty,
      unitPrice: line.unitPrice,
      productId: line.productGroupId ? null : line.itemId,
      productGroupId: line.productGroupId ?? null,
      imageUrl: line.image ?? null,
      optionsJson: hasDetails
        ? JSON.stringify({
            selectedOptions,
            slotSelections,
            fixedItems,
          })
        : null,
      note: line.note ?? null,
    }
  })
}
