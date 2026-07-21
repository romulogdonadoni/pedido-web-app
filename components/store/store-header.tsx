"use client"

import { Search, Share2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { CartTriggerButton } from "@/components/cart/cart-trigger-button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatBrl, type StoreMenu } from "@/lib/menu/catalog"

export function StoreHeader({ menu }: { menu: StoreMenu }) {
  async function share() {
    const url = window.location.origin
    if (navigator.share) {
      await navigator.share({ title: menu.name, url }).catch(() => undefined)
      return
    }
    await navigator.clipboard.writeText(url).catch(() => undefined)
  }

  const initials = menu.name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase()

  return (
    <header className="space-y-4 px-4 pt-4 lg:px-0 lg:pt-0">
      {/* Banner — image only, no text overlay */}
      <div className="relative min-h-32 overflow-hidden rounded-t-3xl bg-muted lg:min-h-48">
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
      </div>

      <div className="flex items-start gap-3 lg:gap-4 lg:px-6 lg:pb-6">
        <Avatar className="-mt-10 size-14 rounded-full border-2 border-background shadow-md lg:-mt-12 lg:size-16">
          {menu.logo ? <AvatarImage src={menu.logo} alt={menu.name} /> : null}
          <AvatarFallback className="rounded-full text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-base font-semibold tracking-tight lg:text-lg">
              {menu.name}
            </h1>
            {menu.bannerTitle ? (
              <Badge variant="secondary" className="font-normal">
                {menu.bannerTitle}
              </Badge>
            ) : null}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {menu.categoryLabel}
          </p>
          {menu.bannerSubtitle || menu.tagline ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {menu.bannerSubtitle || menu.tagline}
            </p>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground lg:text-sm">
            <span>Pedido mín. {formatBrl(menu.minOrder)}</span>
            <Link
              href="/perfil"
              className="font-medium text-primary hover:underline"
            >
              Perfil da loja
            </Link>
            {menu.isOpen ? (
              <Badge variant="secondary" className="text-success">
                Aberta agora
              </Badge>
            ) : (
              <Badge variant="outline">Offline</Badge>
            )}
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <Button variant="outline" size="sm" render={<Link href="/busca" />}>
            <Search className="size-4" />
            Buscar
          </Button>
          <CartTriggerButton
            variant="outline"
            size="sm"
            label="Pedido"
            showTotal={false}
          />
        </div>

        <div className="flex shrink-0 items-center gap-1.5 lg:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon-sm"
            render={<Link href="/busca" />}
          >
            <Search className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={share}>
            <Share2 className="size-4" />
          </Button>
          <CartTriggerButton
            variant="ghost"
            size="icon-sm"
            showLabel={false}
            showTotal={false}
          />
        </div>
      </div>
    </header>
  )
}
