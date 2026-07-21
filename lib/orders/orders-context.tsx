"use client"

import * as React from "react"

import {
  createOrderId,
  ordersStorageKey,
  type FulfillmentType,
  type Order,
  type OrderAddress,
  type OrderCustomer,
  type OrderStatus,
  type PaymentChoice,
} from "@/lib/orders/types"
import type { CartLine } from "@/lib/cart/types"

type PlaceOrderInput = {
  id?: string
  publicNumber?: string
  status?: OrderStatus
  fulfillment: FulfillmentType
  payment: PaymentChoice
  customer: OrderCustomer
  address?: OrderAddress
  lines: CartLine[]
  subtotal: number
  deliveryFee: number
  note?: string
}

type OrdersContextValue = {
  tenant: string
  orders: Order[]
  hydrated: boolean
  placeOrder: (input: PlaceOrderInput) => Order
  getOrder: (id: string) => Order | undefined
  patchOrder: (
    id: string,
    patch: Partial<Pick<Order, "status" | "publicNumber">>
  ) => void
}

const OrdersContext = React.createContext<OrdersContextValue | null>(null)

function loadOrders(tenant: string): Order[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(ordersStorageKey(tenant))
    if (!raw) return []
    const parsed = JSON.parse(raw) as Order[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveOrders(tenant: string, orders: Order[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(ordersStorageKey(tenant), JSON.stringify(orders))
}

export function OrdersProvider({
  tenant,
  children,
}: {
  tenant: string
  children: React.ReactNode
}) {
  const [orders, setOrders] = React.useState<Order[]>([])
  const [hydrated, setHydrated] = React.useState(false)

  React.useEffect(() => {
    setOrders(loadOrders(tenant))
    setHydrated(true)
  }, [tenant])

  React.useEffect(() => {
    if (!hydrated) return
    saveOrders(tenant, orders)
  }, [tenant, orders, hydrated])

  const placeOrder = React.useCallback(
    (input: PlaceOrderInput) => {
      const order: Order = {
        id: input.id ?? createOrderId(),
        publicNumber: input.publicNumber,
        tenant,
        createdAt: new Date().toISOString(),
        status: input.status ?? "awaiting_acceptance",
        fulfillment: input.fulfillment,
        payment: input.payment,
        customer: input.customer,
        address: input.address,
        lines: input.lines,
        subtotal: input.subtotal,
        deliveryFee: input.deliveryFee,
        total: input.subtotal + input.deliveryFee,
        note: input.note,
      }
      setOrders((prev) => {
        const without = prev.filter((o) => o.id !== order.id)
        return [order, ...without]
      })
      return order
    },
    [tenant]
  )

  const getOrder = React.useCallback(
    (id: string) =>
      orders.find(
        (order) => order.id === id || order.publicNumber === id
      ),
    [orders]
  )

  const patchOrder = React.useCallback(
    (id: string, patch: Partial<Pick<Order, "status" | "publicNumber">>) => {
      setOrders((prev) => {
        let changed = false
        const next = prev.map((order) => {
          if (order.id !== id && order.publicNumber !== id) return order
          const status = patch.status ?? order.status
          const publicNumber =
            patch.publicNumber !== undefined
              ? patch.publicNumber
              : order.publicNumber
          if (
            order.status === status &&
            order.publicNumber === publicNumber
          ) {
            return order
          }
          changed = true
          return { ...order, ...patch }
        })
        return changed ? next : prev
      })
    },
    []
  )

  return (
    <OrdersContext.Provider
      value={{ tenant, orders, hydrated, placeOrder, getOrder, patchOrder }}
    >
      {children}
    </OrdersContext.Provider>
  )
}

export function useOrders() {
  const ctx = React.useContext(OrdersContext)
  if (!ctx) {
    throw new Error("useOrders must be used within OrdersProvider")
  }
  return ctx
}
