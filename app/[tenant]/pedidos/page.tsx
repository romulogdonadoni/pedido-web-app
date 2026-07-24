import type { Metadata } from "next"

import { OrdersList } from "@/components/orders/orders-list"

export const metadata: Metadata = { title: "Pedidos" }

export default function PedidosRoute() {
  return <OrdersList />
}
