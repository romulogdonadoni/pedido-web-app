"use client"

import { ArrowLeft, CreditCard, MapPin, Share2, Banknote } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatBrl, type StoreMenu } from "@/lib/menu/catalog"
import { useStoreNav } from "@/lib/store/nav-context"
import { STORE_HOME_PATH } from "@/lib/tenant/host"
import { cn } from "@/lib/utils"

const WEEKDAY_ALIASES: Record<number, string[]> = {
  0: ["domingo"],
  1: ["segunda"],
  2: ["terca", "terça"],
  3: ["quarta"],
  4: ["quinta"],
  5: ["sexta"],
  6: ["sabado", "sábado"],
}

function normalizeDay(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function isTodayLabel(day: string) {
  const aliases = WEEKDAY_ALIASES[new Date().getDay()] ?? []
  const d = normalizeDay(day)
  return aliases.some((a) => d.includes(normalizeDay(a)))
}

function brandIconLabel(brand: string) {
  const key = brand.trim().toLowerCase()
  if (key.includes("pix")) return "PIX"
  if (key.includes("visa")) return "Visa"
  if (key.includes("master")) return "Master"
  if (key.includes("elo")) return "Elo"
  if (key.includes("amex") || key.includes("american")) return "Amex"
  if (key.includes("hiper")) return "Hiper"
  return brand
}

export function StoreProfile({ menu }: { menu: StoreMenu }) {
  const { href } = useStoreNav()
  const online = menu.payments.filter((p) => p.kind === "online")
  const delivery = menu.payments.filter((p) => p.kind === "delivery")
  const gallery = menu.galleryUrls ?? []
  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim()
  const hasCoords = menu.address.lat != null && menu.address.lng != null
  const mapsEmbed =
    hasCoords && mapsKey
      ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(mapsKey)}&q=${menu.address.lat},${menu.address.lng}&zoom=15`
      : null
  const mapsLink = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${menu.address.lat},${menu.address.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${menu.address.line}, ${menu.address.city} - ${menu.address.state}`
      )}`

  return (
    <div className="pb-8 lg:pb-6">
      <div className="flex items-center gap-2 border-b px-2 py-2 lg:border-b-0 lg:px-6 lg:pt-6 lg:pb-2">
        <Button
          variant="ghost"
          size="icon-sm"
          render={<Link href={href(STORE_HOME_PATH)} />}
        >
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
            <div className="relative min-h-32 overflow-hidden rounded-2xl bg-muted lg:min-h-40 lg:rounded-3xl">
              {menu.bannerUrl ? (
                <Image
                  src={menu.bannerUrl}
                  alt=""
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 40rem"
                />
              ) : (
                <div className="flex size-full min-h-32 flex-col justify-center px-4 py-8 lg:min-h-40 lg:px-6">
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {menu.bannerTitle}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {menu.bannerSubtitle}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-start gap-3">
              <Avatar className="size-14 shrink-0 rounded-full border lg:size-16">
                {menu.logo ? (
                  <AvatarImage src={menu.logo} alt={menu.name} />
                ) : null}
                <AvatarFallback className="rounded-full text-sm font-semibold">
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

          {gallery.length > 0 ? (
            <>
              <SectionTitle>Galeria</SectionTitle>
              <div className="flex gap-2 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] lg:px-0 [&::-webkit-scrollbar]:hidden">
                {gallery.map((url) => (
                  <div
                    key={url}
                    className="relative size-28 shrink-0 overflow-hidden rounded-2xl bg-muted sm:size-32"
                  >
                    <Image
                      src={url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="128px"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </>
          ) : null}

          <SectionTitle>Horário de atendimento</SectionTitle>
          <ul className="px-4 lg:rounded-2xl lg:border lg:px-4">
            {menu.hours.map((h) => {
              const today = isTodayLabel(h.day)
              return (
                <li
                  key={h.day}
                  className={cn(
                    "flex justify-between gap-4 border-b border-border/60 py-3 text-sm last:border-b-0",
                    today && "rounded-xl bg-primary/8 px-2 lg:px-3"
                  )}
                >
                  <span className={cn(today && "font-semibold text-primary")}>
                    {h.day}
                    {today ? (
                      <span className="ml-2 text-[10px] font-semibold tracking-wide uppercase">
                        Hoje
                      </span>
                    ) : null}
                  </span>
                  <span
                    className={cn(
                      "text-muted-foreground",
                      today && "font-medium text-foreground"
                    )}
                  >
                    {h.hours}
                  </span>
                </li>
              )
            })}
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
            {mapsEmbed ? (
              <iframe
                title="Mapa da loja"
                src={mapsEmbed}
                className="h-48 w-full rounded-2xl border lg:h-56"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <a
                href={mapsLink}
                target="_blank"
                rel="noreferrer"
                className="flex h-48 items-center justify-center rounded-2xl border border-dashed bg-muted/50 text-sm text-primary underline-offset-4 hover:underline lg:h-56"
              >
                Abrir no Google Maps
              </a>
            )}
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
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  {method.id.includes("cash") ||
                  method.name.toLowerCase().includes("dinheiro") ? (
                    <Banknote className="size-4" />
                  ) : (
                    <CreditCard className="size-4" />
                  )}
                </span>
                <div>
                  <p className="text-sm font-medium">{method.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {method.kind === "online"
                      ? "Pagamento online"
                      : "Pagamento na entrega"}
                  </p>
                </div>
              </div>
            </div>
            {method.brands?.length ? (
              <div className="mt-2 flex flex-wrap gap-1.5 pl-11">
                {method.brands.map((brand) => (
                  <Badge
                    key={brand}
                    variant="outline"
                    className="rounded-md px-2 font-semibold tracking-wide"
                  >
                    {brandIconLabel(brand)}
                  </Badge>
                ))}
              </div>
            ) : method.id === "pix" ? (
              <div className="mt-2 flex flex-wrap gap-1.5 pl-11">
                <Badge
                  variant="outline"
                  className="rounded-md px-2 font-semibold tracking-wide"
                >
                  PIX
                </Badge>
              </div>
            ) : null}
            <Separator className="mt-3" />
          </li>
        ))}
      </ul>
    </div>
  )
}
