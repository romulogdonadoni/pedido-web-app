"use client"

import { SheetTrigger } from "@/components/ui/sheet"
import { useCart } from "@/lib/cart/cart-context"
import { useCartSheet } from "@/lib/cart/cart-sheet-context"
import { formatBrl } from "@/lib/menu/catalog"
import { cn } from "@/lib/utils"

/** Sticky “VER SACOLA” bar — reference-style pill with qty + total. */
export function CartSacolaBar({ className }: { className?: string }) {
  const { handle } = useCartSheet()
  const { qty, subtotal } = useCart()

  if (qty <= 0) return null

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-14 z-30 flex justify-center px-4 pb-3 lg:bottom-6 lg:justify-end lg:px-8",
        className
      )}
    >
      <SheetTrigger
        handle={handle}
        render={
          <button
            type="button"
            className="pointer-events-auto flex w-full max-w-lg items-center justify-between gap-3 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-lg transition-[transform,opacity] hover:opacity-95 active:scale-[0.99] lg:w-auto lg:min-w-80"
          />
        }
      >
        <span className="flex items-center gap-2.5 text-sm font-semibold tracking-wide uppercase">
          Ver sacola
          <span className="flex size-6 items-center justify-center rounded-full bg-primary-foreground text-xs font-bold text-primary tabular-nums">
            {qty}
          </span>
        </span>
        <span className="text-sm font-semibold tabular-nums">
          {formatBrl(subtotal)}
        </span>
      </SheetTrigger>
    </div>
  )
}
