"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/lib/cart/cart-context"
import { formatBrl, type StoreMenu } from "@/lib/menu/catalog"
import { useOrders } from "@/lib/orders/orders-context"
import type {
  FulfillmentType,
  PaymentChoice,
} from "@/lib/orders/types"

const DELIVERY_FEE = 5.9

export function CheckoutPage({ menu }: { menu: StoreMenu }) {
  const router = useRouter()
  const { lines, subtotal, clear } = useCart()
  const { placeOrder } = useOrders()

  const [fulfillment, setFulfillment] =
    React.useState<FulfillmentType>("delivery")
  const [payment, setPayment] = React.useState<PaymentChoice>("pix")
  const [name, setName] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [street, setStreet] = React.useState("")
  const [number, setNumber] = React.useState("")
  const [complement, setComplement] = React.useState("")
  const [neighborhood, setNeighborhood] = React.useState("")
  const [city, setCity] = React.useState(menu.address.city)
  const [note, setNote] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  const deliveryFee = fulfillment === "delivery" ? DELIVERY_FEE : 0
  const total = subtotal + deliveryFee
  const belowMin = subtotal < menu.minOrder

  React.useEffect(() => {
    if (lines.length === 0) router.replace("/carrinho")
  }, [lines.length, router])

  function submit(e: React.FormEvent) {
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
      setError("Informe nome e telefone.")
      return
    }
    if (fulfillment === "delivery") {
      if (!street.trim() || !number.trim() || !neighborhood.trim()) {
        setError("Preencha o endereço de entrega.")
        return
      }
    }

    setSubmitting(true)
    const order = placeOrder({
      fulfillment,
      payment,
      customer: { name: name.trim(), phone: phone.trim() },
      address:
        fulfillment === "delivery"
          ? {
              street: street.trim(),
              number: number.trim(),
              complement: complement.trim() || undefined,
              neighborhood: neighborhood.trim(),
              city: city.trim() || menu.address.city,
            }
          : undefined,
      lines,
      subtotal,
      deliveryFee,
      note: note.trim() || undefined,
    })
    clear()
    router.push(`/pedido/${order.id}`)
  }

  if (lines.length === 0) {
    return null
  }

  return (
    <form onSubmit={submit} className="pb-28 lg:pb-6">
      <div className="flex items-center gap-2 border-b px-2 py-2 lg:border-b-0 lg:px-6 lg:pt-6 lg:pb-2">
        <Button variant="ghost" size="icon-sm" render={<Link href="/carrinho" />}>
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="flex-1 text-sm font-medium lg:text-xl lg:font-semibold">
          Checkout
        </h1>
      </div>

      <div className="grid gap-6 px-4 pt-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start lg:px-6 lg:pt-2">
        <div className="space-y-6">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Como prefere receber?</h2>
          <RadioGroup
            value={fulfillment}
            onValueChange={(v) => setFulfillment(v as FulfillmentType)}
            className="grid gap-3 sm:grid-cols-2"
          >
            <label className="flex items-center gap-3 rounded-xl border px-3 py-2.5">
              <RadioGroupItem value="delivery" />
              <span className="text-sm">Entrega (+ {formatBrl(DELIVERY_FEE)})</span>
            </label>
            <label className="flex items-center gap-3 rounded-xl border px-3 py-2.5">
              <RadioGroupItem value="pickup" />
              <span className="text-sm">Retirada no balcão</span>
            </label>
          </RadioGroup>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Seus dados</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nome" htmlFor="name">
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>
            <Field label="Telefone" htmlFor="phone">
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(67) 99999-9999"
                required
              />
            </Field>
          </div>
        </section>

        {fulfillment === "delivery" ? (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold">Endereço de entrega</h2>
            <Field label="Rua" htmlFor="street">
              <Input
                id="street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Número" htmlFor="number">
                <Input
                  id="number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                />
              </Field>
              <Field label="Complemento" htmlFor="complement">
                <Input
                  id="complement"
                  value={complement}
                  onChange={(e) => setComplement(e.target.value)}
                />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Bairro" htmlFor="neighborhood">
                <Input
                  id="neighborhood"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                />
              </Field>
              <Field label="Cidade" htmlFor="city">
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </Field>
            </div>
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
          <h2 className="text-sm font-semibold">Pagamento (mock)</h2>
          <RadioGroup
            value={payment}
            onValueChange={(v) => setPayment(v as PaymentChoice)}
            className="grid gap-3 sm:grid-cols-2"
          >
            {(
              [
                ["pix", "Pix"],
                ["card_online", "Cartão online"],
                ["cash", "Dinheiro na entrega"],
                ["card_delivery", "Cartão na entrega"],
              ] as const
            )
              .filter(([value]) =>
                fulfillment === "pickup"
                  ? value === "pix" || value === "card_online"
                  : true
              )
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
              <p className="mt-3 hidden text-sm text-destructive lg:block" role="alert">
                {error}
              </p>
            ) : null}
            {!menu.isOpen || belowMin ? (
              <Alert className="mt-3">
                <AlertDescription>
                  {!menu.isOpen
                    ? "Loja offline — não é possível confirmar."
                    : `Pedido mínimo: ${formatBrl(menu.minOrder)}.`}
                </AlertDescription>
              </Alert>
            ) : null}
            <Button
              type="submit"
              size="lg"
              className="mt-4 hidden w-full lg:inline-flex"
              disabled={!menu.isOpen || belowMin || submitting}
            >
              Confirmar pedido · {formatBrl(total)}
            </Button>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-14 z-30 border-t bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={!menu.isOpen || belowMin || submitting}
        >
          Confirmar pedido · {formatBrl(total)}
        </Button>
      </div>
    </form>
  )
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
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
    <div className="flex items-center justify-between gap-3">
      <span className={strong ? "font-medium" : "text-muted-foreground"}>
        {label}
      </span>
      <span className={strong ? "font-semibold tabular-nums" : "tabular-nums"}>
        {value}
      </span>
    </div>
  )
}
