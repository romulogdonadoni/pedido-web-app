"use client"

import { Minus, Plus } from "lucide-react"
import Image from "next/image"
import * as React from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/lib/cart/cart-context"
import { useCartSheet } from "@/lib/cart/cart-sheet-context"
import type { SelectedOption } from "@/lib/cart/types"
import {
  discountPercent,
  formatBrl,
  type MenuItem,
  type StoreMenu,
} from "@/lib/menu/catalog"
import {
  countSelectedInGroup,
  toggleOptionSelection,
  validateOptionGroups,
} from "@/lib/menu/options"
import { cn } from "@/lib/utils"
import { ScrollArea } from "../ui/scroll-area"

export function ItemDetail({
  menu,
  item,
  onClose,
}: {
  menu: StoreMenu
  item: MenuItem
  onClose?: () => void
}) {
  const { addItem } = useCart()
  const { openCart } = useCartSheet()
  const [selected, setSelected] = React.useState<SelectedOption[]>([])
  const [note, setNote] = React.useState("")
  const [qty, setQty] = React.useState(1)
  const [error, setError] = React.useState<string | null>(null)

  const discount = discountPercent(item.price, item.compareAtPrice)
  const extras = selected.reduce((sum, o) => sum + o.price, 0)
  const unit = item.price + extras
  const groups = item.optionGroups ?? []
  const noteId = `item-note-${item.id}`

  function onToggle(groupId: string, optionId: string) {
    setError(null)
    setSelected((prev) =>
      toggleOptionSelection(groups, prev, groupId, optionId)
    )
  }

  function onAdd() {
    if (!menu.isOpen) {
      setError("A loja está offline no momento.")
      return
    }
    const validation = validateOptionGroups(groups, selected)
    if (validation) {
      setError(validation)
      return
    }
    addItem({
      itemId: item.id,
      name: item.name,
      image: item.image,
      basePrice: item.price,
      selectedOptions: selected,
      note,
      qty,
    })
    onClose?.()
    openCart()
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col sm:flex-row">
      {/* Image — fixed band on mobile; column on desktop */}
      <div
        className={cn(
          "relative shrink-0 overflow-hidden bg-muted",
          "h-[min(38dvh,16rem)] w-full",
          "sm:h-auto sm:min-h-0 sm:w-[42%] sm:self-stretch"
        )}
      >
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 420px"
            priority
          />
        ) : (
          <div className="flex size-full min-h-48 items-center justify-center text-5xl font-bold text-muted-foreground/35 sm:min-h-0">
            {item.name[0]}
          </div>
        )}
        {item.badge ? (
          <span className="absolute top-3 left-3 rounded-lg bg-foreground px-2.5 py-1 text-xs font-semibold text-background shadow-sm">
            {item.badge}
          </span>
        ) : null}
      </div>

      {/* Content + sticky CTA */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <ScrollArea className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-4 pb-2 sm:px-6 sm:pt-6 sm:pb-3">
          <DialogHeader className="gap-2 pr-10 sm:pr-12">
            <DialogTitle className="text-xl leading-snug font-semibold tracking-tight sm:text-2xl">
              {item.name}
            </DialogTitle>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xl font-semibold text-primary tabular-nums sm:text-2xl">
                {formatBrl(item.price)}
              </span>
              {item.compareAtPrice ? (
                <span className="text-sm text-muted-foreground tabular-nums line-through sm:text-base">
                  {formatBrl(item.compareAtPrice)}
                </span>
              ) : null}
              {discount ? (
                <Badge className="bg-primary/15 text-primary hover:bg-primary/15">
                  {discount}%
                </Badge>
              ) : null}
              {item.popular ? <Badge variant="secondary">Popular</Badge> : null}
            </div>
            <DialogDescription className="text-sm leading-relaxed sm:text-[0.9375rem]">
              {item.description}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 space-y-5">
            {groups.length > 0 ? (
              <Accordion
                multiple
                defaultValue={[groups[0]?.id].filter(Boolean)}
              >
                {groups.map((group) => {
                  const count = countSelectedInGroup(selected, group.id)
                  return (
                    <AccordionItem key={group.id} value={group.id}>
                      <AccordionTrigger className="py-3 text-left">
                        <span className="flex flex-col items-start gap-0.5">
                          <span className="font-medium">{group.title}</span>
                          <span className="text-xs font-normal text-muted-foreground">
                            Escolha{" "}
                            {group.min === group.max
                              ? group.min
                              : `até ${group.max}`}{" "}
                            {group.min > 0 ? "(obrigatório)" : "(opcional)"} ·{" "}
                            {count}/{group.max}
                          </span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2.5">
                          {group.options.map((option) => {
                            const checked = selected.some(
                              (s) =>
                                s.groupId === group.id &&
                                s.optionId === option.id
                            )
                            return (
                              <li key={option.id}>
                                <label
                                  className={cn(
                                    "flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border px-3.5 py-3 transition-colors",
                                    "active:bg-muted/60",
                                    checked
                                      ? "border-primary bg-primary/5"
                                      : "hover:bg-muted/40"
                                  )}
                                >
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={() =>
                                      onToggle(group.id, option.id)
                                    }
                                  />
                                  <span className="min-w-0 flex-1 text-sm font-medium">
                                    {option.name}
                                  </span>
                                  {option.price > 0 ? (
                                    <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
                                      + {formatBrl(option.price)}
                                    </span>
                                  ) : null}
                                </label>
                              </li>
                            )
                          })}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            ) : null}

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor={noteId}>
                Observação
              </label>
              <Textarea
                id={noteId}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ex.: sem cebola, ponto da carne..."
                rows={3}
                className="resize-none any-pointer-coarse:text-base"
              />
            </div>

            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        </ScrollArea>

        <div
          className={cn(
            "shrink-0 border-t bg-popover/95 px-4 pt-3 backdrop-blur",
            "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
            "sm:px-6 sm:pt-4 sm:pb-4"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5 rounded-full border bg-background p-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-10 rounded-full sm:size-9"
                aria-label="Diminuir quantidade"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Minus className="size-4" />
              </Button>
              <span className="w-8 text-center text-sm font-semibold tabular-nums sm:w-7">
                {qty}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-10 rounded-full sm:size-9"
                aria-label="Aumentar quantidade"
                onClick={() => setQty((q) => q + 1)}
              >
                <Plus className="size-4" />
              </Button>
            </div>
            <Button
              type="button"
              size="lg"
              className="h-12 flex-1 rounded-full text-base sm:h-11"
              disabled={!menu.isOpen}
              onClick={onAdd}
            >
              {menu.isOpen
                ? `Adicionar · ${formatBrl(unit * qty)}`
                : "Loja offline"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
