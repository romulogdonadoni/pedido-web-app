"use client"

import { Minus, Plus, StarIcon, XIcon } from "lucide-react"
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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
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

export function ItemDetailDialog({
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
  const noteId = `dialog-item-note-${displayItem?.id ?? "closed"}`

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
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={(isOpen) => {
        if (!isOpen) setDisplayItem(null)
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="flex h-[min(86dvh,44rem)] w-full max-w-2xl flex-col gap-0 overflow-hidden rounded-[1.75rem] p-0 sm:max-w-2xl"
      >
        <DialogClose
          aria-label="Fechar"
          render={
            <Button
              variant="secondary"
              size="icon-sm"
              className="absolute top-3.5 right-3.5 z-20 size-8 rounded-full bg-background/90 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/75"
            >
              <XIcon className="size-4" />
            </Button>
          }
        />

        {displayItem ? (
          <>
            <div className="flex shrink-0 gap-5 border-b border-border/60 p-5 pr-14">
              <div className="relative aspect-square w-[9.5rem] shrink-0 overflow-hidden rounded-2xl bg-muted sm:w-44">
                {displayItem.image ? (
                  <Image
                    src={displayItem.image}
                    alt={displayItem.name}
                    fill
                    className="object-cover"
                    sizes="176px"
                    priority
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-4xl font-bold text-muted-foreground/35">
                    {displayItem.name[0]}
                  </div>
                )}
                {displayItem.badge ? (
                  <span className="absolute top-2.5 left-2.5 rounded-full bg-background px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm">
                    {displayItem.badge}
                  </span>
                ) : null}
              </div>

              <DialogHeader className="min-w-0 flex-1 justify-center gap-2.5 text-left">
                <DialogTitle className="text-xl leading-snug font-semibold tracking-tight sm:text-2xl">
                  {displayItem.name}
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xl font-semibold text-primary tabular-nums sm:text-2xl">
                    {formatBrl(displayItem.price)}
                  </span>
                  {displayItem.compareAtPrice ? (
                    <span className="text-sm text-muted-foreground tabular-nums line-through sm:text-base">
                      {formatBrl(displayItem.compareAtPrice)}
                    </span>
                  ) : null}
                  {discount ? (
                    <Badge className="bg-primary/15 text-primary hover:bg-primary/15">
                      {discount}%
                    </Badge>
                  ) : null}
                  {displayItem.popular ? (
                    <Badge variant="secondary" className="gap-1">
                      <StarIcon className="size-3 fill-current" />
                      Popular
                    </Badge>
                  ) : null}
                </div>
                {displayItem.description ? (
                  <DialogDescription className="line-clamp-3 text-sm leading-relaxed">
                    {displayItem.description}
                  </DialogDescription>
                ) : null}
              </DialogHeader>
            </div>

            <ScrollArea className="h-0 min-h-0 flex-1">
              <div className="space-y-5 px-5 py-5">
                {groups.length > 0 ? (
                  <Accordion
                    multiple
                    defaultValue={[groups[0]?.id].filter(Boolean)}
                    className="rounded-2xl"
                  >
                    {groups.map((group) => {
                      const count = countSelectedInGroup(selected, group.id)
                      const required = group.min > 0
                      return (
                        <AccordionItem key={group.id} value={group.id}>
                          <AccordionTrigger className="py-3.5 hover:no-underline">
                            <span className="flex flex-col items-start gap-1">
                              <span className="flex flex-wrap items-center gap-2 font-medium">
                                {group.title}
                                {required ? (
                                  <Badge
                                    variant="outline"
                                    className="px-1.5 py-0 text-[10px] font-medium tracking-wide uppercase"
                                  >
                                    Obrigatório
                                  </Badge>
                                ) : null}
                              </span>
                              <span className="text-xs font-normal text-muted-foreground">
                                Escolha{" "}
                                {group.min === group.max
                                  ? group.min
                                  : `até ${group.max}`}
                                {required ? "" : " (opcional)"} · {count}/
                                {group.max}
                              </span>
                            </span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-2">
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
                                        "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors",
                                        checked
                                          ? "border-primary/60 bg-primary/8"
                                          : "border-border/70 hover:border-border hover:bg-muted/35"
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
                    className="resize-none rounded-xl"
                  />
                </div>

                {error ? (
                  <p className="text-sm text-destructive" role="alert">
                    {error}
                  </p>
                ) : null}
              </div>
            </ScrollArea>

            <div className="shrink-0 border-t border-border/60 bg-popover/95 px-5 py-4 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-0.5 rounded-full border border-border/80 bg-background p-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 rounded-full"
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
                    className="size-9 rounded-full"
                    aria-label="Aumentar quantidade"
                    onClick={() => setQty((q) => q + 1)}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
                <Button
                  type="button"
                  size="lg"
                  className="h-11 flex-1 rounded-full text-base font-semibold"
                  disabled={!menu.isOpen}
                  onClick={onAdd}
                >
                  {menu.isOpen
                    ? `Adicionar · ${formatBrl(unit * qty)}`
                    : "Loja offline"}
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
