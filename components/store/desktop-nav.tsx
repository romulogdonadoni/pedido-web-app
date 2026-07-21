"use client"

import { ClipboardList, Home, Search, Store } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { CartTriggerButton } from "@/components/cart/cart-trigger-button"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Início", icon: Home },
  { href: "/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/busca", label: "Buscar", icon: Search },
  { href: "/perfil", label: "Loja", icon: Store },
] as const

export function DesktopNav({ storeName }: { storeName: string }) {
  const pathname = usePathname()

  return (
    <header className="mb-4 lg:grid lg:grid-cols-3 hidden items-center gap-4">
      <div className="col-span-1 min-w-0 flex-1 justify-start">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Cardápio digital
        </p>
        <h1 className="truncate text-xl font-semibold tracking-tight">
          {storeName}
        </h1>
      </div>

      <nav className="flex gap-1 rounded-2xl border bg-background p-1 shadow-sm mx-auto">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors",
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

      <div className="col-span-1 flex items-center justify-end gap-2">
        <ThemeToggle
          variant="outline"
          size="icon"
          className="rounded-full shadow-sm"
        />
        <CartTriggerButton className="shadow-sm" />
      </div>
    </header>
  )
}
