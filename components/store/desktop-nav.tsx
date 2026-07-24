"use client"

import { ClipboardList, Home, Search, Store } from "lucide-react"
import Link from "next/link"

import { CartTriggerButton } from "@/components/cart/cart-trigger-button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useStoreNav } from "@/lib/store/nav-context"
import { STORE_HOME_PATH, isStoreHomePath } from "@/lib/tenant/host"
import { cn } from "@/lib/utils"

const links = [
  { href: STORE_HOME_PATH, label: "Início", icon: Home },
  { href: "/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/busca", label: "Buscar", icon: Search },
  { href: "/perfil", label: "Loja", icon: Store },
] as const

export function DesktopNav({ storeName }: { storeName: string }) {
  const { href: to, pathname } = useStoreNav()
  const onHome = isStoreHomePath(pathname)

  return (
    <header
      className={cn(
        "mb-4 hidden items-center gap-4 lg:grid lg:grid-cols-[1fr_auto_1fr]"
      )}
    >
      <div className="min-w-0">
        {!onHome ? (
          <h1 className="truncate text-xl font-semibold tracking-tight">
            {storeName}
          </h1>
        ) : null}
      </div>

      <nav className="mx-auto flex gap-1 rounded-full border bg-background p-1 shadow-sm">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === STORE_HOME_PATH
              ? onHome
              : pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={to(href)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="flex items-center justify-end gap-2">
        <ThemeToggle
          variant="outline"
          size="icon"
          className="rounded-full shadow-sm"
        />
        {!onHome ? (
          <CartTriggerButton className="rounded-full shadow-sm" />
        ) : null}
      </div>
    </header>
  )
}
