"use client"

import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps"
import {
  Beef,
  Bike,
  Coffee,
  Fish,
  Flame,
  IceCream2,
  MapPin,
  Pizza,
  Salad,
  Search,
  ShoppingBasket,
  Sparkles,
  Star,
  Store,
  UtensilsCrossed,
  X,
} from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"

import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { fetchStores, type StoreDirectoryItem } from "@/lib/api/stores"
import { cn } from "@/lib/utils"

const DEFAULT_CENTER = { lat: -23.5505, lng: -46.6333 }

type CategoryId =
  | "all"
  | "burger"
  | "pizza"
  | "japanese"
  | "cafe"
  | "dessert"
  | "grill"
  | "healthy"
  | "market"

const CATEGORIES: {
  id: CategoryId
  label: string
  Icon: typeof Pizza
  keywords: string[]
}[] = [
  {
    id: "all",
    label: "Tudo",
    Icon: UtensilsCrossed,
    keywords: [],
  },
  {
    id: "burger",
    label: "Hambúrguer",
    Icon: Beef,
    keywords: ["burger", "hambur", "lanche", "cowboy"],
  },
  {
    id: "pizza",
    label: "Pizza",
    Icon: Pizza,
    keywords: ["pizza", "pizzaria"],
  },
  {
    id: "japanese",
    label: "Japonesa",
    Icon: Fish,
    keywords: ["japa", "sushi", "temaki", "oriental"],
  },
  {
    id: "cafe",
    label: "Cafés",
    Icon: Coffee,
    keywords: ["cafe", "café", "coffee", "aurora"],
  },
  {
    id: "dessert",
    label: "Doces",
    Icon: IceCream2,
    keywords: ["sorvete", "doce", "acai", "açaí", "confeitaria"],
  },
  {
    id: "grill",
    label: "Churrasco",
    Icon: Flame,
    keywords: ["churras", "grill", "carne", "steak"],
  },
  {
    id: "healthy",
    label: "Saudável",
    Icon: Salad,
    keywords: ["saudavel", "saudável", "fit", "salad"],
  },
  {
    id: "market",
    label: "Mercado",
    Icon: ShoppingBasket,
    keywords: ["mercado", "market", "pet", "farmac", "adega", "bom preco"],
  },
]

type StoreExtras = {
  category: string
  rating: number
  reviews: number
  etaMin: number
  etaMax: number
  deliveryFee: number
  freeDelivery: boolean
}

function hashStr(value: string) {
  let h = 0
  for (let i = 0; i < value.length; i++) {
    h = (Math.imul(31, h) + value.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

/** Demo metadata until the API exposes ratings / fees / cuisine. */
function storeExtras(store: StoreDirectoryItem): StoreExtras {
  const h = hashStr(store.identifier)
  const matched = CATEGORIES.find(
    (c) =>
      c.id !== "all" &&
      c.keywords.some((k) => store.name.toLowerCase().includes(k))
  )
  const fallbackCategories = [
    "Restaurante",
    "Hambúrguer",
    "Pizza",
    "Café",
    "Mercado",
    "Bebidas",
  ]
  return {
    category:
      matched?.label ?? fallbackCategories[h % fallbackCategories.length],
    rating: Number((4 + (h % 10) / 10).toFixed(1)),
    reviews: 48 + (h % 920),
    etaMin: 20 + (h % 15),
    etaMax: 35 + (h % 20),
    deliveryFee: h % 3 === 0 ? 0 : Number((4.9 + (h % 7)).toFixed(2)),
    freeDelivery: h % 3 === 0,
  }
}

function formatDistance(km: number | null) {
  if (km == null) return null
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1).replace(".", ",")} km`
}

function formatFee(fee: number) {
  if (fee <= 0) return "Entrega grátis"
  return `Entrega R$ ${fee.toFixed(2).replace(".", ",")}`
}

function matchesCategory(store: StoreDirectoryItem, category: CategoryId) {
  if (category === "all") return true
  const cat = CATEGORIES.find((c) => c.id === category)
  if (!cat) return true
  const name = store.name.toLowerCase()
  if (cat.keywords.some((k) => name.includes(k))) return true
  // Soft match via derived extras so chips still feel useful with few stores.
  return storeExtras(store).category === cat.label
}

function StoreCard({
  store,
  selected,
  onSelect,
}: {
  store: StoreDirectoryItem
  selected: boolean
  onSelect: () => void
}) {
  const extras = storeExtras(store)
  const distance = formatDistance(store.distanceKm)
  const image = store.logoUrl || store.bannerUrl
  const initials = store.name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase()

  return (
    <Card
      size="sm"
      className={cn(
        "py-0 shadow-none transition-all duration-200",
        selected
          ? "ring-primary/40"
          : "hover:ring-foreground/15"
      )}
    >
      <CardContent className="p-0">
        <Link
          href={`/${store.identifier}`}
          onMouseEnter={onSelect}
          onFocus={onSelect}
          className="flex items-center gap-3.5 px-4 py-3.5 text-left"
        >
          <Avatar className="size-16 shrink-0 transition-transform duration-200 group-hover/card:scale-105 sm:size-18">
            {image ? <AvatarImage src={image} alt={store.name} /> : null}
            <AvatarFallback className="text-sm font-semibold">
              {initials || <Store className="size-5" />}
            </AvatarFallback>
          </Avatar>

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-start gap-2">
              <CardTitle className="line-clamp-1 min-w-0 flex-1 font-semibold">
                {store.name}
              </CardTitle>
              <Badge
                variant={store.isOpen ? "secondary" : "destructive"}
                className="uppercase"
              >
                {store.isOpen ? "Aberto" : "Fechado"}
              </Badge>
            </div>

            <CardDescription className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="inline-flex items-center gap-1 font-medium text-foreground">
                <Star className="size-3.5 fill-primary text-primary" />
                {extras.rating.toFixed(1)}
                <span className="font-normal text-muted-foreground">
                  ({extras.reviews})
                </span>
              </span>
              <span aria-hidden>·</span>
              <span>{extras.category}</span>
            </CardDescription>

            <CardDescription className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              {distance ? <span>{distance}</span> : null}
              {distance ? <span aria-hidden>·</span> : null}
              <span>
                {extras.etaMin}–{extras.etaMax} min
              </span>
              <span aria-hidden>·</span>
              <span
                className={cn(
                  extras.freeDelivery && "font-medium text-foreground"
                )}
              >
                {formatFee(extras.deliveryFee)}
              </span>
            </CardDescription>
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}

export function MarketplaceHome() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? ""
  const [q, setQ] = useState("")
  const [openOnly, setOpenOnly] = useState(false)
  const [freeDeliveryOnly, setFreeDeliveryOnly] = useState(false)
  const [ratingPlus, setRatingPlus] = useState(false)
  const [radiusKm, setRadiusKm] = useState<number | null>(15)
  const [category, setCategory] = useState<CategoryId>("all")
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(
    null
  )
  const [geoError, setGeoError] = useState<string | null>(null)
  const [geoLoading, setGeoLoading] = useState(false)
  const [stores, setStores] = useState<StoreDirectoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showMap, setShowMap] = useState(false)

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocalização indisponível neste dispositivo.")
      return
    }
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigin({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
        setGeoError(null)
        setGeoLoading(false)
      },
      () => {
        setGeoError("Não foi possível obter sua localização.")
        setGeoLoading(false)
      },
      { enableHighAccuracy: false, timeout: 10000 }
    )
  }, [])

  useEffect(() => {
    requestLocation()
  }, [requestLocation])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await fetchStores({
        q: q.trim() || undefined,
        openOnly,
        lat: origin?.lat,
        lng: origin?.lng,
        radiusKm: origin && radiusKm != null ? radiusKm : undefined,
        take: 80,
      })
      setStores(list)
      setSelectedId((prev) =>
        prev && list.some((s) => s.identifier === prev) ? prev : null
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar lojas.")
      setStores([])
    } finally {
      setLoading(false)
    }
  }, [q, openOnly, origin, radiusKm])

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void load()
    }, 250)
    return () => window.clearTimeout(handle)
  }, [load])

  const visibleStores = useMemo(() => {
    return stores.filter((store) => {
      if (!matchesCategory(store, category)) return false
      const extras = storeExtras(store)
      if (freeDeliveryOnly && !extras.freeDelivery) return false
      if (ratingPlus && extras.rating < 4.5) return false
      return true
    })
  }, [stores, category, freeDeliveryOnly, ratingPlus])

  const mapCenter = useMemo(() => {
    if (selectedId) {
      const selected = stores.find((s) => s.identifier === selectedId)
      if (selected?.lat != null && selected.lng != null) {
        return { lat: selected.lat, lng: selected.lng }
      }
    }
    return origin ?? DEFAULT_CENTER
  }, [origin, selectedId, stores])

  const storesWithCoords = stores.filter((s) => s.lat != null && s.lng != null)

  const locationLabel = origin
    ? "Sua localização atual"
    : geoError
      ? "Definir localização"
      : "Onde entregar?"

  return (
    <ScrollArea className="h-0 min-h-svh bg-background">
      <div className="relative min-h-svh">
        {/* Soft atmosphere — not flat white */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(ellipse_at_top,_oklch(0.95_0.04_25)_0%,_transparent_65%)] dark:bg-[radial-gradient(ellipse_at_top,_oklch(0.28_0.04_25)_0%,_transparent_65%)]"
          aria-hidden
        />

        <div className="relative mx-auto w-full max-w-6xl px-4 pt-4 pb-28 sm:px-6 lg:pt-6 lg:pb-16">
          {/* Header */}
          <header className="mb-6 flex items-center gap-3 lg:mb-8">
            <Link href="/" className="min-w-0 shrink-0">
              <p className="text-xl font-semibold tracking-tight sm:text-2xl">
                Pedido
              </p>
            </Link>

            <button
              type="button"
              onClick={requestLocation}
              className="ml-1 flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-border/70 bg-background/80 px-3 py-2 text-left backdrop-blur transition-colors hover:bg-muted/60 sm:max-w-xs sm:flex-none"
            >
              <MapPin className="size-4 shrink-0 text-primary" />
              <span className="min-w-0">
                <span className="block text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                  Entregar em
                </span>
                <span className="block truncate text-sm font-medium">
                  {geoLoading ? "Localizando…" : locationLabel}
                </span>
              </span>
            </button>

            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle
                variant="outline"
                size="icon"
                className="rounded-xl"
              />
            </div>
          </header>

          {/* Hero */}
          <section className="mb-8 space-y-5 lg:mb-10 lg:space-y-6">
            <div className="max-w-2xl space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
                Peça o que você quiser
              </h1>
              <p className="max-w-lg text-base text-pretty text-muted-foreground sm:text-lg">
                Restaurantes, mercados e muito mais perto de você.
              </p>
            </div>

            <div className="relative max-w-2xl">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar restaurante, mercado ou cidade…"
                className="h-14 rounded-2xl border-border/70 bg-background pl-12 text-base shadow-sm"
              />
            </div>

            {geoError ? (
              <p className="text-sm text-muted-foreground">
                {geoError} Toque em “Entregar em” para tentar de novo, ou busque
                por cidade.
              </p>
            ) : null}
          </section>

          {/* Categories — fixed size tiles; no translate (overflow would clip) */}
          <section className="mb-8 lg:mb-10">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {CATEGORIES.map(({ id, label, Icon }) => {
                const active = category === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setCategory(id)}
                    className={cn(
                      "flex h-22 w-24 shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl border transition-colors duration-200",
                      active
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border/70 bg-background hover:border-border hover:bg-muted/50"
                    )}
                  >
                    <Icon className="size-5 shrink-0" />
                    <span className="max-w-full px-1 text-center text-[11px] leading-tight font-medium">
                      {label}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Promo */}
          <section className="mb-8 lg:mb-10">
            <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-7 text-primary-foreground sm:px-8 sm:py-8">
              <div
                className="pointer-events-none absolute -top-10 -right-8 size-48 rounded-full bg-white/10"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute right-16 -bottom-16 size-56 rounded-full bg-black/10"
                aria-hidden
              />
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold tracking-[0.2em] uppercase opacity-80">
                    Bem-vindo
                  </p>
                  <p className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    20% off no primeiro pedido
                  </p>
                  <p className="max-w-md text-sm opacity-90">
                    Escolha uma loja perto de você e aproveite o desconto na
                    primeira compra.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="shrink-0 rounded-2xl"
                  onClick={() => {
                    document
                      .getElementById("lojas")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }}
                >
                  <Sparkles className="size-4" />
                  Peça agora
                </Button>
              </div>
            </div>
          </section>

          {/* Filters + list */}
          <section id="lojas" className="scroll-mt-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Lojas perto de você
              </h2>
              <p className="text-sm text-muted-foreground">
                {loading
                  ? "Carregando…"
                  : `${visibleStores.length} ${visibleStores.length === 1 ? "loja" : "lojas"}`}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant={openOnly ? "default" : "outline"}
                onClick={() => setOpenOnly((v) => !v)}
              >
                Aberto
              </Button>
              <Button
                type="button"
                size="sm"
                variant={freeDeliveryOnly ? "default" : "outline"}
                onClick={() => setFreeDeliveryOnly((v) => !v)}
              >
                <Bike className="size-3.5" />
                Entrega grátis
              </Button>
              <Button
                type="button"
                size="sm"
                variant={ratingPlus ? "default" : "outline"}
                onClick={() => setRatingPlus((v) => !v)}
              >
                <Star className="size-3.5" />
                Avaliação 4.5+
              </Button>
              {([5, 15, 30] as const).map((km) => (
                <Button
                  key={km}
                  type="button"
                  size="sm"
                  variant={radiusKm === km ? "default" : "outline"}
                  disabled={!origin}
                  onClick={() =>
                    setRadiusKm((prev) => (prev === km ? null : km))
                  }
                >
                  Até {km} km
                </Button>
              ))}
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[5.5rem] animate-pulse rounded-2xl bg-muted"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="space-y-3 rounded-2xl border border-border/70 px-4 py-10 text-center">
                <p className="text-sm text-destructive">{error}</p>
                <Button size="sm" onClick={() => void load()}>
                  Tentar de novo
                </Button>
              </div>
            ) : visibleStores.length === 0 ? (
              <div className="rounded-2xl border border-border/70 bg-muted/40 px-4 py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhuma loja encontrada com esses filtros.
                </p>
              </div>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
                {visibleStores.map((store) => (
                  <li key={store.identifier}>
                    <StoreCard
                      store={store}
                      selected={selectedId === store.identifier}
                      onSelect={() => setSelectedId(store.identifier)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Single map entry point */}
        <Button
          type="button"
          variant="outline"
          className="fixed right-4 bottom-4 z-40 rounded-2xl shadow-lg sm:right-6 sm:bottom-6"
          onClick={() => setShowMap(true)}
        >
          <MapPin className="size-4 text-primary" />
          Ver mapa
        </Button>

        {/* Map overlay */}
        {showMap ? (
          <div className="fixed inset-0 z-50 flex flex-col bg-background/80 backdrop-blur-sm">
            <div className="mx-auto flex h-full w-full max-w-5xl flex-col p-4 sm:p-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Mapa das lojas</p>
                  <p className="text-xs text-muted-foreground">
                    Toque em um pin para destacar
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-xl"
                  onClick={() => setShowMap(false)}
                >
                  <X className="size-4" />
                  <span className="sr-only">Fechar mapa</span>
                </Button>
              </div>
              <div className="min-h-0 flex-1 overflow-hidden rounded-3xl border border-border bg-muted/30 shadow-lg">
                {apiKey ? (
                  <APIProvider apiKey={apiKey} language="pt-BR" region="BR">
                    <Map
                      key={
                        origin
                          ? `o-${origin.lat.toFixed(3)}-${origin.lng.toFixed(3)}`
                          : "default"
                      }
                      defaultCenter={mapCenter}
                      defaultZoom={origin ? 13 : 11}
                      gestureHandling="greedy"
                      className="size-full min-h-[70svh]"
                      colorScheme="LIGHT"
                    >
                      {origin ? (
                        <Marker position={origin} title="Você" />
                      ) : null}
                      {storesWithCoords.map((store) => (
                        <Marker
                          key={store.identifier}
                          position={{ lat: store.lat!, lng: store.lng! }}
                          title={store.name}
                          onClick={() => setSelectedId(store.identifier)}
                        />
                      ))}
                    </Map>
                  </APIProvider>
                ) : (
                  <div className="flex size-full min-h-[70svh] flex-col items-center justify-center gap-2 px-6 text-center">
                    <MapPin className="size-6 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Mapa indisponível sem chave do Google Maps.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </ScrollArea>
  )
}
