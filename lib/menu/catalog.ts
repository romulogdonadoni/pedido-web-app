export type MenuOption = {
  id: string
  name: string
  price: number
  image?: string
}

export type OptionGroup = {
  id: string
  title: string
  min: number
  max: number
  options: MenuOption[]
}

export type ProductGroupItem = {
  productId: string
  name: string
  quantity: number
  optionGroups?: OptionGroup[]
}

export type ProductGroupSlotProduct = {
  productId: string
  name: string
  extraPrice: number
  isDefault: boolean
  optionGroups?: OptionGroup[]
}

export type ProductGroupSlot = {
  id: string
  title: string
  minSelect: number
  maxSelect: number
  products: ProductGroupSlotProduct[]
}

export type ProductGroup = {
  id: string
  name: string
  type: string
  priceMode: string
  price: number
  discountValue?: number
  discountType?: string
  description?: string
  image?: string
  category: string
  items: ProductGroupItem[]
  slots: ProductGroupSlot[]
}

export type MenuItem = {
  id: string
  name: string
  description: string
  price: number
  compareAtPrice?: number
  category: string
  image?: string
  badge?: string
  popular?: boolean
  /** Typed house highlight: none | signature | chef | daily */
  highlightKind?: string
  optionGroups?: OptionGroup[]
  /** Present when this row represents a ProductGroup, not a MenuProduct. */
  kind?: "product" | "productGroup"
  productGroupItems?: ProductGroupItem[]
  productGroupSlots?: ProductGroupSlot[]
  priceMode?: string
}

export type StoreMenuEntryType = "product" | "productGroup"

export type StoreMenuEntry = {
  id: string
  type: StoreMenuEntryType
  sortOrder: number
  product?: MenuItem
  productGroup?: ProductGroup
}

export type StoreMenuGroup = {
  id: string
  name: string
  /** List | Carousel | Featured — how the storefront renders this section. */
  layoutType?: "List" | "Carousel" | "Featured" | string
  /** Lucide icon name (e.g. Flame, CupSoda). */
  icon?: string | null
  items: StoreMenuEntry[]
}

export type StoreHour = {
  day: string
  hours: string
}

export type PaymentMethod = {
  id: string
  name: string
  kind: "online" | "delivery"
  brands?: string[]
}

export type StoreAddress = {
  line: string
  city: string
  state: string
  zip: string
  lat?: number
  lng?: number
}

export type StoreMenu = {
  tenant: string
  name: string
  tagline: string
  categoryLabel: string
  logo?: string
  bannerTitle?: string
  bannerSubtitle?: string
  bannerUrl?: string
  /** Store accent color (#RRGGBB). Drives --primary in the store shell. */
  brandColor?: string
  /** Text/icon on brand surfaces (#RRGGBB). Drives --primary-foreground. */
  brandForegroundColor?: string
  /** Preset font key (see brand-fonts). */
  brandFont?: string
  /** Salon / store photo gallery URLs. */
  galleryUrls?: string[]
  isOpen: boolean
  minOrder: number
  hours: StoreHour[]
  payments: PaymentMethod[]
  address: StoreAddress
  menuId?: string
  menuName?: string
  /** Menu sections (groups) with ordered product / productGroup entries. */
  groups: StoreMenuGroup[]
  /** Group names for nav (mirrors `groups[].name`). */
  categories: string[]
  /** @deprecated Empty from API; prefer `groups`. Kept for compat. */
  items?: MenuItem[]
  /** @deprecated Empty from API; prefer `groups`. Kept for compat. */
  productGroups?: ProductGroup[]
}

export function productGroupAsMenuItem(group: ProductGroup): MenuItem {
  const itemDesc = group.items
    .map((p) => `${p.quantity}× ${p.name}`)
    .join(" · ")
  const slotDesc = group.slots.map((s) => s.title).join(" · ")
  const description =
    group.description ||
    [itemDesc, slotDesc].filter(Boolean).join(" · ") ||
    ""

  return {
    id: group.id,
    name: group.name,
    description,
    price: group.price,
    category: group.category,
    image: group.image,
    kind: "productGroup",
    productGroupItems: group.items,
    productGroupSlots: group.slots,
    priceMode: group.priceMode,
  }
}

/** Resolve a group entry to a sellable MenuItem (for list / detail / cart). */
export function menuEntryAsMenuItem(
  entry: StoreMenuEntry,
  groupName?: string
): MenuItem | null {
  if (entry.type === "product" && entry.product) {
    return {
      ...entry.product,
      kind: "product",
      category: groupName ?? entry.product.category,
    }
  }
  if (entry.type === "productGroup" && entry.productGroup) {
    const item = productGroupAsMenuItem(entry.productGroup)
    return groupName ? { ...item, category: groupName } : item
  }
  return null
}

/** Flatten all sellable MenuItems from menu.groups (ordered by group + sortOrder). */
export function flattenSellableFromGroups(menu: StoreMenu): MenuItem[] {
  const result: MenuItem[] = []
  for (const group of menu.groups ?? []) {
    const entries = [...group.items].sort((a, b) => a.sortOrder - b.sortOrder)
    for (const entry of entries) {
      const item = menuEntryAsMenuItem(entry, group.name)
      if (item) result.push(item)
    }
  }
  return result
}

export function getMenuItem(
  menu: StoreMenu | null,
  itemId: string
): MenuItem | null {
  if (!menu) return null

  for (const group of menu.groups ?? []) {
    for (const entry of group.items) {
      if (entry.type === "product" && entry.product?.id === itemId) {
        return menuEntryAsMenuItem(entry, group.name)
      }
      if (entry.type === "productGroup" && entry.productGroup?.id === itemId) {
        return menuEntryAsMenuItem(entry, group.name)
      }
    }
  }

  const product = menu.items?.find((item) => item.id === itemId)
  if (product) return { ...product, kind: "product" as const }
  const group = menu.productGroups?.find((g) => g.id === itemId)
  return group ? productGroupAsMenuItem(group) : null
}

export function allSellableItems(menu: StoreMenu): MenuItem[] {
  const fromGroups = flattenSellableFromGroups(menu)
  if (fromGroups.length > 0) return fromGroups

  return [
    ...(menu.items ?? []).map((item) => ({ ...item, kind: "product" as const })),
    ...(menu.productGroups ?? []).map(productGroupAsMenuItem),
  ]
}

export function searchMenuItems(
  menu: StoreMenu,
  query: string
): MenuItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return allSellableItems(menu).filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
  )
}

export function formatBrl(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function discountPercent(price: number, compareAt?: number) {
  if (!compareAt || compareAt <= price) return null
  return Math.round(((compareAt - price) / compareAt) * 100)
}

export function slotSelectionsExtraTotal(
  slots: ProductGroupSlot[] | undefined,
  selections: { slotId: string; productId: string }[] | undefined
) {
  if (!slots?.length || !selections?.length) return 0
  let total = 0
  for (const sel of selections) {
    const slot = slots.find((s) => s.id === sel.slotId)
    const product = slot?.products.find((p) => p.productId === sel.productId)
    total += product?.extraPrice ?? 0
  }
  return total
}

export function defaultSlotSelections(
  slots: ProductGroupSlot[] | undefined
): {
  slotId: string
  productId: string
  slotTitle: string
  productName: string
}[] {
  if (!slots?.length) return []
  const selections: {
    slotId: string
    productId: string
    slotTitle: string
    productName: string
  }[] = []
  for (const slot of slots) {
    const defaults = slot.products.filter((p) => p.isDefault)
    for (const product of defaults.slice(0, slot.maxSelect)) {
      selections.push({
        slotId: slot.id,
        productId: product.productId,
        slotTitle: slot.title,
        productName: product.name,
      })
    }
  }
  return selections
}
