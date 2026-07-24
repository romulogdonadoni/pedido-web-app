"use client"

import {
  ArrowLeft,
  Banknote,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  MapPin,
  Share2,
  XIcon,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import * as React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
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
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null)
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

  async function shareStore() {
    const url = typeof window !== "undefined" ? window.location.href : ""
    const title = menu.name
    const text = `Confira ${menu.name} no cardápio digital`
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url })
        return
      }
      await navigator.clipboard.writeText(url)
    } catch {
      // user cancelled share — ignore
    }
  }

  return (
    <div className="pb-10 lg:pb-8">
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
          onClick={() => void shareStore()}
          aria-label="Compartilhar loja"
        >
          <Share2 className="size-4" />
        </Button>
      </div>

      <div className="space-y-8 px-0 pt-0 lg:px-6 lg:pt-2">
        {/* Hero */}
        <section className="px-4 lg:px-0">
          <div className="relative overflow-hidden rounded-2xl bg-muted lg:rounded-3xl">
            <div className="relative aspect-4/1 min-h-28 w-full sm:min-h-32">
              {menu.bannerUrl ? (
                <Image
                  src={menu.bannerUrl}
                  alt=""
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 56rem"
                  priority
                />
              ) : (
                <div className="flex size-full flex-col justify-end bg-linear-to-br from-muted to-muted-foreground/15 px-4 py-6 lg:px-6">
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {menu.bannerTitle}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {menu.bannerSubtitle}
                  </p>
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-background/80 via-transparent to-transparent" />
            </div>

            <div className="relative -mt-10 flex flex-col gap-4 px-4 pb-5 sm:-mt-12 sm:flex-row sm:items-end sm:gap-5 lg:px-6 lg:pb-6">
              <Avatar className="size-20 shrink-0 rounded-full border-4 border-background shadow-md sm:size-24">
                {menu.logo ? (
                  <AvatarImage src={menu.logo} alt={menu.name} />
                ) : null}
                <AvatarFallback className="rounded-full text-lg font-semibold">
                  {menu.name
                    .split(" ")
                    .slice(0, 2)
                    .map((p) => p[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 space-y-2 pb-1">
                <div>
                  <h2 className="text-2xl leading-tight font-semibold tracking-tight sm:text-3xl">
                    {menu.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {menu.categoryLabel}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {menu.isOpen ? (
                    <span className="inline-flex items-center rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                      Loja aberta
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background">
                      Loja offline
                    </span>
                  )}
                  <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    Pedido mín. {formatBrl(menu.minOrder)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery — Instagram-style */}
        {gallery.length > 0 ? (
          <section>
            <SectionTitle>
              Galeria
              <span className="ml-2 font-normal text-muted-foreground normal-case">
                {gallery.length} {gallery.length === 1 ? "foto" : "fotos"}
              </span>
            </SectionTitle>
            <div className="mt-3 grid grid-cols-3 gap-0.5 sm:gap-1 lg:gap-1.5">
              {gallery.map((url, index) => (
                <button
                  key={`${url}-${index}`}
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  className="group relative aspect-square overflow-hidden bg-muted focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label={`Abrir foto ${index + 1} de ${gallery.length}`}
                >
                  <Image
                    src={url}
                    alt=""
                    fill
                    className="object-cover transition duration-300 group-hover:scale-[1.03] group-active:scale-[0.98]"
                    sizes="(max-width: 640px) 33vw, (max-width: 1024px) 30vw, 18rem"
                    unoptimized
                  />
                  <span className="pointer-events-none absolute inset-0 bg-black/0 transition group-hover:bg-black/15" />
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <div className="grid gap-8 px-4 lg:grid-cols-2 lg:gap-10 lg:px-0">
          <section>
            <SectionTitle>Horário de atendimento</SectionTitle>
            <ul className="mt-3 overflow-hidden rounded-2xl border">
              {menu.hours.map((h) => {
                const today = isTodayLabel(h.day)
                return (
                  <li
                    key={h.day}
                    className={cn(
                      "flex justify-between gap-4 border-b border-border/60 px-4 py-3 text-sm last:border-b-0",
                      today && "bg-primary/8"
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
          </section>

          <div className="space-y-8">
            <section>
              <SectionTitle>Formas de pagamento</SectionTitle>
              <div className="mt-3 space-y-4 rounded-2xl border p-4">
                <PaymentList title="Online" methods={online} />
                <PaymentList title="Na entrega" methods={delivery} />
              </div>
            </section>

            <section>
              <SectionTitle>Endereço</SectionTitle>
              <div className="mt-3 space-y-3 rounded-2xl border p-4">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                  <p>
                    {menu.address.line}, {menu.address.city} -{" "}
                    {menu.address.state}, {menu.address.zip}
                  </p>
                </div>
                {mapsEmbed ? (
                  <iframe
                    title="Mapa da loja"
                    src={mapsEmbed}
                    className="h-52 w-full rounded-xl border lg:h-56"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <a
                    href={mapsLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-52 items-center justify-center rounded-xl border border-dashed bg-muted/50 text-sm font-medium text-primary underline-offset-4 hover:underline lg:h-56"
                  >
                    Abrir no Google Maps
                  </a>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      <GalleryLightbox
        urls={gallery}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onIndexChange={setLightboxIndex}
        storeName={menu.name}
      />
    </div>
  )
}

function GalleryLightbox({
  urls,
  index,
  onClose,
  onIndexChange,
  storeName,
}: {
  urls: string[]
  index: number | null
  onClose: () => void
  onIndexChange: (index: number) => void
  storeName: string
}) {
  const open = index != null && index >= 0 && index < urls.length
  const current = open ? urls[index]! : null

  React.useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        onIndexChange((index! - 1 + urls.length) % urls.length)
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        onIndexChange((index! + 1) % urls.length)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, index, urls.length, onIndexChange])

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="fixed inset-0 top-0 left-0 flex h-dvh max-h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 bg-black/95 p-0 shadow-none ring-0 sm:max-w-none dark:bg-black/95"
      >
        <DialogTitle className="sr-only">
          Galeria de {storeName}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Foto {(index ?? 0) + 1} de {urls.length}. Use as setas para navegar.
        </DialogDescription>

        <div className="flex items-center justify-between gap-3 px-3 py-3 text-white sm:px-5">
          <p className="text-sm font-medium tabular-nums">
            {(index ?? 0) + 1} / {urls.length}
          </p>
          <DialogClose
            aria-label="Fechar"
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-white hover:bg-white/10 hover:text-white"
              >
                <XIcon className="size-5" />
              </Button>
            }
          />
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-6 sm:px-16">
          {urls.length > 1 ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute left-1 z-10 size-10 rounded-full text-white hover:bg-white/15 hover:text-white sm:left-4"
              onClick={() =>
                onIndexChange((index! - 1 + urls.length) % urls.length)
              }
              aria-label="Foto anterior"
            >
              <ChevronLeft className="size-7" />
            </Button>
          ) : null}

          {current ? (
            <div className="relative flex h-full max-h-[min(80dvh,900px)] w-full max-w-5xl items-center justify-center">
              <img
                src={current}
                alt=""
                className="mx-auto max-h-full max-w-full object-contain"
              />
            </div>
          ) : null}

          {urls.length > 1 ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 z-10 size-10 rounded-full text-white hover:bg-white/15 hover:text-white sm:right-4"
              onClick={() => onIndexChange((index! + 1) % urls.length)}
              aria-label="Próxima foto"
            >
              <ChevronRight className="size-7" />
            </Button>
          ) : null}
        </div>

        {urls.length > 1 ? (
          <div className="flex justify-center gap-1.5 overflow-x-auto px-4 pb-5">
            {urls.map((url, i) => (
              <button
                key={`thumb-${url}-${i}`}
                type="button"
                onClick={() => onIndexChange(i)}
                className={cn(
                  "relative size-12 shrink-0 overflow-hidden rounded-md ring-offset-2 ring-offset-black transition sm:size-14",
                  i === index
                    ? "ring-2 ring-white"
                    : "opacity-55 hover:opacity-100"
                )}
                aria-label={`Ir para foto ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="56px"
                  unoptimized
                />
              </button>
            ))}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-4 lg:px-0">
      <span className="h-5 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
      <h2 className="text-base font-semibold tracking-tight text-primary uppercase lg:text-lg">
        {children}
      </h2>
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
        {methods.map((method, idx) => (
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
            {idx < methods.length - 1 ? <Separator className="mt-3" /> : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
