"use client"

import { Minus, Plus, XIcon } from "lucide-react"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
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

export function ItemDetailSheet({
  menu,
  item,
  open,
  onOpenChange,
}: {
  menu: StoreMenu
  item: MenuItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { addItem } = useCart()
  const { openCart } = useCartSheet()
  const [displayItem, setDisplayItem] = React.useState(item)
  const [selected, setSelected] = React.useState<SelectedOption[]>([])
  const [note, setNote] = React.useState("")
  const [qty, setQty] = React.useState(1)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (item) setDisplayItem(item)
  }, [item])

  React.useEffect(() => {
    setSelected([])
    setNote("")
    setQty(1)
    setError(null)
  }, [displayItem?.id])

  const discount = displayItem
    ? discountPercent(displayItem.price, displayItem.compareAtPrice)
    : 0
  const extras = selected.reduce((sum, o) => sum + o.price, 0)
  const unit = (displayItem?.price ?? 0) + extras
  const groups = displayItem?.optionGroups ?? []
  const noteId = `sheet-item-note-${displayItem?.id ?? "closed"}`

  function onToggle(groupId: string, optionId: string) {
    setError(null)
    setSelected((prev) =>
      toggleOptionSelection(groups, prev, groupId, optionId)
    )
  }

  function onAdd() {
    if (!displayItem) return
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
      itemId: displayItem.id,
      name: displayItem.name,
      image: displayItem.image,
      basePrice: displayItem.price,
      selectedOptions: selected,
      note,
      qty,
    })
    onOpenChange(false)
    openCart()
  }

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={(isOpen) => {
        if (!isOpen) setDisplayItem(null)
      }}
    >
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="flex h-[92dvh] max-h-[92dvh] w-full flex-col gap-0 overflow-hidden rounded-t-3xl border-t p-0"
      >
        <SheetClose
          aria-label="Fechar"
          render={
            <Button
              variant="secondary"
              size="icon-sm"
              className="absolute top-3 right-3 z-20 size-9 rounded-full bg-background/90 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/75"
            >
              <XIcon className="size-4" />
            </Button>
          }
        />

        {displayItem ? (
          <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
            <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-muted">
              {displayItem.image ? (
                <Image
                  src={displayItem.image}
                  alt={displayItem.name}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority
                />
              ) : (
                <div className="flex size-full items-center justify-center text-5xl font-bold text-muted-foreground/35">
                  {displayItem.name[0]}
                </div>
              )}
              {displayItem.badge ? (
                <span className="absolute top-3 left-3 rounded-lg bg-foreground px-2.5 py-1 text-xs font-semibold text-background shadow-sm">
                  {displayItem.badge}
                </span>
              ) : null}
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <ScrollArea className="h-[30dvh] max-h-[30dvh] grow">
                <div className="h-full px-4 pt-4 pb-2">
                  <SheetHeader className="gap-2 p-0 pr-10 text-left">
                    <SheetTitle className="text-xl leading-snug font-semibold tracking-tight">
                      {displayItem.name}
                    </SheetTitle>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xl font-semibold text-primary tabular-nums">
                        {formatBrl(displayItem.price)}
                      </span>
                      {displayItem.compareAtPrice ? (
                        <span className="text-sm text-muted-foreground tabular-nums line-through">
                          {formatBrl(displayItem.compareAtPrice)}
                        </span>
                      ) : null}
                      {discount ? (
                        <Badge className="bg-primary/15 text-primary hover:bg-primary/15">
                          {discount}%
                        </Badge>
                      ) : null}
                      {displayItem.popular ? (
                        <Badge variant="secondary">Popular</Badge>
                      ) : null}
                    </div>
                    <SheetDescription className="text-sm leading-relaxed">
                      {displayItem.description}
                    </SheetDescription>
                  </SheetHeader>

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
                                  <span className="font-medium">
                                    {group.title}
                                  </span>
                                  <span className="text-xs font-normal text-muted-foreground">
                                    Escolha{" "}
                                    {group.min === group.max
                                      ? group.min
                                      : `até ${group.max}`}{" "}
                                    {group.min > 0
                                      ? "(obrigatório)"
                                      : "(opcional)"}{" "}
                                    · {count}/{group.max}
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
                </div>
              </ScrollArea>

              <div
                className={cn(
                  "shrink-0 border-t bg-popover/95 px-4 pt-3 backdrop-blur",
                  "pb-[max(0.75rem,env(safe-area-inset-bottom))]"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-0.5 rounded-full border bg-background p-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-10 rounded-full"
                      aria-label="Diminuir quantidade"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                    >
                      <Minus className="size-4" />
                    </Button>
                    <span className="w-8 text-center text-sm font-semibold tabular-nums">
                      {qty}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-10 rounded-full"
                      aria-label="Aumentar quantidade"
                      onClick={() => setQty((q) => q + 1)}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  <Button
                    type="button"
                    size="lg"
                    className="h-12 flex-1 rounded-full text-base"
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
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
