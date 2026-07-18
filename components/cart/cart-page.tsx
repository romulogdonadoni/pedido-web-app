"use client"

import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react"
import Link from "next/link"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/lib/cart/cart-context"
import { formatBrl, type StoreMenu } from "@/lib/menu/catalog"

export function CartPage({ menu }: { menu: StoreMenu }) {
  const { lines, qty, subtotal, setQty, setNote, removeLine, clear } = useCart()
  const belowMin = subtotal > 0 && subtotal < menu.minOrder
  const canCheckout = menu.isOpen && lines.length > 0 && !belowMin

  const summary = (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Subtotal · {qty} {qty === 1 ? "item" : "itens"}
        </span>
        <span className="font-semibold tabular-nums">{formatBrl(subtotal)}</span>
      </div>
      <Separator />
      {!menu.isOpen ? (
        <Alert>
          <AlertDescription>
            A loja está offline. Não é possível finalizar.
          </AlertDescription>
        </Alert>
      ) : null}
      {belowMin ? (
        <Alert>
          <AlertDescription>
            Pedido mínimo de {formatBrl(menu.minOrder)}. Faltam{" "}
            {formatBrl(menu.minOrder - subtotal)}.
          </AlertDescription>
        </Alert>
      ) : null}
      {canCheckout ? (
        <Button size="lg" className="w-full" render={<Link href="/checkout" />}>
          Continuar para checkout
        </Button>
      ) : (
        <Button size="lg" className="w-full" disabled>
          Continuar para checkout
        </Button>
      )}
    </div>
  )

  return (
    <div className="pb-28 lg:pb-6">
      <div className="flex items-center gap-2 border-b px-2 py-2 lg:border-b-0 lg:px-6 lg:pt-6 lg:pb-2">
        <Button variant="ghost" size="icon-sm" render={<Link href="/" />}>
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="flex-1 text-sm font-medium lg:text-xl lg:font-semibold">
          Carrinho
        </h1>
        {lines.length > 0 ? (
          <Button variant="ghost" size="sm" onClick={clear}>
            Limpar
          </Button>
        ) : null}
      </div>

      {lines.length === 0 ? (
        <div className="space-y-3 px-4 py-10 text-center lg:px-6">
          <p className="text-sm text-muted-foreground">Seu carrinho está vazio.</p>
          <Button render={<Link href="/" />}>Ver cardápio</Button>
        </div>
      ) : (
        <div className="grid gap-6 px-4 pt-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start lg:px-6 lg:pt-2">
          <div className="space-y-4">
            {lines.map((line) => (
              <div
                key={line.key}
                className="space-y-2 rounded-2xl border border-transparent pb-4 md:border-border md:p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{line.name}</p>
                    {line.selectedOptions.length > 0 ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {line.selectedOptions.map((o) => o.name).join(", ")}
                      </p>
                    ) : null}
                    <p className="mt-1 text-sm font-semibold tabular-nums text-primary">
                      {formatBrl(line.unitPrice)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => setQty(line.key, line.qty - 1)}
                    >
                      {line.qty === 1 ? (
                        <Trash2 className="size-3.5" />
                      ) : (
                        <Minus className="size-3.5" />
                      )}
                    </Button>
                    <span className="w-6 text-center text-sm tabular-nums">
                      {line.qty}
                    </span>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => setQty(line.key, line.qty + 1)}
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={line.note || ""}
                  onChange={(e) => setNote(line.key, e.target.value)}
                  placeholder="Observação deste item"
                  rows={2}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => removeLine(line.key)}
                >
                  Remover
                </Button>
              </div>
            ))}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-6 rounded-3xl border p-5">{summary}</div>
          </aside>
        </div>
      )}

      {lines.length > 0 ? (
        <div className="fixed inset-x-0 bottom-14 z-30 border-t bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
          {summary}
        </div>
      ) : null}
    </div>
  )
}
