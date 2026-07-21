"use client"

import { Minus, Plus, XIcon } from "lucide-react"
import Image from "next/image"
import * as React from "react"

import { ItemOptionsSections } from "@/components/store/item-options-sections"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import type { SelectedOption, SlotSelection } from "@/lib/cart/types"
import {
  defaultSlotSelections,
  discountPercent,
  formatBrl,
  slotSelectionsExtraTotal,
  type MenuItem,
  type StoreMenu,
} from "@/lib/menu/catalog"
import {
  pruneOptionsForSlotSelections,
  toggleOptionSelection,
  toggleSlotSelection,
  validateOptionGroups,
  validateProductGroupOptions,
  validateProductGroupSlotOptions,
  validateProductGroupSlots,
} from "@/lib/menu/options"
import { cn } from "@/lib/utils"
import { Label } from "../ui/label"

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
  const [displayItem, setDisplayItem] = React.useState(item)
  const [selected, setSelected] = React.useState<SelectedOption[]>([])
  const [slotSelections, setSlotSelections] = React.useState<SlotSelection[]>(
    []
  )
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
    setSlotSelections(
      defaultSlotSelections(displayItem?.productGroupSlots)
    )
  }, [displayItem?.id])

  const discount = displayItem
    ? discountPercent(displayItem.price, displayItem.compareAtPrice)
    : 0
  const optionExtras = selected.reduce((sum, o) => sum + o.price, 0)
  const slotExtras = slotSelectionsExtraTotal(
    displayItem?.productGroupSlots,
    slotSelections
  )
  const unit = (displayItem?.price ?? 0) + optionExtras + slotExtras
  const groups = displayItem?.optionGroups ?? []
  const isProductGroup = displayItem?.kind === "productGroup"
  const noteId = `sheet-item-note-${displayItem?.id ?? "closed"}`

  function findOptionGroups(productId?: string) {
    if (!displayItem || !productId) return groups
    const fixed = displayItem.productGroupItems?.find(
      (p) => p.productId === productId
    )
    if (fixed) return fixed.optionGroups ?? []
    for (const slot of displayItem.productGroupSlots ?? []) {
      const product = slot.products.find((p) => p.productId === productId)
      if (product) return product.optionGroups ?? []
    }
    return []
  }

  function onToggle(
    groupId: string,
    optionId: string,
    productId?: string,
    namePrefix?: string
  ) {
    if (!displayItem) return
    setError(null)
    const targetGroups = findOptionGroups(productId)
    setSelected((prev) =>
      toggleOptionSelection(
        targetGroups,
        prev,
        groupId,
        optionId,
        productId,
        namePrefix
      )
    )
  }

  function onSlotToggle(slotId: string, productId: string) {
    if (!displayItem) return
    setError(null)
    const slots = displayItem.productGroupSlots ?? []
    const nextSlots = toggleSlotSelection(
      slots,
      slotSelections,
      slotId,
      productId
    )
    const fixedIds = new Set(
      (displayItem.productGroupItems ?? []).map((i) => i.productId)
    )
    setSlotSelections(nextSlots)
    setSelected((prev) =>
      pruneOptionsForSlotSelections(prev, fixedIds, nextSlots)
    )
  }

  function onAdd() {
    if (!displayItem) return
    if (!menu.isOpen) {
      setError("A loja está offline no momento.")
      return
    }

    if (isProductGroup) {
      const slotErr = validateProductGroupSlots(
        displayItem.productGroupSlots,
        slotSelections
      )
      if (slotErr) {
        setError(slotErr)
        return
      }
      const itemsErr = validateProductGroupOptions(
        displayItem.productGroupItems,
        selected
      )
      if (itemsErr) {
        setError(itemsErr)
        return
      }
      const slotOptErr = validateProductGroupSlotOptions(
        displayItem.productGroupSlots,
        slotSelections,
        selected
      )
      if (slotOptErr) {
        setError(slotOptErr)
        return
      }
    } else {
      const validation = validateOptionGroups(groups, selected)
      if (validation) {
        setError(validation)
        return
      }
    }

    addItem({
      itemId: displayItem.id,
      name: displayItem.name,
      image: displayItem.image,
      basePrice: displayItem.price + slotExtras,
      selectedOptions: selected,
      note,
      qty,
      productGroupId: isProductGroup ? displayItem.id : undefined,
      slotSelections: isProductGroup ? slotSelections : undefined,
      fixedItems: isProductGroup
        ? (displayItem.productGroupItems ?? []).map((i) => ({
            productId: i.productId,
            name: i.name,
            quantity: i.quantity,
          }))
        : undefined,
    })
    onOpenChange(false)
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
                    <ItemOptionsSections
                      item={displayItem}
                      selected={selected}
                      onToggle={onToggle}
                      slotSelections={slotSelections}
                      onSlotToggle={onSlotToggle}
                    />

                    <div className="space-y-2">
                      <Label className="text-sm font-medium" htmlFor={noteId}>
                        Observação
                      </Label>
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
