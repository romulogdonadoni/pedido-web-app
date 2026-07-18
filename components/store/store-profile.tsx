import { ArrowLeft, MapPin, Share2 } from "lucide-react"
import Link from "next/link"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatBrl, type StoreMenu } from "@/lib/menu/catalog"

export function StoreProfile({ menu }: { menu: StoreMenu }) {
  const online = menu.payments.filter((p) => p.kind === "online")
  const delivery = menu.payments.filter((p) => p.kind === "delivery")

  return (
    <div className="pb-8 lg:pb-6">
      <div className="flex items-center gap-2 border-b px-2 py-2 lg:border-b-0 lg:px-6 lg:pt-6 lg:pb-2">
        <Button variant="ghost" size="icon-sm" render={<Link href="/" />}>
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="flex-1 text-sm font-medium lg:text-xl lg:font-semibold">
          Perfil da loja
        </h1>
        <Button
          variant="ghost"
          size="icon-sm"
          className="opacity-50 lg:hidden"
          disabled
        >
          <Share2 className="size-4" />
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:px-6 lg:pt-2">
        <div className="min-w-0">
          <div className="space-y-3 px-4 pt-4 lg:px-0 lg:pt-0">
            <div className="overflow-hidden rounded-2xl bg-muted px-4 py-8 lg:rounded-3xl lg:px-6 lg:py-10">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {menu.bannerTitle}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {menu.bannerSubtitle}
              </p>
            </div>

            <div className="flex items-start gap-3">
              <Avatar className="size-14 border lg:size-16">
                <AvatarFallback className="text-sm font-semibold">
                  {menu.name
                    .split(" ")
                    .slice(0, 2)
                    .map((p) => p[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold tracking-tight lg:text-2xl">
                  {menu.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {menu.categoryLabel}
                </p>
              </div>
            </div>

            {!menu.isOpen ? (
              <div className="rounded-xl bg-foreground px-3 py-2 text-center text-sm font-medium text-background">
                Loja offline
              </div>
            ) : (
              <div className="rounded-xl bg-primary/10 px-3 py-2 text-center text-sm font-medium text-primary">
                Loja aberta
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Pedido mín. {formatBrl(menu.minOrder)}
            </p>
          </div>

          <SectionTitle>Horário de atendimento</SectionTitle>
          <ul className="px-4 lg:rounded-2xl lg:border lg:px-4">
            {menu.hours.map((h) => (
              <li
                key={h.day}
                className="flex justify-between gap-4 border-b border-border/60 py-3 text-sm last:border-b-0"
              >
                <span>{h.day}</span>
                <span className="text-muted-foreground">{h.hours}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0">
          <SectionTitle>Formas de pagamento</SectionTitle>
          <div className="space-y-4 px-4 lg:px-0">
            <PaymentList title="Online" methods={online} />
            <PaymentList title="Na entrega" methods={delivery} />
          </div>

          <SectionTitle>Endereço</SectionTitle>
          <div className="space-y-3 px-4 lg:px-0">
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <p>
                {menu.address.line}, {menu.address.city} - {menu.address.state},{" "}
                {menu.address.zip}
              </p>
            </div>
            <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed bg-muted/50 text-sm text-muted-foreground lg:h-56">
              Mapa (placeholder)
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 bg-muted px-4 py-2 text-sm font-medium text-muted-foreground lg:mt-4 lg:rounded-xl lg:bg-transparent lg:px-0 lg:text-base lg:font-semibold lg:text-foreground">
      {children}
    </div>
  )
}

function PaymentList({
  title,
  methods,
}: {
  title: string
  methods: StoreMenu["payments"]
}) {
  if (!methods.length) return null
  return (
    <div>
      <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {title}
      </p>
      <ul className="space-y-3">
        {methods.map((method) => (
          <li key={method.id}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{method.name}</p>
                <p className="text-xs text-muted-foreground">
                  {method.kind === "online"
                    ? "Pagamento online"
                    : "Pagamento na entrega"}
                </p>
              </div>
            </div>
            {method.brands?.length ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {method.brands.map((brand) => (
                  <Badge key={brand} variant="outline">
                    {brand}
                  </Badge>
                ))}
              </div>
            ) : null}
            <Separator className="mt-3" />
          </li>
        ))}
      </ul>
    </div>
  )
}
