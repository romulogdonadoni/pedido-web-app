"use client"

import { Minus, Plus, ShoppingBag, Trash2, UtensilsCrossed } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { useCart } from "@/lib/cart/cart-context"
import { useCartSheet } from "@/lib/cart/cart-sheet-context"
import { formatBrl, getMenuItem, type StoreMenu } from "@/lib/menu/catalog"
import { useStoreNav } from "@/lib/store/nav-context"

function lineImage(menu: StoreMenu, line: { itemId: string; image?: string }) {
  return line.image || getMenuItem(menu, line.itemId)?.image
}

export function CartSheet({ menu }: { menu: StoreMenu }) {
  const { href } = useStoreNav()
  const { handle, open, setOpen, closeCart } = useCartSheet()
  const { lines, qty, subtotal, setQty, removeLine, clear } = useCart()
  const belowMin = subtotal > 0 && subtotal < menu.minOrder
  const canCheckout = menu.isOpen && lines.length > 0 && !belowMin

  return (
    <Sheet
      handle={handle}
      open={open}
      onOpenChange={(next) => setOpen(next)}
    >
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="size-4 text-primary" />
            Seu pedido
          </SheetTitle>
          <SheetDescription>
            {qty === 0
              ? "Carrinho vazio — escolha algo no cardápio."
              : `${qty} ${qty === 1 ? "item" : "itens"} · ${formatBrl(subtotal)}`}
          </SheetDescription>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
              <UtensilsCrossed className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Monte seu pedido adicionando itens da vitrine.
            </p>
            <Button variant="outline" onClick={closeCart}>
              Continuar navegando
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-0 min-h-0 flex-1">
            <ul className="space-y-4 px-6 py-4">
              {lines.map((line) => {
                const image = lineImage(menu, line)
                return (
                <li key={line.key} className="flex gap-3">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {image ? (
                      <Image
                        src={image}
                        alt={line.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-sm font-semibold text-muted-foreground">
                        {line.name[0]}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium leading-snug">{line.name}</p>
                        {line.selectedOptions.length > 0 ? (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {line.selectedOptions.map((o) => o.name).join(", ")}
                          </p>
                        ) : null}
                        <p className="mt-1 text-sm font-semibold tabular-nums text-primary">
                          {formatBrl(line.unitPrice * line.qty)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-xs"
                          onClick={() => setQty(line.key, line.qty - 1)}
                        >
                          {line.qty === 1 ? (
                            <Trash2 className="size-3" />
                          ) : (
                            <Minus className="size-3" />
                          )}
                        </Button>
                        <span className="w-5 text-center text-xs tabular-nums">
                          {line.qty}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-xs"
                          onClick={() => setQty(line.key, line.qty + 1)}
                        >
                          <Plus className="size-3" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      className="h-7 px-2 text-destructive"
                      onClick={() => removeLine(line.key)}
                    >
                      Remover
                    </Button>
                  </div>
                </li>
              )
              })}
            </ul>
          </ScrollArea>
        )}

        <SheetFooter className="border-t">
          {lines.length > 0 ? (
            <>
              <div className="flex w-full items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-base font-semibold tabular-nums">
                  {formatBrl(subtotal)}
                </span>
              </div>
              {belowMin ? (
                <p className="w-full text-xs text-muted-foreground">
                  Pedido mínimo {formatBrl(menu.minOrder)} · faltam{" "}
                  {formatBrl(menu.minOrder - subtotal)}
                </p>
              ) : null}
              <Separator />
              <div className="grid w-full gap-2">
                {!menu.isOpen ? (
                  <Button type="button" disabled size="lg">
                    Loja offline
                  </Button>
                ) : canCheckout ? (
                  <Button
                    type="button"
                    size="lg"
                    onClick={closeCart}
                    render={<Link href={href("/checkout")} />}
                  >
                    Finalizar pedido
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="lg"
                    onClick={closeCart}
                    render={<Link href={href("/carrinho")} />}
                  >
                    Revisar no carrinho
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => clear()}
                >
                  Limpar carrinho
                </Button>
              </div>
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={closeCart}
            >
              Continuar navegando
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
