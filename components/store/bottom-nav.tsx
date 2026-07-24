"use client"

import { ClipboardList, Home } from "lucide-react"
import Link from "next/link"

import { useStoreNav } from "@/lib/store/nav-context"
import { STORE_HOME_PATH, isStoreHomePath } from "@/lib/tenant/host"
import { cn } from "@/lib/utils"

const items = [
  { href: STORE_HOME_PATH, label: "Início", icon: Home },
  { href: "/pedidos", label: "Pedidos", icon: ClipboardList },
] as const

export function BottomNav() {
  const { href: to, pathname } = useStoreNav()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur lg:hidden">
      <div className="mx-auto flex h-14 max-w-lg items-stretch">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === STORE_HOME_PATH
              ? isStoreHomePath(pathname)
              : pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={to(href)}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 text-xs transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-5" strokeWidth={active ? 2.25 : 1.75} />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
