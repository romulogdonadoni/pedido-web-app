"use client"

import * as React from "react"

import { CartTriggerButton } from "@/components/cart/cart-trigger-button"
import { CategoryNav, slugify } from "@/components/store/category-nav"
import { ItemDetailOverlay } from "@/components/store/item-detail-overlay"
import { ItemRow } from "@/components/store/item-row"
import { StoreHeader } from "@/components/store/store-header"
import { useCart } from "@/lib/cart/cart-context"
import {
  formatBrl,
  menuEntryAsMenuItem,
  type MenuItem,
  type StoreMenu,
} from "@/lib/menu/catalog"

export function MenuHome({ menu }: { menu: StoreMenu }) {
  const { qty, subtotal } = useCart()
  const [selectedItem, setSelectedItem] = React.useState<MenuItem | null>(null)

  const sections = React.useMemo(() => {
    return (menu.groups ?? [])
      .map((group) => {
        const items = [...group.items]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((entry) => menuEntryAsMenuItem(entry, group.name))
          .filter((item): item is MenuItem => item != null)
        return { id: group.id, category: group.name, items }
      })
      .filter((section) => section.items.length > 0)
  }, [menu])

  return (
    <div className="flex flex-1 flex-col pb-24">
      <StoreHeader menu={menu} />
      <div className="flex flex-col gap-8 lg:p-6 lg:pb-6">
        <div className="mt-4 lg:mt-6">
          <CategoryNav categories={sections.map((s) => s.category)} />
        </div>

        <div className="flex flex-col gap-8 px-4 pt-4 lg:px-0 lg:pt-6">
          {sections.map(({ id, category, items }) => (
            <section
              key={id}
              id={`cat-${slugify(category)}`}
              className="scroll-mt-20"
            >
              <h2 className="mb-3 text-lg font-semibold tracking-tight">
                {category}
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {items.map((item) => (
                  <ItemRow
                    key={`${id}-${item.id}`}
                    item={item}
                    onSelect={setSelectedItem}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        {qty > 0 ? (
          <div className="fixed inset-x-0 bottom-14 z-30 px-4 pb-3 lg:right-6 lg:bottom-6 lg:left-auto lg:w-auto lg:px-0 lg:pb-0">
            <CartTriggerButton
              size="lg"
              className="w-full shadow-lg lg:min-w-64"
              label={`Abrir pedido · ${qty} · ${formatBrl(subtotal)}`}
              showTotal={false}
            />
          </div>
        ) : null}
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
