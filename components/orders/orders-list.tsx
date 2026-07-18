"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatBrl } from "@/lib/menu/catalog"
import { useOrders } from "@/lib/orders/orders-context"
import { ORDER_STATUS_LABEL } from "@/lib/orders/types"

export function OrdersList() {
  const { orders, hydrated } = useOrders()

  return (
    <div className="px-4 py-4 pb-8 lg:px-6 lg:py-6">
      <h1 className="text-xl font-semibold tracking-tight lg:text-2xl">Pedidos</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Histórico neste dispositivo (mock).
      </p>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {!hydrated ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : orders.length === 0 ? (
          <div className="space-y-3 py-8 text-center md:col-span-2">
            <p className="text-sm text-muted-foreground">
              Você ainda não fez pedidos nesta loja.
            </p>
            <Button render={<Link href="/" />}>Ir ao cardápio</Button>
          </div>
        ) : (
          orders.map((order) => (
            <Link
              key={order.id}
              href={`/pedido/${order.id}`}
              className="flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors hover:bg-muted/40"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{order.id}</p>
                  <Badge variant="secondary">
                    {ORDER_STATUS_LABEL[order.status]}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleString("pt-BR")} ·{" "}
                  {order.lines.length}{" "}
                  {order.lines.length === 1 ? "item" : "itens"}
                </p>
                <p className="mt-1 text-sm font-semibold tabular-nums text-primary">
                  {formatBrl(order.total)}
                </p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
