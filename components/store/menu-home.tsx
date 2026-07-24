"use client"

import { Search } from "lucide-react"
import Link from "next/link"
import * as React from "react"

import { CartSacolaBar } from "@/components/cart/cart-sacola-bar"
import { CategoryNav, slugify } from "@/components/store/category-nav"
import { ItemCard } from "@/components/store/item-card"
import { ItemDetailOverlay } from "@/components/store/item-detail-overlay"
import { ItemRow } from "@/components/store/item-row"
import { StoreHeader } from "@/components/store/store-header"
import {
  menuEntryAsMenuItem,
  type MenuItem,
  type StoreMenu,
} from "@/lib/menu/catalog"
import { parseHighlightKind } from "@/lib/menu/highlights"
import { itemNeedsCustomization } from "@/lib/menu/options"
import { resolveMenuSectionIcon } from "@/lib/menu/section-icons"
import { useStoreNav } from "@/lib/store/nav-context"

type SectionLayout = "List" | "Carousel" | "Featured"

function normalizeLayout(raw: string | undefined): SectionLayout {
  const v = (raw || "List").trim()
  if (v === "Carousel" || v === "Featured" || v === "List") return v
  return "List"
}

function HorizontalRail({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={
        className ??
        "flex scrollbar-none gap-3 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] lg:gap-4 lg:px-6 [&::-webkit-scrollbar]:hidden"
      }
    >
      {children}
    </div>
  )
}

function SectionTitle({
  children,
  icon,
}: {
  children: React.ReactNode
  icon?: string | null
}) {
  const Icon = resolveMenuSectionIcon(icon)
  return (
    <div className="flex items-center gap-2 px-4 lg:px-6">
      <span className="h-5 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
      {Icon ? (
        <Icon className="size-4 shrink-0 text-primary" aria-hidden />
      ) : null}
      <h2 className="text-base font-semibold tracking-tight text-primary uppercase lg:text-lg">
        {children}
      </h2>
    </div>
  )
}

export function MenuHome({ menu }: { menu: StoreMenu }) {
  const { href } = useStoreNav()
  const [selectedItem, setSelectedItem] = React.useState<MenuItem | null>(null)

  const sections = React.useMemo(() => {
    return (menu.groups ?? [])
      .map((group) => {
        const items = [...group.items]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((entry) => menuEntryAsMenuItem(entry, group.name))
          .filter((item): item is MenuItem => item != null)
        return {
          id: group.id,
          category: group.name,
          layout: normalizeLayout(group.layoutType),
          icon: group.icon ?? null,
          items,
        }
      })
      .filter((section) => section.items.length > 0)
  }, [menu])

  const firstFeaturedId = sections.find((s) => s.layout === "Featured")?.id

  const highlightItems = React.useMemo(() => {
    const seen = new Set<string>()
    const list: MenuItem[] = []
    for (const section of sections) {
      for (const item of section.items) {
        if (parseHighlightKind(item.highlightKind) === "none") continue
        if (seen.has(item.id)) continue
        seen.add(item.id)
        list.push(item)
      }
    }
    return list
  }, [sections])

  function scrollToFeatured() {
    if (!firstFeaturedId) return
    document
      .getElementById(
        `cat-${slugify(
          sections.find((s) => s.id === firstFeaturedId)?.category ?? ""
        )}`
      )
      ?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  function handleSelect(item: MenuItem) {
    if (itemNeedsCustomization(item)) setSelectedItem(item)
  }

  return (
    <div className="flex flex-1 flex-col pb-28 lg:pb-24">
      <StoreHeader
        menu={menu}
        onPromoClick={firstFeaturedId ? scrollToFeatured : undefined}
      />

      <div className="mt-5 flex flex-col gap-6 lg:gap-8">
        <div className="space-y-3">
          <CategoryNav categories={sections.map((s) => s.category)} />

          <div className="px-4 lg:px-6">
            <Link
              href={href("/busca")}
              className="flex h-11 items-center gap-2 rounded-full border border-border/70 bg-muted/50 px-4 text-sm text-muted-foreground transition-colors hover:bg-muted"
            >
              <Search className="size-4 shrink-0" />
              Buscar produto...
            </Link>
          </div>
        </div>

        {highlightItems.length > 0 ? (
          <section className="sticky top-0 z-20 space-y-3 bg-background/95 py-3 backdrop-blur supports-backdrop-filter:bg-background/80">
            <SectionTitle>Destaques da casa</SectionTitle>
            <HorizontalRail>
              {highlightItems.map((item) => (
                <ItemCard
                  key={`highlight-${item.id}`}
                  item={item}
                  size="lg"
                  storeOpen={menu.isOpen}
                  onSelect={handleSelect}
                />
              ))}
            </HorizontalRail>
          </section>
        ) : null}

        <div className="flex flex-col gap-7 lg:gap-9">
          {sections.map(({ id, category, layout, icon, items }) => (
            <section
              key={id}
              id={`cat-${slugify(category)}`}
              className="scroll-mt-28 space-y-3"
            >
              <SectionTitle icon={icon}>{category}</SectionTitle>

              {layout === "List" ? (
                <div className="grid gap-3 px-4 md:grid-cols-2 lg:px-6">
                  {items.map((item) => (
                    <ItemRow
                      key={`${id}-${item.id}`}
                      item={item}
                      storeOpen={menu.isOpen}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              ) : null}

              {layout === "Carousel" ? (
                <HorizontalRail>
                  {items.map((item) => (
                    <ItemCard
                      key={`${id}-${item.id}`}
                      item={item}
                      size="lg"
                      storeOpen={menu.isOpen}
                      onSelect={handleSelect}
                    />
                  ))}
                </HorizontalRail>
              ) : null}

              {layout === "Featured" ? (
                <HorizontalRail>
                  {items.map((item) => (
                    <ItemCard
                      key={`${id}-${item.id}`}
                      item={item}
                      size="lg"
                      storeOpen={menu.isOpen}
                      onSelect={handleSelect}
                    />
                  ))}
                </HorizontalRail>
              ) : null}
            </section>
          ))}
        </div>
      </div>

      <CartSacolaBar />

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
