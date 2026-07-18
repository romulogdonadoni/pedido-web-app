"use client"

import type { ComponentProps } from "react"
import { ShoppingBag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SheetTrigger } from "@/components/ui/sheet"
import { useCart } from "@/lib/cart/cart-context"
import { useCartSheet } from "@/lib/cart/cart-sheet-context"
import { formatBrl } from "@/lib/menu/catalog"
import { cn } from "@/lib/utils"

type CartTriggerButtonProps = {
  className?: string
  size?: ComponentProps<typeof Button>["size"]
  variant?: ComponentProps<typeof Button>["variant"]
  showLabel?: boolean
  showTotal?: boolean
  label?: string
}

/** Detached Base UI trigger — opens the cart Sheet via shared handle. */
export function CartTriggerButton({
  className,
  size = "default",
  variant = "default",
  showLabel = true,
  showTotal = true,
  label = "Carrinho",
}: CartTriggerButtonProps) {
  const { handle } = useCartSheet()
  const { qty, subtotal } = useCart()

  return (
    <SheetTrigger
      handle={handle}
      render={
        <Button
          type="button"
          size={size}
          variant={variant}
          className={cn("relative gap-2", className)}
        />
      }
    >
      <ShoppingBag className="size-4" />
      {showLabel ? <span>{label}</span> : <span className="sr-only">{label}</span>}
      {showTotal && qty > 0 ? (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs tabular-nums",
            variant === "default"
              ? "bg-primary-foreground/20"
              : "bg-foreground/10"
          )}
        >
          {qty} · {formatBrl(subtotal)}
        </span>
      ) : null}
      {!showLabel && qty > 0 ? (
        <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-medium text-primary-foreground">
          {qty}
        </span>
      ) : null}
    </SheetTrigger>
  )
}
