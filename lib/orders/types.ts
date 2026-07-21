import type { CartLine } from "@/lib/cart/types"

export type OrderStatus =
  | "pending_payment"
  | "awaiting_acceptance"
  | "received"
  | "preparing"
  | "ready"
  | "out_for_delivery"
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
  /** Número amigável exibido (ex.: PED-...). */
  publicNumber?: string
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
  /** Histórico de mudanças de status (ISO UTC). */
  statusHistory?: { status: OrderStatus; at: string }[]
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: "Aguardando pagamento",
  awaiting_acceptance: "Aguardando a loja",
  received: "Pedido confirmado",
  preparing: "Em preparo",
  ready: "Pronto",
  out_for_delivery: "Saiu para entrega",
  delivered: "Entregue",
  cancelled: "Cancelado",
}

export const ORDER_STATUS_HINT: Partial<Record<OrderStatus, string>> = {
  pending_payment: "Finalize o pagamento para a loja receber o pedido.",
  awaiting_acceptance: "A loja ainda não aceitou o pedido.",
  received: "A loja confirmou e vai começar o preparo.",
  preparing: "Seu pedido está sendo preparado.",
  ready: "Pedido pronto para retirada ou envio.",
  out_for_delivery: "O entregador está a caminho.",
  delivered: "Pedido concluído. Bom apetite!",
  cancelled: "Este pedido foi cancelado.",
}

/** Passos visíveis no acompanhamento (sem pending_payment / cancelled). */
export const ORDER_TRACK_STEPS: OrderStatus[] = [
  "awaiting_acceptance",
  "received",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
]

export function mapApiStatus(status: string): OrderStatus {
  switch (status) {
    case "PendingPayment":
      return "pending_payment"
    case "Paid":
    case "AwaitingAcceptance":
      return "awaiting_acceptance"
    case "Received":
      return "received"
    case "Preparing":
      return "preparing"
    case "Ready":
      return "ready"
    case "OutForDelivery":
      return "out_for_delivery"
    case "Delivered":
      return "delivered"
    case "Cancelled":
      return "cancelled"
    default:
      return "awaiting_acceptance"
  }
}

export function orderStatusBadgeClass(status: OrderStatus): string {
  switch (status) {
    case "pending_payment":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-300"
    case "awaiting_acceptance":
      return "bg-orange-500/15 text-orange-700 dark:text-orange-300"
    case "received":
    case "preparing":
      return "bg-sky-500/15 text-sky-700 dark:text-sky-300"
    case "ready":
    case "delivered":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
    case "out_for_delivery":
      return "bg-violet-500/15 text-violet-700 dark:text-violet-300"
    case "cancelled":
      return "bg-destructive/10 text-destructive"
    default:
      return ""
  }
}

export function ordersStorageKey(tenant: string) {
  return `whitelabel.pedido.orders.${tenant}`
}

export function createOrderId() {
  const stamp = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `PED-${stamp}-${rand}`
}

export const GUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
