"use client"

import { initMercadoPago, Payment, StatusScreen } from "@mercadopago/sdk-react"
import * as React from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { formatBrl } from "@/lib/menu/catalog"
import {
  getStoreOrder,
  processStorePayment,
  type StoreOrder,
} from "@/lib/orders/store-api"

type Props = {
  tenant: string
  publicKey: string
  order: StoreOrder
  /** Optional — Brick asks for e-mail when empty. */
  payerEmail?: string
  onPaid: (order: StoreOrder) => void
  onError: (message: string) => void
}

export function MercadoPagoBrick({
  tenant,
  publicKey,
  order,
  payerEmail,
  onPaid,
  onError,
}: Props) {
  const [ready, setReady] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [pixCode, setPixCode] = React.useState<string | null>(null)
  const [mpPaymentId, setMpPaymentId] = React.useState<string | null>(null)
  const isTestKey = publicKey.trim().toUpperCase().startsWith("TEST-")

  React.useEffect(() => {
    initMercadoPago(publicKey, { locale: "pt-BR" })
    setReady(true)
  }, [publicKey])

  React.useEffect(() => {
    if (!mpPaymentId && !pixCode) return
    const timer = window.setInterval(async () => {
      try {
        const latest = await getStoreOrder(tenant, order.id)
        if (
          latest.status === "Paid" ||
          latest.status === "AwaitingAcceptance" ||
          latest.status === "Received" ||
          latest.status === "Preparing"
        ) {
          onPaid(latest)
        }
      } catch {
        // ignore transient poll errors
      }
    }, 4000)
    return () => window.clearInterval(timer)
  }, [mpPaymentId, pixCode, tenant, order.id, onPaid])

  if (!ready) {
    return (
      <p className="text-sm text-muted-foreground">Carregando pagamento…</p>
    )
  }

  if (mpPaymentId) {
    return (
      <div className="space-y-4 rounded-2xl border p-4">
        <h3 className="text-sm font-semibold">Pague com Pix</h3>
        <p className="text-xs text-muted-foreground">
          {formatBrl(order.total)} · o pedido confirma automaticamente após o
          pagamento.
        </p>
        {isTestKey ? (
          <Alert>
            <AlertDescription>
              Credenciais de <strong>teste</strong> do Mercado Pago: o app do
              banco / MP em produção <strong>não consegue ler</strong> este QR.
              Use o botão de copiar Pix na tela abaixo, ou troque para Access
              Token / Public Key de produção no <code>.env</code> da API.
            </AlertDescription>
          </Alert>
        ) : null}
        {pixCode ? (
          <div className="space-y-2">
            <p className="rounded-lg bg-muted p-3 font-mono text-[11px] break-all">
              {pixCode}
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => void navigator.clipboard.writeText(pixCode)}
            >
              Copiar código Pix
            </Button>
          </div>
        ) : null}
        <StatusScreen
          initialization={{ paymentId: mpPaymentId }}
          onError={() => {
            onError("Não foi possível exibir o status do pagamento Pix.")
          }}
        />
        <Alert>
          <AlertDescription>
            Aguardando confirmação do Mercado Pago…
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Pagar online</h3>
      <p className="text-xs text-muted-foreground">
        Pix ou cartão via Mercado Pago · {formatBrl(order.total)}
      </p>
      {busy ? (
        <p className="text-sm text-muted-foreground">Processando…</p>
      ) : null}
      <div className="rounded-3xl border overflow-hidden">
        <Payment
          initialization={{
            amount: Number(order.total),
            ...(payerEmail?.trim()
              ? { payer: { email: payerEmail.trim() } }
              : {}),
          }}
          customization={{
            paymentMethods: {
              creditCard: "all",
              debitCard: "all",
              bankTransfer: "all",
              maxInstallments: 12,
            },
          }}
          onSubmit={async ({ formData }) => {
            setBusy(true)
            try {
              const data = formData as {
                token?: string
                payment_method_id?: string
                installments?: number
                issuer_id?: string | number
                payer?: {
                  email?: string
                  identification?: { type?: string; number?: string }
                }
              }

              const updated = await processStorePayment(tenant, order.id, {
                token: data.token ?? null,
                paymentMethodId: data.payment_method_id ?? null,
                installments: data.installments ?? null,
                issuerId:
                  data.issuer_id != null ? String(data.issuer_id) : null,
                payerEmail:
                  data.payer?.email ?? payerEmail?.trim() ?? null,
                identificationType: data.payer?.identification?.type ?? null,
                identificationNumber:
                  data.payer?.identification?.number ?? null,
              })

              const paymentId = updated.latestPayment?.mercadoPagoPaymentId
              const code = updated.latestPayment?.pixQrCode?.trim() || null

              if (
                updated.latestPayment?.status === "Pending" &&
                paymentId != null
              ) {
                setPixCode(code)
                setMpPaymentId(String(paymentId))
                return
              }

              if (
              updated.status === "Paid" ||
              updated.status === "AwaitingAcceptance" ||
              updated.status === "Received" ||
              updated.latestPayment?.status === "Approved"
              ) {
                onPaid(updated)
                return
              }

              onError(
                updated.latestPayment?.statusDetail ||
                  "Pagamento não aprovado. Tente outro meio."
              )
            } catch (err) {
              onError(
                err instanceof Error
                  ? err.message
                  : "Falha ao processar pagamento."
              )
              throw err
            } finally {
              setBusy(false)
            }
          }}
          onError={() => {
            onError("Erro no formulário de pagamento.")
          }}
        />
      </div>
    </div>
  )
}
