import type {
  MenuItem,
  OptionGroup,
  ProductGroup,
  ProductGroupItem,
  ProductGroupSlot,
  ProductGroupSlotProduct,
  StoreAddress,
  StoreHour,
  StoreMenu,
  StoreMenuEntry,
  StoreMenuGroup,
  PaymentMethod,
} from "@/lib/menu/catalog"

function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    process.env.API_URL?.replace(/\/$/, "") ||
    "http://localhost:5247"
  )
}

type ApiOptionGroup = {
  id: string
  title: string
  min: number
  max: number
  options: Array<{
    id: string
    name: string
    price: number
    image?: string | null
  }>
}

type ApiStoreMenuItem = {
  id: string
  name: string
  description: string
  price: number
  compareAtPrice?: number | null
  category: string
  image?: string | null
  badge?: string | null
  popular: boolean
  optionGroups?: ApiOptionGroup[] | null
}

type ApiProductGroup = {
  id: string
  name: string
  type: string
  priceMode: string
  price: number
  discountValue?: number | null
  discountType?: string | null
  description?: string | null
  image?: string | null
  category?: string | null
  items?: Array<{
    productId: string
    name: string
    quantity: number
    optionGroups?: ApiOptionGroup[] | null
  }> | null
  slots?: Array<{
    id: string
    title: string
    minSelect: number
    maxSelect: number
    products?: Array<{
      productId: string
      name: string
      extraPrice: number
      isDefault: boolean
      optionGroups?: ApiOptionGroup[] | null
    }> | null
  }> | null
}

type ApiStoreMenu = {
  tenant: string
  name: string
  tagline: string
  categoryLabel: string
  logo?: string | null
  bannerTitle?: string | null
  bannerSubtitle?: string | null
  bannerUrl?: string | null
  isOpen: boolean
  minOrder: number
  hours: StoreHour[]
  payments: Array<{
    id: string
    name: string
    kind: string
    brands?: string[] | null
  }>
  address: {
    line: string
    city: string
    state: string
    zip: string
    lat?: number | null
    lng?: number | null
  }
  menuId?: string | null
  menuName?: string | null
  groups?: Array<{
    id: string
    name: string
    items?: Array<{
      id: string
      type: string
      sortOrder: number
      product?: ApiStoreMenuItem | null
      productGroup?: ApiProductGroup | null
    }> | null
  }> | null
  categories: string[]
  items?: ApiStoreMenuItem[] | null
  productGroups?: ApiProductGroup[] | null
}

function mapOptionGroups(
  groups: ApiOptionGroup[] | null | undefined
): OptionGroup[] | undefined {
  if (!groups?.length) return undefined
  return groups.map((g) => ({
    id: g.id,
    title: g.title,
    min: g.min,
    max: g.max,
    options: g.options.map((o) => ({
      id: o.id,
      name: o.name,
      price: Number(o.price),
      image: o.image ?? undefined,
    })),
  }))
}

function mapStoreMenuItem(item: ApiStoreMenuItem): MenuItem {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: Number(item.price),
    compareAtPrice:
      item.compareAtPrice != null ? Number(item.compareAtPrice) : undefined,
    category: item.category,
    image: item.image ?? undefined,
    badge: item.badge ?? undefined,
    popular: item.popular,
    kind: "product",
    optionGroups: mapOptionGroups(item.optionGroups),
  }
}

function mapProductGroup(group: ApiProductGroup): ProductGroup {
  const groupItems: ProductGroupItem[] = (group.items ?? []).map((p) => ({
    productId: p.productId,
    name: p.name,
    quantity: p.quantity,
    optionGroups: mapOptionGroups(p.optionGroups),
  }))

  const slots: ProductGroupSlot[] = (group.slots ?? []).map((slot) => {
    const products: ProductGroupSlotProduct[] = (slot.products ?? []).map(
      (p) => ({
        productId: p.productId,
        name: p.name,
        extraPrice: Number(p.extraPrice),
        isDefault: Boolean(p.isDefault),
        optionGroups: mapOptionGroups(p.optionGroups),
      })
    )
    return {
      id: slot.id,
      title: slot.title,
      minSelect: slot.minSelect,
      maxSelect: slot.maxSelect,
      products,
    }
  })

  return {
    id: group.id,
    name: group.name,
    type: group.type,
    priceMode: group.priceMode,
    price: Number(group.price),
    discountValue:
      group.discountValue != null ? Number(group.discountValue) : undefined,
    discountType: group.discountType ?? undefined,
    description: group.description ?? undefined,
    image: group.image ?? undefined,
    category: group.category || "Cardápio",
    items: groupItems,
    slots,
  }
}

function mapMenu(data: ApiStoreMenu): StoreMenu {
  const payments: PaymentMethod[] = (data.payments ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    kind: p.kind === "online" ? "online" : "delivery",
    brands: p.brands ?? undefined,
  }))

  const address: StoreAddress = {
    line: data.address?.line ?? "",
    city: data.address?.city ?? "",
    state: data.address?.state ?? "",
    zip: data.address?.zip ?? "",
    lat: data.address?.lat ?? undefined,
    lng: data.address?.lng ?? undefined,
  }

  const groups: StoreMenuGroup[] = (data.groups ?? []).map((group) => {
    const items: StoreMenuEntry[] = (group.items ?? [])
      .map((entry) => {
        const type =
          entry.type === "productGroup" ? "productGroup" : "product"
        return {
          id: entry.id,
          type,
          sortOrder: Number(entry.sortOrder) || 0,
          product:
            type === "product" && entry.product
              ? mapStoreMenuItem(entry.product)
              : undefined,
          productGroup:
            type === "productGroup" && entry.productGroup
              ? mapProductGroup(entry.productGroup)
              : undefined,
        } satisfies StoreMenuEntry
      })
      .filter(
        (entry) =>
          (entry.type === "product" && entry.product) ||
          (entry.type === "productGroup" && entry.productGroup)
      )
      .sort((a, b) => a.sortOrder - b.sortOrder)

    return {
      id: group.id,
      name: group.name,
      items,
    }
  })

  const categories =
    (data.categories?.length ? [...data.categories] : null) ??
    groups.map((g) => g.name)

  // Deprecated flat lists — kept empty/compat when API still sends them
  const items: MenuItem[] = (data.items ?? []).map(mapStoreMenuItem)
  const productGroups: ProductGroup[] = (data.productGroups ?? []).map(
    mapProductGroup
  )

  return {
    tenant: data.tenant,
    name: data.name,
    tagline: data.tagline ?? "",
    categoryLabel: data.categoryLabel || "Cardápio",
    logo: data.logo ?? undefined,
    bannerTitle: data.bannerTitle ?? undefined,
    bannerSubtitle: data.bannerSubtitle ?? undefined,
    bannerUrl: data.bannerUrl ?? undefined,
    isOpen: data.isOpen,
    minOrder: Number(data.minOrder) || 0,
    hours: data.hours ?? [],
    payments,
    address,
    menuId: data.menuId ?? undefined,
    menuName: data.menuName ?? undefined,
    groups,
    categories,
    items,
    productGroups,
  }
}

/** Fetches the public store menu. Returns null on 404 / network failure. */
export async function fetchStoreMenu(
  tenant: string
): Promise<StoreMenu | null> {
  const id = tenant.trim().toLowerCase()
  if (!id) return null

  const baseUrl = getApiBaseUrl()
  const headers: HeadersInit = {}
  if (/ngrok/i.test(baseUrl)) {
    headers["ngrok-skip-browser-warning"] = "true"
  }

  try {
    const response = await fetch(
      `${baseUrl}/store/${encodeURIComponent(id)}/menu`,
      {
        method: "GET",
        headers,
        next: { revalidate: 30 },
      }
    )

    if (response.status === 404) return null
    if (!response.ok) {
      console.error(
        `[store-menu] ${response.status} for tenant ${id}: ${response.statusText}`
      )
      return null
    }

    const data = (await response.json()) as ApiStoreMenu
    return mapMenu(data)
  } catch (err) {
    console.error(`[store-menu] failed for tenant ${id}`, err)
    return null
  }
}
