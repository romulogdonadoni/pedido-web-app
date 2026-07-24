"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { CustomerPhoneOtpGate } from "@/components/customer/customer-phone-otp-gate"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  clearCustomerSession,
  fetchCustomerOrders,
  fetchCustomerProfile,
  isCustomerSessionError,
  loadCustomerSession,
  saveCustomerSession,
  type CustomerOrderSummary,
  type CustomerSession,
} from "@/lib/customer/api"
import { formatBrl } from "@/lib/menu/catalog"
import { useOrders } from "@/lib/orders/orders-context"
import { getStoreOrder } from "@/lib/orders/store-api"
import { useStoreNav } from "@/lib/store/nav-context"
import { STORE_HOME_PATH } from "@/lib/tenant/host"
import {
  GUID_RE,
  mapApiStatus,
  ORDER_STATUS_LABEL,
  orderStatusBadgeClass,
  type OrderStatus,
} from "@/lib/orders/types"

type GateState = "loading" | "auth" | "ready"

type ListedOrder = {
  id: string
  publicNumber: string
  status: OrderStatus
  createdAt: string
  linesCount: number
  total: number
}

function summaryToListed(row: CustomerOrderSummary): ListedOrder {
  return {
    id: row.id,
    publicNumber: row.publicNumber,
    status: mapApiStatus(row.status),
    createdAt: row.createdAtUtc,
    linesCount: row.linesCount,
    total: row.total,
  }
}

export function OrdersList() {
  const { href } = useStoreNav()
  const { hydrated, tenant, patchOrder } = useOrders()
  const [gate, setGate] = React.useState<GateState>("loading")
  const [session, setSession] = React.useState<CustomerSession | null>(null)
  const [listed, setListed] = React.useState<ListedOrder[]>([])
  const [loadingOrders, setLoadingOrders] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const requireAuth = React.useCallback(() => {
    clearCustomerSession(tenant)
    setSession(null)
    setListed([])
    setGate("auth")
  }, [tenant])

  const loadOrdersForSession = React.useCallback(
    async (next: CustomerSession) => {
      setLoadingOrders(true)
      setError(null)
      try {
        const remote = await fetchCustomerOrders(tenant, next.token)
        setListed(remote.map(summaryToListed))
        setSession(next)
        setGate("ready")
      } catch (err) {
        if (isCustomerSessionError(err)) {
          requireAuth()
          return
        }
        setError(err instanceof Error ? err.message : "Falha ao carregar pedidos.")
        setSession(next)
        setGate("ready")
      } finally {
        setLoadingOrders(false)
      }
    },
    [requireAuth, tenant]
  )

  React.useEffect(() => {
    if (!hydrated) return
    let cancelled = false

    ;(async () => {
      const existing = loadCustomerSession(tenant)
      if (!existing) {
        if (!cancelled) setGate("auth")
        return
      }

      try {
        const profile = await fetchCustomerProfile(tenant, existing.token)
        if (cancelled) return
        const refreshed: CustomerSession = {
          ...existing,
          profile,
          phone: profile.phone,
        }
        saveCustomerSession(tenant, refreshed)
        await loadOrdersForSession(refreshed)
      } catch (err) {
        if (cancelled) return
        if (isCustomerSessionError(err)) {
          requireAuth()
          return
        }
        // Rede/API instável: tenta listar com o token salvo; se 401, pede OTP.
        try {
          if (!cancelled) await loadOrdersForSession(existing)
        } catch {
          if (!cancelled) requireAuth()
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [hydrated, tenant, loadOrdersForSession, requireAuth])

  const orderIdsKey = listed
    .filter((o) => GUID_RE.test(o.id))
    .map((o) => o.id)
    .join(",")

  React.useEffect(() => {
    if (gate !== "ready" || !orderIdsKey) return
    const orderIds = orderIdsKey.split(",")
    let cancelled = false

    async function refreshStatuses() {
      await Promise.all(
        orderIds.map(async (id) => {
          try {
            const api = await getStoreOrder(tenant, id)
            if (cancelled) return
            const status = mapApiStatus(api.status)
            setListed((prev) =>
              prev.map((row) =>
                row.id === id
                  ? {
                      ...row,
                      status,
                      publicNumber: api.publicNumber,
                    }
                  : row
              )
            )
            patchOrder(id, {
              status,
              publicNumber: api.publicNumber,
            })
          } catch {
            // ignore per-order failures
          }
        })
      )
    }

    void refreshStatuses()
    const timer = window.setInterval(() => void refreshStatuses(), 8000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [gate, orderIdsKey, tenant, patchOrder])

  if (!hydrated || gate === "loading") {
    return (
      <div className="px-4 py-8 text-sm text-muted-foreground lg:px-6">
        Carregando…
      </div>
    )
  }

  if (gate === "auth") {
    return (
      <CustomerPhoneOtpGate
        tenant={tenant}
        title="Meus pedidos"
        description="Informe o WhatsApp e o código enviado para ver seus pedidos. Em outro aparelho ou se a sessão expirar, pedimos de novo."
        onVerified={(next) => {
          void loadOrdersForSession(next)
        }}
      />
    )
  }

  return (
    <div className="px-4 py-4 pb-8 lg:px-6 lg:py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight lg:text-2xl">
            Pedidos
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {session?.profile.phone
              ? `WhatsApp ${session.profile.phone}`
              : "Acompanhe o status dos seus pedidos nesta loja."}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={requireAuth}
        >
          Trocar número
        </Button>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {loadingOrders ? (
          <p className="text-sm text-muted-foreground">Carregando pedidos…</p>
        ) : listed.length === 0 ? (
          <div className="space-y-3 py-8 text-center md:col-span-2">
            <p className="text-sm text-muted-foreground">
              Você ainda não fez pedidos nesta loja com este número.
            </p>
            <Button render={<Link href={href(STORE_HOME_PATH)} />}>
              Ir ao cardápio
            </Button>
          </div>
        ) : (
          listed.map((order) => (
            <Link
              key={order.id}
              href={href(`/pedido/${order.id}`)}
              className="flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors hover:bg-muted/40"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">
                    {order.publicNumber || order.id}
                  </p>
                  <Badge
                    variant="secondary"
                    className={orderStatusBadgeClass(order.status)}
                  >
                    {ORDER_STATUS_LABEL[order.status] ?? order.status}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleString("pt-BR")} ·{" "}
                  {order.linesCount}{" "}
                  {order.linesCount === 1 ? "item" : "itens"}
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
