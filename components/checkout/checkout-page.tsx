"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { MercadoPagoBrick } from "@/components/checkout/mercadopago-brick"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/lib/cart/cart-context"
import {
  clearCustomerSession,
  loadCustomerSession,
  saveCustomerSession,
  sendCustomerOtp,
  verifyCustomerOtp,
  type CustomerAddress,
  type CustomerSession,
} from "@/lib/customer/api"
import { formatBrl, type StoreMenu } from "@/lib/menu/catalog"
import { useOrders } from "@/lib/orders/orders-context"
import {
  cartLinesToOrderPayload,
  createStoreOrder,
  fetchCheckoutConfig,
  type CheckoutConfig,
  type StoreOrder,
} from "@/lib/orders/store-api"
import type { FulfillmentType, PaymentChoice } from "@/lib/orders/types"
import { mapApiStatus } from "@/lib/orders/types"
import {
  formatBrPhoneInput,
  isValidBrMobile,
  toBrWhatsAppPhone,
} from "@/lib/phone/br"
import { useStoreNav } from "@/lib/store/nav-context"
import { cn } from "@/lib/utils"

type OtpPhase = "idle" | "code"

export function CheckoutPage({ menu }: { menu: StoreMenu }) {
  const router = useRouter()
  const { href } = useStoreNav()
  const { lines, subtotal, clear } = useCart()
  const { placeOrder } = useOrders()

  const [session, setSession] = React.useState<CustomerSession | null>(null)
  const [otpPhase, setOtpPhase] = React.useState<OtpPhase>("idle")
  const [otpCode, setOtpCode] = React.useState("")
  const [otpError, setOtpError] = React.useState<string | null>(null)
  const [phoneDisplay, setPhoneDisplay] = React.useState("")
  const otpInputRef = React.useRef<HTMLInputElement>(null)
  const lastOtpAttemptRef = React.useRef<string | null>(null)
  const [savedAddresses, setSavedAddresses] = React.useState<CustomerAddress[]>(
    []
  )
  const [addressMode, setAddressMode] = React.useState<"saved" | "new">("new")
  const [selectedAddressIdx, setSelectedAddressIdx] = React.useState(0)

  const [fulfillment, setFulfillment] =
    React.useState<FulfillmentType>("delivery")
  const [payment, setPayment] = React.useState<PaymentChoice>("pix")
  const [name, setName] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [street, setStreet] = React.useState("")
  const [number, setNumber] = React.useState("")
  const [complement, setComplement] = React.useState("")
  const [neighborhood, setNeighborhood] = React.useState("")
  const [city, setCity] = React.useState(menu.address.city)
  const [note, setNote] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)
  const [config, setConfig] = React.useState<CheckoutConfig | null>(null)
  const [pendingOrder, setPendingOrder] = React.useState<StoreOrder | null>(
    null
  )

  const deliveryFee =
    fulfillment === "delivery" ? (config?.deliveryFee ?? 5.9) : 0
  const total = subtotal + deliveryFee
  const belowMin = subtotal < menu.minOrder
  const onlinePayment = payment === "pix" || payment === "card_online"
  const mpReady = Boolean(config?.mercadoPagoEnabled && config.publicKey)

  React.useEffect(() => {
    if (lines.length === 0 && !pendingOrder) router.replace(href("/carrinho"))
  }, [lines.length, pendingOrder, router, href])

  React.useEffect(() => {
    const existing = loadCustomerSession(menu.tenant)
    if (!existing) return
    applyVerifiedSession(existing)
  }, [menu.tenant])

  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const cfg = await fetchCheckoutConfig(menu.tenant)
        if (!cancelled) setConfig(cfg)
      } catch {
        if (!cancelled)
          setConfig({
            mercadoPagoEnabled: false,
            publicKey: null,
            deliveryFee: 5.9,
            minOrder: menu.minOrder,
          })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [menu.tenant, menu.minOrder])

  React.useEffect(() => {
    if (
      fulfillment === "pickup" &&
      (payment === "cash" || payment === "card_delivery")
    ) {
      setPayment("pix")
    }
  }, [fulfillment, payment])

  function applyVerifiedSession(next: CustomerSession) {
    setSession(next)
    setPhone(formatBrPhoneInput(toBrWhatsAppPhone(next.phone).replace(/^55/, "")))
    if (next.profile.name) setName(next.profile.name)
    if (next.profile.email) setEmail(next.profile.email)
    setSavedAddresses(next.profile.addresses ?? [])
    if (next.profile.addresses?.length) {
      setAddressMode("saved")
      setSelectedAddressIdx(0)
      applyAddress(next.profile.addresses[0])
    } else {
      setAddressMode("new")
    }
    setOtpPhase("idle")
    setOtpCode("")
    setOtpError(null)
    lastOtpAttemptRef.current = null
    setError(null)
  }

  function applyAddress(addr: CustomerAddress) {
    setStreet(addr.street)
    setNumber(addr.number)
    setComplement(addr.complement ?? "")
    setNeighborhood(addr.neighborhood)
    setCity(addr.city || menu.address.city)
  }

  function finishLocalMirror(order: StoreOrder, paymentChoice: PaymentChoice) {
    placeOrder({
      id: order.id,
      publicNumber: order.publicNumber,
      status: mapApiStatus(order.status),
      fulfillment: order.fulfillment.toLowerCase() as FulfillmentType,
      payment: paymentChoice,
      customer: {
        name: order.customerName,
        phone: order.customerPhone,
        email: order.customerEmail ?? undefined,
      },
      address:
        order.fulfillment.toLowerCase() === "delivery"
          ? {
              street: street.trim(),
              number: number.trim(),
              complement: complement.trim() || undefined,
              neighborhood: neighborhood.trim(),
              city: city.trim() || menu.address.city,
            }
          : undefined,
      lines,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      note: order.note ?? undefined,
    })
    clear()
    router.push(href(`/pedido/${order.id}`))
  }

  async function sendOtp() {
    setError(null)
    setOtpError(null)
    if (!isValidBrMobile(phone)) {
      setError("Informe um telefone válido com DDD.")
      return
    }
    setSubmitting(true)
    try {
      const result = await sendCustomerOtp(menu.tenant, phone)
      setPhoneDisplay(result.phoneDisplay)
      setOtpCode("")
      lastOtpAttemptRef.current = null
      setOtpPhase("code")
      requestAnimationFrame(() => otpInputRef.current?.focus())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao enviar código.")
    } finally {
      setSubmitting(false)
    }
  }

  async function confirmOtp(code: string) {
    if (!/^\d{6}$/.test(code.trim())) return
    if (lastOtpAttemptRef.current === code || submitting) return

    lastOtpAttemptRef.current = code
    setOtpError(null)
    setError(null)
    setSubmitting(true)
    try {
      const result = await verifyCustomerOtp(menu.tenant, phone, code)
      const next: CustomerSession = {
        token: result.token,
        phone: result.profile.phone,
        expiresAtUtc: result.expiresAtUtc,
        profile: result.profile,
      }
      saveCustomerSession(menu.tenant, next)
      applyVerifiedSession(next)
    } catch (err) {
      setOtpError(
        err instanceof Error
          ? err.message
          : "Código inválido. Confira e tente de novo."
      )
      requestAnimationFrame(() => {
        const el = otpInputRef.current
        if (!el) return
        el.focus()
        el.select()
      })
    } finally {
      setSubmitting(false)
    }
  }

  function clearWhatsAppSession() {
    clearCustomerSession(menu.tenant)
    setSession(null)
    setSavedAddresses([])
    setAddressMode("new")
    setOtpPhase("idle")
    setOtpCode("")
    setOtpError(null)
    lastOtpAttemptRef.current = null
    setError(null)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!menu.isOpen) {
      setError("A loja está offline.")
      return
    }
    if (belowMin) {
      setError(`Pedido mínimo de ${formatBrl(menu.minOrder)}.`)
      return
    }
    if (!name.trim() || !phone.trim()) {
      setError("Informe nome e WhatsApp.")
      return
    }
    if (!isValidBrMobile(phone)) {
      setError("Informe um WhatsApp válido com DDD.")
      return
    }
    if (fulfillment === "delivery") {
      if (!street.trim() || !number.trim() || !neighborhood.trim()) {
        setError("Preencha o endereço de entrega.")
        return
      }
    }
    if (onlinePayment && !mpReady) {
      setError(
        "Pagamento online indisponível. Configure o Mercado Pago na loja."
      )
      return
    }

    setSubmitting(true)
    try {
      const apiPaymentMethod =
        payment === "cash"
          ? "cash"
          : payment === "card_delivery"
            ? "card_delivery"
            : "mercadopago"

      const created = await createStoreOrder(menu.tenant, {
        fulfillment,
        paymentMethod: apiPaymentMethod,
        customerName: name.trim(),
        customerPhone: toBrWhatsAppPhone(phone),
        customerEmail: email.trim() || null,
        subtotal,
        deliveryFee,
        note: note.trim() || null,
        lines: cartLinesToOrderPayload(lines),
        addressStreet: fulfillment === "delivery" ? street.trim() : null,
        addressNumber: fulfillment === "delivery" ? number.trim() : null,
        addressComplement:
          fulfillment === "delivery" ? complement.trim() || null : null,
        addressNeighborhood:
          fulfillment === "delivery" ? neighborhood.trim() : null,
        addressCity:
          fulfillment === "delivery"
            ? city.trim() || menu.address.city
            : null,
      })

      if (apiPaymentMethod === "mercadopago") {
        setPendingOrder(created)
        return
      }

      finishLocalMirror(created, payment)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao criar pedido.")
    } finally {
      setSubmitting(false)
    }
  }

  if (lines.length === 0 && !pendingOrder) {
    return null
  }

  if (pendingOrder && config?.publicKey) {
    return (
      <div className="space-y-4 px-4 py-4 lg:px-6 lg:py-6">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-medium lg:text-xl lg:font-semibold">
            Pagamento · {pendingOrder.publicNumber}
          </h1>
        </div>
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <MercadoPagoBrick
          tenant={menu.tenant}
          publicKey={config.publicKey}
          order={pendingOrder}
          payerEmail={email.trim() || undefined}
          onPaid={(order) => finishLocalMirror(order, payment)}
          onError={setError}
        />
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="pb-28 lg:pb-6">
      <CheckoutHeader href={href("/carrinho")} title="Checkout" />

      <div className="grid gap-6 px-4 pt-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start lg:px-6 lg:pt-2">
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold">WhatsApp</h2>
            <div className="flex items-end gap-2">
              <div className="min-w-0 flex-1 space-y-2">
                <Label htmlFor="phone">Número</Label>
                <Input
                  id="phone"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(21) 99865-2091"
                  value={phone}
                  onChange={(e) => {
                    setPhone(formatBrPhoneInput(e.target.value))
                    if (otpPhase === "code") {
                      setOtpPhase("idle")
                      setOtpCode("")
                    }
                  }}
                  readOnly={Boolean(session)}
                  disabled={Boolean(session)}
                  required
                />
              </div>
              {session ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={clearWhatsAppSession}
                >
                  Trocar
                </Button>
              ) : otpPhase === "idle" ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  disabled={submitting || !isValidBrMobile(phone)}
                  onClick={() => void sendOtp()}
                >
                  {submitting ? "Enviando…" : "Ativar fidelidade"}
                </Button>
              ) : null}
            </div>
            {session ? (
              <p className="text-xs text-muted-foreground">
                WhatsApp confirmado — fidelidade ativa.
              </p>
            ) : null}
            {!session && otpPhase === "code" ? (
              <div className="space-y-3 rounded-xl border border-border/70 bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">
                  Digite o código enviado para{" "}
                  <span className="font-medium text-foreground">
                    {phoneDisplay || phone}
                  </span>
                  {submitting ? " — validando…" : ""}
                </p>
                <div className="space-y-2">
                  <Label htmlFor="otp">Código</Label>
                  <Input
                    ref={otpInputRef}
                    id="otp"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="000000"
                    value={otpCode}
                    disabled={submitting}
                    autoFocus
                    aria-invalid={Boolean(otpError)}
                    aria-describedby={otpError ? "otp-error" : undefined}
                    onChange={(e) => {
                      const next = e.target.value.replace(/\D/g, "").slice(0, 6)
                      setOtpCode(next)
                      if (otpError) setOtpError(null)
                      if (next !== lastOtpAttemptRef.current) {
                        lastOtpAttemptRef.current = null
                      }
                      if (next.length === 6) {
                        void confirmOtp(next)
                      }
                    }}
                    className={cn(
                      "text-center text-lg tracking-[0.3em]",
                      otpError && "border-destructive focus-visible:ring-destructive/40"
                    )}
                  />
                  {otpError ? (
                    <p
                      id="otp-error"
                      className="text-xs text-destructive"
                      role="alert"
                    >
                      {otpError}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={submitting}
                    onClick={() => void sendOtp()}
                  >
                    Reenviar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={submitting}
                    onClick={() => {
                      setOtpPhase("idle")
                      setOtpCode("")
                      setOtpError(null)
                      lastOtpAttemptRef.current = null
                      setError(null)
                    }}
                  >
                    Agora não
                  </Button>
                </div>
              </div>
            ) : null}
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold">Como prefere receber?</h2>
            <RadioGroup
              value={fulfillment}
              onValueChange={(v) => setFulfillment(v as FulfillmentType)}
              className="grid gap-3 sm:grid-cols-2"
            >
              {(
                [
                  ["delivery", "Entrega"],
                  ["pickup", "Retirada"],
                ] as const
              ).map(([value, label]) => (
                <label
                  key={value}
                  className="flex items-center gap-3 rounded-xl border px-3 py-2.5"
                >
                  <RadioGroupItem value={value} />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </RadioGroup>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold">Seus dados</h2>
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </section>

          {fulfillment === "delivery" ? (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold">Endereço de entrega</h2>
              {savedAddresses.length > 0 ? (
                <RadioGroup
                  value={addressMode}
                  onValueChange={(v) => {
                    const mode = v as "saved" | "new"
                    setAddressMode(mode)
                    if (mode === "saved") {
                      applyAddress(savedAddresses[selectedAddressIdx]!)
                    } else {
                      setStreet("")
                      setNumber("")
                      setComplement("")
                      setNeighborhood("")
                      setCity(menu.address.city)
                    }
                  }}
                  className="grid gap-2"
                >
                  <label className="flex items-start gap-3 rounded-xl border px-3 py-2.5">
                    <RadioGroupItem value="saved" className="mt-0.5" />
                    <span className="min-w-0 space-y-2 text-sm">
                      <span className="font-medium">Usar endereço salvo</span>
                      <div className="grid gap-2">
                        {savedAddresses.map((addr, idx) => (
                          <button
                            key={`${addr.street}-${addr.number}-${idx}`}
                            type="button"
                            className={cn(
                              "rounded-lg border px-3 py-2 text-left text-xs",
                              selectedAddressIdx === idx && addressMode === "saved"
                                ? "border-primary bg-primary/5"
                                : "border-border"
                            )}
                            onClick={() => {
                              setAddressMode("saved")
                              setSelectedAddressIdx(idx)
                              applyAddress(addr)
                            }}
                          >
                            {addr.street}, {addr.number}
                            {addr.complement ? ` — ${addr.complement}` : ""}
                            <br />
                            {addr.neighborhood}
                            {addr.city ? `, ${addr.city}` : ""}
                          </button>
                        ))}
                      </div>
                    </span>
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border px-3 py-2.5">
                    <RadioGroupItem value="new" />
                    <span className="text-sm font-medium">
                      Cadastrar outro endereço
                    </span>
                  </label>
                </RadioGroup>
              ) : null}

              {addressMode === "new" || savedAddresses.length === 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="street">Rua</Label>
                    <Input
                      id="street"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="number">Número</Label>
                    <Input
                      id="number"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="complement">Complemento</Label>
                    <Input
                      id="complement"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input
                      id="neighborhood"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                </div>
              ) : null}
            </section>
          ) : (
            <Alert>
              <AlertDescription>
                Retire em: {menu.address.line}, {menu.address.city} -{" "}
                {menu.address.state}
              </AlertDescription>
            </Alert>
          )}

          <section className="space-y-3">
            <h2 className="text-sm font-semibold">Pagamento</h2>
            {!mpReady ? (
              <Alert>
                <AlertDescription>
                  Pagamento online (Pix/cartão) ainda não está configurado para
                  esta loja. Você pode pagar na entrega.
                </AlertDescription>
              </Alert>
            ) : null}
            <RadioGroup
              value={payment}
              onValueChange={(v) => setPayment(v as PaymentChoice)}
              className="grid gap-3 sm:grid-cols-2"
            >
              {(
                [
                  ["pix", "Pix / cartão online"],
                  ["cash", "Dinheiro na entrega"],
                  ["card_delivery", "Cartão na entrega"],
                ] as const
              )
                .filter(([value]) => {
                  if (fulfillment === "pickup") {
                    return value === "pix"
                  }
                  if (!mpReady && value === "pix") return false
                  return true
                })
                .map(([value, label]) => (
                  <label
                    key={value}
                    className="flex items-center gap-3 rounded-xl border px-3 py-2.5"
                  >
                    <RadioGroupItem value={value} />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
            </RadioGroup>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold">Observações do pedido</h2>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ponto de referência, preferências..."
              rows={3}
            />
          </section>

          {error ? (
            <p className="text-sm text-destructive lg:hidden" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border p-4 text-sm lg:sticky lg:top-6 lg:rounded-3xl lg:p-5">
            <p className="mb-3 font-semibold">Resumo</p>
            <ul className="mb-3 max-h-48 space-y-2 overflow-y-auto text-sm">
              {lines.map((line) => (
                <li key={line.key} className="flex justify-between gap-2">
                  <span className="min-w-0 truncate text-muted-foreground">
                    {line.qty}x {line.name}
                  </span>
                  <span className="shrink-0 tabular-nums">
                    {formatBrl(line.unitPrice * line.qty)}
                  </span>
                </li>
              ))}
            </ul>
            <Separator className="my-3" />
            <div className="space-y-2">
              <Row label="Subtotal" value={formatBrl(subtotal)} />
              <Row label="Entrega" value={formatBrl(deliveryFee)} />
              <Separator />
              <Row label="Total" value={formatBrl(total)} strong />
            </div>
            {error ? (
              <p
                className="mt-3 hidden text-sm text-destructive lg:block"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            <Button
              type="submit"
              className="mt-4 w-full"
              disabled={submitting || belowMin || !menu.isOpen}
            >
              {submitting
                ? "Enviando…"
                : onlinePayment
                  ? "Continuar para pagar"
                  : "Confirmar pedido"}
            </Button>
          </div>
        </aside>
      </div>
    </form>
  )
}

function CheckoutHeader({
  href,
  title,
  onBack,
}: {
  href: string
  title: string
  onBack?: () => void
}) {
  return (
    <div className="flex items-center gap-2 border-b px-2 py-2 lg:border-b-0 lg:px-6 lg:pt-6 lg:pb-2">
      {onBack ? (
        <Button type="button" variant="ghost" size="icon-sm" onClick={onBack}>
          <ArrowLeft className="size-4" />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon-sm"
          nativeButton={false}
          render={<Link href={href} />}
        >
          <ArrowLeft className="size-4" />
        </Button>
      )}
      <h1 className="flex-1 text-sm font-medium lg:text-xl lg:font-semibold">
        {title}
      </h1>
    </div>
  )
}

function Row({
  label,
  value,
  strong,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 ${strong ? "font-semibold" : ""}`}
    >
      <span className={strong ? undefined : "text-muted-foreground"}>
        {label}
      </span>
      <span className="tabular-nums">{value}</span>
    </div>
  )
}
