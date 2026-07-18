"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatBrl } from "@/lib/menu/catalog"
import { useOrders } from "@/lib/orders/orders-context"
import { ORDER_STATUS_LABEL } from "@/lib/orders/types"

const PAYMENT_LABEL = {
  pix: "Pix",
  card_online: "Cartão online",
  cash: "Dinheiro",
  card_delivery: "Cartão na entrega",
} as const

export function OrderReceipt({ orderId }: { orderId: string }) {
  const { getOrder, hydrated } = useOrders()
  const order = getOrder(orderId)

  if (!hydrated) {
    return (
      <div className="px-4 py-8 text-sm text-muted-foreground">Carregando…</div>
    )
  }

  if (!order) {
    return (
      <div className="space-y-3 px-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">Pedido não encontrado.</p>
        <Button render={<Link href="/pedidos" />}>Ver pedidos</Button>
      </div>
    )
  }

  return (
    <div className="pb-8">
      <div className="flex items-center gap-2 border-b px-2 py-2 lg:border-b-0 lg:px-6 lg:pt-6 lg:pb-2">
        <Button variant="ghost" size="icon-sm" render={<Link href="/pedidos" />}>
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="flex-1 text-sm font-medium lg:text-xl lg:font-semibold">
          Pedido
        </h1>
      </div>

      <div className="mx-auto max-w-2xl space-y-4 px-4 pt-4 lg:px-6 lg:pt-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">{order.id}</h2>
            <Badge>{ORDER_STATUS_LABEL[order.status]}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleString("pt-BR")}
          </p>
        </div>

        <section className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Cliente: </span>
            {order.customer.name} · {order.customer.phone}
          </p>
          <p>
            <span className="text-muted-foreground">Modalidade: </span>
            {order.fulfillment === "delivery" ? "Entrega" : "Retirada"}
          </p>
          <p>
            <span className="text-muted-foreground">Pagamento: </span>
            {PAYMENT_LABEL[order.payment]}
          </p>
          {order.address ? (
            <p>
              <span className="text-muted-foreground">Endereço: </span>
              {order.address.street}, {order.address.number}
              {order.address.complement
                ? ` — ${order.address.complement}`
                : ""}{" "}
              · {order.address.neighborhood}, {order.address.city}
            </p>
          ) : null}
          {order.note ? (
            <p>
              <span className="text-muted-foreground">Obs.: </span>
              {order.note}
            </p>
          ) : null}
        </section>

        <Separator />

        <ul className="space-y-3">
          {order.lines.map((line) => (
            <li key={line.key} className="flex justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="font-medium">
                  {line.qty}x {line.name}
                </p>
                {line.selectedOptions.length > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {line.selectedOptions.map((o) => o.name).join(", ")}
                  </p>
                ) : null}
                {line.note ? (
                  <p className="text-xs text-muted-foreground">Obs.: {line.note}</p>
                ) : null}
              </div>
              <span className="shrink-0 tabular-nums">
                {formatBrl(line.unitPrice * line.qty)}
              </span>
            </li>
          ))}
        </ul>

        <Separator />

        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular-nums">{formatBrl(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Entrega</span>
            <span className="tabular-nums">{formatBrl(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span className="tabular-nums text-primary">
              {formatBrl(order.total)}
            </span>
          </div>
        </div>

        <Button className="w-full" render={<Link href="/" />}>
          Fazer novo pedido
        </Button>
      </div>
    </div>
  )
}
