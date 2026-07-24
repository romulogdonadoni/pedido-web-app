"use client"

import { Minus, Plus } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart/cart-context"
import {
  simpleItemAddInput,
  simpleItemLineKey,
} from "@/lib/cart/simple-item"
import type { MenuItem } from "@/lib/menu/catalog"
import { cn } from "@/lib/utils"

export function ItemQtyStepper({
  item,
  storeOpen = true,
  size = "md",
  className,
}: {
  item: MenuItem
  storeOpen?: boolean
  size?: "sm" | "md"
  className?: string
}) {
  const { lines, addItem, setQty } = useCart()
  const key = simpleItemLineKey(item)
  const qty = lines.find((line) => line.key === key)?.qty ?? 0
  const compact = size === "sm"

  function increment(event: React.MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    if (!storeOpen) {
      toast.error("A loja está offline no momento.")
      return
    }
    addItem(simpleItemAddInput(item))
  }

  function decrement(event: React.MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    if (qty <= 0) return
    setQty(key, qty - 1)
  }

  if (qty <= 0) {
    return (
      <Button
        type="button"
        size={compact ? "icon-xs" : "icon-sm"}
        className={cn("rounded-full shadow-md", className)}
        aria-label={`Adicionar ${item.name}`}
        onClick={increment}
      >
        <Plus className={compact ? "size-3" : "size-3.5"} strokeWidth={2.5} />
      </Button>
    )
  }

  return (
    <div
      className={cn(
        "flex items-center rounded-full border border-border/80 bg-background shadow-md",
        compact ? "h-6 gap-0.5 px-0.5" : "h-8 gap-0.5 px-0.5",
        className
      )}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
      }}
    >
      <Button
        type="button"
        variant="ghost"
        size={compact ? "icon-xs" : "icon-sm"}
        className="rounded-full"
        aria-label={`Remover ${item.name}`}
        onClick={decrement}
      >
        <Minus className={compact ? "size-3" : "size-3.5"} strokeWidth={2.5} />
      </Button>
      <span
        className={cn(
          "min-w-5 text-center font-semibold tabular-nums",
          compact ? "text-[11px]" : "text-xs"
        )}
      >
        {qty}
      </span>
      <Button
        type="button"
        variant="ghost"
        size={compact ? "icon-xs" : "icon-sm"}
        className="rounded-full"
        aria-label={`Adicionar mais ${item.name}`}
        onClick={increment}
      >
        <Plus className={compact ? "size-3" : "size-3.5"} strokeWidth={2.5} />
      </Button>
    </div>
  )
}
