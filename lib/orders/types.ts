import type { CartLine } from "@/lib/cart/types"

export type OrderStatus =
  | "received"
  | "preparing"
  | "out_for_delivery"
  | "ready"
  | "delivered"
  | "cancelled"

export type FulfillmentType = "delivery" | "pickup"

export type PaymentChoice = "pix" | "card_online" | "cash" | "card_delivery"

export type OrderCustomer = {
  name: string
  phone: string
  email?: string
}

export type OrderAddress = {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  reference?: string
}

export type Order = {
  id: string
  tenant: string
  createdAt: string
  status: OrderStatus
  fulfillment: FulfillmentType
  payment: PaymentChoice
  customer: OrderCustomer
  address?: OrderAddress
  lines: CartLine[]
  subtotal: number
  deliveryFee: number
  total: number
  note?: string
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  received: "Recebido",
  preparing: "Em preparo",
  out_for_delivery: "Saiu para entrega",
  ready: "Pronto para retirada",
  delivered: "Entregue",
  cancelled: "Cancelado",
}

export function ordersStorageKey(tenant: string) {
  return `whitelabel.pedido.orders.${tenant}`
}

export function createOrderId() {
  const stamp = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `PED-${stamp}-${rand}`
}
