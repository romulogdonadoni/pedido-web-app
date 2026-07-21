"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Check } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { OrderLinesAccordion } from "@/components/orders/order-lines-accordion"
import { formatBrl } from "@/lib/menu/catalog"
import { useOrders } from "@/lib/orders/orders-context"
import { getStoreOrder, type StoreOrder } from "@/lib/orders/store-api"
import {
  parseOrderLineOptions,
  type CartLine,
} from "@/lib/cart/types"
import {
  GUID_RE,
  mapApiStatus,
  ORDER_STATUS_HINT,
  ORDER_STATUS_LABEL,
  ORDER_TRACK_STEPS,
  orderStatusBadgeClass,
  type Order,
  type OrderStatus,
  type PaymentChoice,
} from "@/lib/orders/types"
import { cn } from "@/lib/utils"

const PAYMENT_LABEL = {
  pix: "Pix",
  card_online: "Cartão online",
  cash: "Dinheiro",
  card_delivery: "Cartão na entrega",
} as const

function mapApiPayment(method: string): PaymentChoice {
  switch (method.toLowerCase()) {
    case "cash":
      return "cash"
    case "cardondelivery":
    case "card_delivery":
      return "card_delivery"
    case "mercadopago":
      return "pix"
    default:
      return "pix"
  }
}

function storeOrderToView(api: StoreOrder, tenant: string): Order {
  const history = (api.statusHistory ?? []).map((h) => ({
    status: mapApiStatus(h.status),
    at: h.occurredAtUtc,
  }))

  // Dedup: keep first occurrence of each mapped status (Paid→awaiting merges).
  const seen = new Set<string>()
  const statusHistory = history.filter((h) => {
    if (seen.has(h.status)) return false
    seen.add(h.status)
    return true
  })

  return {
    id: api.id,
    publicNumber: api.publicNumber,
    tenant,
    createdAt: api.createdAtUtc,
    status: mapApiStatus(api.status),
    fulfillment:
      api.fulfillment.toLowerCase() === "pickup" ? "pickup" : "delivery",
    payment: mapApiPayment(api.paymentMethod),
    customer: {
      name: api.customerName,
      phone: api.customerPhone,
      email: api.customerEmail ?? undefined,
    },
    lines: api.lines.map((line) => {
      const options = parseOrderLineOptions(line.optionsJson)
      return {
        key: line.id,
        itemId: line.id,
        name: line.name,
        image: line.imageUrl ?? undefined,
        unitPrice: line.unitPrice,
        basePrice: line.unitPrice,
        qty: line.quantity,
        selectedOptions: options.selectedOptions ?? [],
        slotSelections: options.slotSelections,
        fixedItems: options.fixedItems,
        note: line.note ?? undefined,
      } satisfies CartLine
    }),
    subtotal: api.subtotal,
    deliveryFee: api.deliveryFee,
    total: api.total,
    note: api.note ?? undefined,
    statusHistory,
  }
}

function trackStepsFor(order: Order): OrderStatus[] {
  if (order.fulfillment === "pickup") {
    return ORDER_TRACK_STEPS.filter((s) => s !== "out_for_delivery")
  }
  return ORDER_TRACK_STEPS
}

function stepIndex(status: OrderStatus, steps: OrderStatus[]): number {
  if (status === "pending_payment") return -1
  if (status === "cancelled") return -1
  const idx = steps.indexOf(status)
  return idx
}

function formatStepTime(iso: string) {
  const d = new Date(iso)
  if (!Number.isFinite(d.getTime())) return null
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function stepOccurredAt(
  step: OrderStatus,
  order: Order
): string | null {
  const hit = order.statusHistory?.find((h) => h.status === step)
  if (hit) return hit.at

  // Pedidos antigos sem histórico completo: só a 1ª etapa usa a criação.
  const steps = trackStepsFor(order)
  const current = stepIndex(order.status, steps)
  const index = steps.indexOf(step)
  if (index === 0 && current >= 0) return order.createdAt
  return null
}

function StatusTrack({ order }: { order: Order }) {
  if (order.status === "pending_payment" || order.status === "cancelled") {
    return null
  }

  const steps = trackStepsFor(order)
  const current = stepIndex(order.status, steps)

  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const done = current >= 0 && index <= current
        const active = index === current
        const at = done ? stepOccurredAt(step, order) : null
        const formatted = at ? formatStepTime(at) : null
        return (
          <li key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full border text-[11px]",
                  done
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {done ? <Check className="size-3.5" /> : index + 1}
              </span>
              {index < steps.length - 1 ? (
                <span
                  className={cn(
                    "my-1 w-px min-h-4 flex-1",
                    index < current ? "bg-primary" : "bg-border"
                  )}
                />
              ) : null}
            </div>
            <div className={cn("min-w-0 flex-1 pb-4", index === steps.length - 1 && "pb-0")}>
              <div className="flex items-baseline justify-between gap-3">
                <p
                  className={cn(
                    "text-sm",
                    active
                      ? "font-semibold"
                      : done
                        ? "font-medium"
                        : "text-muted-foreground"
                  )}
                >
                  {ORDER_STATUS_LABEL[step]}
                </p>
                {formatted ? (
                  <time
                    dateTime={at ?? undefined}
                    className="shrink-0 text-[11px] tabular-nums text-muted-foreground"
                  >
                    {formatted}
                  </time>
                ) : null}
              </div>
              {active && ORDER_STATUS_HINT[step] ? (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {ORDER_STATUS_HINT[step]}
                </p>
              ) : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export function OrderReceipt({ orderId }: { orderId: string }) {
  const { getOrder, hydrated, tenant, patchOrder } = useOrders()
  const local = getOrder(orderId)
  const [remote, setRemote] = React.useState<Order | null>(null)
  const [loadingRemote, setLoadingRemote] = React.useState(false)
  const [remoteError, setRemoteError] = React.useState(false)

  const apiId =
    local && GUID_RE.test(local.id)
      ? local.id
      : GUID_RE.test(orderId)
        ? orderId
        : null

  const syncFromApi = React.useCallback(async () => {
    if (!apiId) return null
    const api = await getStoreOrder(tenant, apiId)
    const view = storeOrderToView(api, tenant)
    patchOrder(apiId, {
      status: view.status,
      publicNumber: view.publicNumber,
    })
    setRemote(view)
    return view
  }, [apiId, tenant, patchOrder])

  React.useEffect(() => {
    if (!hydrated || !apiId) {
      if (hydrated && !local && !GUID_RE.test(orderId)) {
        setRemoteError(true)
      }
      return
    }
    let cancelled = false
    setLoadingRemote(!local)
    ;(async () => {
      try {
        await syncFromApi()
      } catch {
        if (!cancelled && !local) setRemoteError(true)
      } finally {
        if (!cancelled) setLoadingRemote(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // `local` de propósito fora das deps: patchOrder atualizava o pedido e
    // reentrava neste effect em loop infinito.
  }, [hydrated, apiId, orderId, syncFromApi])

  React.useEffect(() => {
    if (!apiId) return
    const open = remote?.status ?? local?.status
    if (
      open === "delivered" ||
      open === "cancelled" ||
      open === "pending_payment"
    ) {
      return
    }

    const timer = window.setInterval(() => {
      void syncFromApi().catch(() => undefined)
    }, 5000)
    return () => window.clearInterval(timer)
  }, [apiId, remote?.status, local?.status, syncFromApi])

  const order = remote ?? local

  if (!hydrated || loadingRemote) {
    return (
      <div className="px-4 py-8 text-sm text-muted-foreground">Carregando…</div>
    )
  }

  if (!order || remoteError) {
    return (
      <div className="space-y-3 px-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">Pedido não encontrado.</p>
        <Button render={<Link href="/pedidos" />}>Ver pedidos</Button>
      </div>
    )
  }

  const title = order.publicNumber || order.id

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

      <div className="mx-auto max-w-2xl space-y-5 px-4 pt-4 lg:px-6 lg:pt-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">{title}</h2>
            <Badge
              variant="secondary"
              className={orderStatusBadgeClass(order.status)}
            >
              {ORDER_STATUS_LABEL[order.status]}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleString("pt-BR")}
          </p>
          {ORDER_STATUS_HINT[order.status] ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {ORDER_STATUS_HINT[order.status]}
            </p>
          ) : null}
        </div>

        <section className="rounded-2xl border p-4">
          <h3 className="mb-3 text-sm font-semibold">Acompanhar</h3>
          <StatusTrack order={order} />
        </section>

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

        <OrderLinesAccordion
          lines={order.lines.map((line) => ({
            id: line.key,
            name: line.name,
            quantity: line.qty,
            lineTotal: line.unitPrice * line.qty,
            note: line.note,
            options: {
              selectedOptions: line.selectedOptions,
              slotSelections: line.slotSelections,
              fixedItems: line.fixedItems,
            },
          }))}
        />

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
            <span className="tabular-nums">{formatBrl(order.total)}</span>
          </div>
        </div>

        <Button className="w-full" render={<Link href="/" />}>
          Voltar ao cardápio
        </Button>
      </div>
    </div>
  )
}
