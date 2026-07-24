"use client"

import { Plus } from "lucide-react"
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

export function ItemCard({
  item,
  className,
  size = "md",
  storeOpen = true,
  onSelect,
}: {
  item: MenuItem
  className?: string
  size?: "md" | "lg"
  storeOpen?: boolean
  onSelect?: (item: MenuItem) => void
}) {
  const discount = discountPercent(item.price, item.compareAtPrice)
  const large = size === "lg"
  const needsCustomization = itemNeedsCustomization(item)
  const highlight = parseHighlightKind(item.highlightKind)

  const body = (
    <>
      <div
        className={cn(
          "relative z-0 shrink-0",
          large ? "size-[min(55vw,11rem)] sm:size-44" : "size-20"
        )}
      >
        <div className="absolute inset-0 overflow-hidden bg-muted">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-cover"
              sizes={large ? "(max-width: 640px) 55vw, 176px" : "80px"}
            />
          ) : (
            <div className="flex size-full items-center justify-center text-base font-semibold text-muted-foreground">
              {item.name[0]}
            </div>
          )}
        </div>

        <div
          className={cn(
            "absolute z-10 flex flex-col gap-1",
            large ? "top-2 left-2" : "top-1.5 left-1.5"
          )}
        >
          {highlight !== "none" ? (
            <ItemHighlightSeal
              highlightKind={item.highlightKind}
              size={large ? "md" : "sm"}
            />
          ) : item.badge || discount ? (
            <span
              className={cn(
                "rounded-md bg-foreground font-semibold tracking-wide text-background uppercase",
                large
                  ? "px-1.5 py-0.5 text-[9px]"
                  : "px-1 py-px text-[7px]"
              )}
            >
              {item.badge || `${discount}% off`}
            </span>
          ) : null}
        </div>

        {needsCustomization ? (
          <span
            className={cn(
              "absolute z-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md",
              large
                ? "right-2 bottom-2 size-7"
                : "right-1.5 bottom-1.5 size-5"
            )}
            aria-hidden
          >
            <Plus
              className={large ? "size-3.5" : "size-2.5"}
              strokeWidth={2.5}
            />
          </span>
        ) : (
          <div
            className={cn(
              "absolute z-10",
              large ? "right-2 bottom-2" : "right-1.5 bottom-1.5"
            )}
          >
            <ItemQtyStepper
              item={item}
              storeOpen={storeOpen}
              size={large ? "md" : "sm"}
            />
          </div>
        )}
      </div>

      <div
        className={cn(
          "relative z-3 flex w-full flex-col gap-0.5 p-1",
          large ? "w-[min(55vw,11rem)] gap-1 p-2 sm:w-44" : "w-20"
        )}
      >
        <h3
          className={cn(
            "line-clamp-2 font-semibold tracking-tight text-foreground",
            large
              ? "text-xs sm:text-sm"
              : "text-[9px] leading-tight sm:text-[10px]"
          )}
        >
          {item.name}
        </h3>
        {large && item.description ? (
          <p className="line-clamp-2 text-[11px] text-muted-foreground">
            {item.description}
          </p>
        ) : (
          <p className="truncate text-[7px] font-medium tracking-wide text-muted-foreground uppercase sm:text-[8px]">
            {item.category}
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-baseline gap-1 pt-0.5">
          <span
            className={cn(
              "font-semibold tabular-nums text-primary",
              large ? "text-xs sm:text-sm" : "text-[10px] sm:text-[11px]"
            )}
          >
            {formatBrl(item.price)}
          </span>
          {item.compareAtPrice ? (
            <span className="text-xs text-muted-foreground line-through tabular-nums">
              {formatBrl(item.compareAtPrice)}
            </span>
          ) : null}
          {discount && large ? (
            <Badge className="bg-primary/15 text-primary hover:bg-primary/15">
              -{discount}%
            </Badge>
          ) : null}
        </div>
      </div>
    </>
  )

  const shellClass = cn(
    "group flex w-fit shrink-0 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card text-left transition-colors hover:border-border hover:bg-muted/40",
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
