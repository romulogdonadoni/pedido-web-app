"use client"

import Image from "next/image"

import { ItemHighlightSeal } from "@/components/store/item-highlight-seal"
import { ItemQtyStepper } from "@/components/store/item-qty-stepper"
import { Badge } from "@/components/ui/badge"
import {
  discountPercent,
  formatBrl,
  type MenuItem,
} from "@/lib/menu/catalog"
import { parseHighlightKind } from "@/lib/menu/highlights"
import { itemNeedsCustomization } from "@/lib/menu/options"
import { cn } from "@/lib/utils"

export function ItemRow({
  item,
  className,
  storeOpen = true,
  onSelect,
}: {
  item: MenuItem
  className?: string
  storeOpen?: boolean
  onSelect?: (item: MenuItem) => void
}) {
  const discount = discountPercent(item.price, item.compareAtPrice)
  const needsCustomization = itemNeedsCustomization(item)
  const highlight = parseHighlightKind(item.highlightKind)

  const body = (
    <>
      <div className="relative z-0 size-28 shrink-0 bg-muted sm:size-32">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 112px, 128px"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-lg font-semibold text-muted-foreground">
            {item.name[0]}
          </div>
        )}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {highlight !== "none" ? (
            <ItemHighlightSeal highlightKind={item.highlightKind} />
          ) : item.badge ? (
            <span className="rounded-md bg-foreground px-1.5 py-0.5 text-[10px] font-semibold text-background">
              {item.badge}
            </span>
          ) : null}
        </div>
      </div>

      <div className="relative z-3 flex min-w-0 flex-1 flex-col justify-center gap-1 overflow-hidden px-3.5 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="line-clamp-1 font-semibold tracking-tight text-foreground">
            {item.name}
          </h3>
          {item.popular ? <Badge variant="secondary">Popular</Badge> : null}
        </div>
        {item.description ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {item.description}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
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
              -{discount}%
            </Badge>
          ) : null}
        </div>
      </div>

      {!needsCustomization ? (
        <div className="flex shrink-0 items-center pr-3">
          <ItemQtyStepper item={item} storeOpen={storeOpen} size="md" />
        </div>
      ) : null}
    </>
  )

  const shellClass = cn(
    "group flex h-28 w-full overflow-hidden rounded-2xl border border-border/70 bg-card text-left transition-colors hover:border-border hover:bg-muted/40 sm:h-32",
    item.popular && "popular-shine border-primary/35",
    className
  )

  if (needsCustomization) {
    return (
      <button
        type="button"
        onClick={() => onSelect?.(item)}
        className={shellClass}
      >
        {body}
      </button>
    )
  }

  return <div className={shellClass}>{body}</div>
}
