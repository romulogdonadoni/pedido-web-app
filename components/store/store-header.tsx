"use client"

import Image from "next/image"
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { StoreHour, StoreMenu } from "@/lib/menu/catalog"
import { useStoreNav } from "@/lib/store/nav-context"
import { STORE_HOME_PATH } from "@/lib/tenant/host"
import { cn } from "@/lib/utils"

function todayHoursHint(hours: StoreHour[]): string | null {
  if (!hours.length) return null
  const labels = [
    "domingo",
    "segunda",
    "terça",
    "terca",
    "quarta",
    "quinta",
    "sexta",
    "sábado",
    "sabado",
  ]
  const dayIndex = new Date().getDay()
  const want =
    dayIndex === 0
      ? ["domingo"]
      : dayIndex === 6
        ? ["sabado", "sábado"]
        : [labels[dayIndex]!]

  const row = hours.find((h) => {
    const d = h.day
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
    return want.some((a) =>
      d.includes(a.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
    )
  })
  return row?.hours?.trim() || null
}

export function StoreHeader({
  menu,
  onPromoClick,
}: {
  menu: StoreMenu
  onPromoClick?: () => void
}) {
  const initials = menu.name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase()

  const hoursHint = todayHoursHint(menu.hours)
  const statusLabel = menu.isOpen
    ? hoursHint
      ? `Aberto · ${hoursHint}`
      : "Aberto agora"
    : hoursHint
      ? `Fechado · ${hoursHint}`
      : "Fechado"

  const { href } = useStoreNav()
  const heroTitle = menu.bannerTitle || menu.name
  const heroSubtitle = menu.bannerSubtitle || menu.tagline

  return (
    <header className="space-y-4 px-4 pt-3 lg:px-6 lg:pt-5">
      <div className="flex items-center gap-3">
        <Link
          href={href(STORE_HOME_PATH)}
          className="flex min-w-0 flex-1 items-center gap-2.5"
        >
          <Avatar className="size-10 shrink-0 rounded-full border border-border shadow-sm lg:size-11">
            {menu.logo ? <AvatarImage src={menu.logo} alt={menu.name} /> : null}
            <AvatarFallback className="rounded-full text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold tracking-tight lg:text-base">
              {menu.name}
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              {menu.categoryLabel}
            </p>
          </div>
        </Link>

        <span
          className={cn(
            "hidden max-w-[12rem] truncate rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase sm:inline-flex",
            menu.isOpen
              ? "bg-success/15 text-success"
              : "bg-destructive/15 text-destructive"
          )}
          title={statusLabel}
        >
          {statusLabel}
        </span>
      </div>

      <span
        className={cn(
          "inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase sm:hidden",
          menu.isOpen
            ? "bg-success/15 text-success"
            : "bg-destructive/15 text-destructive"
        )}
      >
        {statusLabel}
      </span>

      <div className="relative min-h-44 overflow-hidden rounded-3xl bg-muted sm:min-h-52 lg:min-h-64">
        {menu.bannerUrl ? (
          <Image
            src={menu.bannerUrl}
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 80rem"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-linear-to-br from-primary via-primary to-foreground" />
            <div className="pointer-events-none absolute -top-10 -right-10 size-40 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-16 left-10 size-48 rounded-full bg-white/5 blur-3xl" />
          </>
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/25 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 space-y-3 p-4 sm:p-5 lg:p-6">
          {menu.bannerTitle ? (
            <p className="text-[10px] font-semibold tracking-[0.18em] text-white/80 uppercase">
              Destaque
            </p>
          ) : null}
          <div className="max-w-xl space-y-1">
            <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl lg:text-3xl">
              {heroTitle}
            </h2>
            {heroSubtitle ? (
              <p className="line-clamp-2 text-sm text-white/85 sm:text-base">
                {heroSubtitle}
              </p>
            ) : null}
          </div>
          {onPromoClick ? (
            <Button
              type="button"
              size="sm"
              className="rounded-full"
              onClick={onPromoClick}
            >
              Ver promoções
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  )
}
