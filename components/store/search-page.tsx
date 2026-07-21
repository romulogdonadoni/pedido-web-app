"use client"

import * as React from "react"
import { Search, X } from "lucide-react"

import { ItemDetailOverlay } from "@/components/store/item-detail-overlay"
import { ItemRow } from "@/components/store/item-row"
import { Input } from "@/components/ui/input"
import {
  searchMenuItems,
  type MenuItem,
  type StoreMenu,
} from "@/lib/menu/catalog"

export function SearchPage({ menu }: { menu: StoreMenu }) {
  const [query, setQuery] = React.useState("")
  const [selectedItem, setSelectedItem] = React.useState<MenuItem | null>(null)
  const results = React.useMemo(
    () => searchMenuItems(menu, query),
    [menu, query]
  )

  return (
    <div className="px-4 py-4 pb-8 lg:px-6 lg:py-6">
      <h1 className="text-xl font-semibold tracking-tight lg:text-2xl">Buscar</h1>
      <div className="relative mt-4 max-w-xl">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pesquise pelo nome"
          className="pr-9 pl-9"
          autoFocus
        />
        {query ? (
          <button
            type="button"
            className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
            onClick={() => setQuery("")}
            aria-label="Limpar"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {!query.trim() ? (
          <p className="text-sm text-muted-foreground md:col-span-2">
            Digite para encontrar itens do cardápio.
          </p>
        ) : results.length === 0 ? (
          <p className="text-sm text-muted-foreground md:col-span-2">
            Nenhum item encontrado para “{query}”.
          </p>
        ) : (
          results.map((item) => (
            <ItemRow key={item.id} item={item} onSelect={setSelectedItem} />
          ))
        )}
      </div>

      <ItemDetailOverlay
        menu={menu}
        item={selectedItem}
        open={selectedItem != null}
        onOpenChange={(open) => {
          if (!open) setSelectedItem(null)
        }}
      />
    </div>
  )
}
