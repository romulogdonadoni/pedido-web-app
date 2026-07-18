"use client"

import Image from "next/image"

import { Badge } from "@/components/ui/badge"
import {
  discountPercent,
  formatBrl,
  type MenuItem,
} from "@/lib/menu/catalog"
import { cn } from "@/lib/utils"

export function ItemRow({
  item,
  className,
  onSelect,
}: {
  item: MenuItem
  className?: string
  onSelect?: (item: MenuItem) => void
}) {
  const discount = discountPercent(item.price, item.compareAtPrice)

  return (
    <button
      type="button"
      onClick={() => onSelect?.(item)}
      className={cn(
        "group flex w-full gap-3 rounded-2xl border border-border/70 bg-card p-3 text-left transition-colors hover:border-border hover:bg-muted/40",
        className
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-medium text-foreground">{item.name}</h3>
          {item.popular ? <Badge variant="secondary">Popular</Badge> : null}
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {item.description}
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-sm font-semibold tabular-nums text-primary">
            {formatBrl(item.price)}
          </span>
          {item.compareAtPrice ? (
            <span className="text-xs text-muted-foreground line-through tabular-nums">
              {formatBrl(item.compareAtPrice)}
            </span>
          ) : null}
          {discount ? (
            <Badge className="bg-primary/15 text-primary hover:bg-primary/15">
              {discount}%
            </Badge>
          ) : null}
        </div>
      </div>
      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted md:size-24">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 80px, 96px"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-lg font-semibold text-muted-foreground">
            {item.name[0]}
          </div>
        )}
        {item.badge ? (
          <span className="absolute top-1 left-1 rounded-md bg-foreground px-1.5 py-0.5 text-[10px] font-semibold text-background">
            {item.badge}
          </span>
        ) : null}
      </div>
    </button>
  )
}
