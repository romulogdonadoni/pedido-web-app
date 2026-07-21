export type SelectedOption = {
  groupId: string
  optionId: string
  name: string
  price: number
  /** Set when the option belongs to a product inside a product group. */
  productId?: string
}

export type SlotSelection = {
  slotId: string
  productId: string
  slotTitle?: string
  productName?: string
}

export type CartFixedItem = {
  productId: string
  name: string
  quantity: number
}

export type CartLine = {
  key: string
  itemId: string
  name: string
  image?: string
  qty: number
  basePrice: number
  selectedOptions: SelectedOption[]
  note?: string
  unitPrice: number
  /** Present when the line is a ProductGroup. */
  productGroupId?: string
  slotSelections?: SlotSelection[]
  /** Snapshot of fixed products inside a combo/kit. */
  fixedItems?: CartFixedItem[]
}

/** Shape persisted in OrderLine.OptionsJson */
export type OrderLineOptionsPayload = {
  selectedOptions?: SelectedOption[]
  slotSelections?: SlotSelection[]
  fixedItems?: CartFixedItem[]
}

export function parseOrderLineOptions(
  raw: string | null | undefined
): OrderLineOptionsPayload {
  if (!raw?.trim()) return {}
  try {
    const parsed = JSON.parse(raw) as OrderLineOptionsPayload
    return {
      selectedOptions: Array.isArray(parsed.selectedOptions)
        ? parsed.selectedOptions
        : [],
      slotSelections: Array.isArray(parsed.slotSelections)
        ? parsed.slotSelections
        : [],
      fixedItems: Array.isArray(parsed.fixedItems) ? parsed.fixedItems : [],
    }
  } catch {
    return {}
  }
}

export function orderLineHasDetails(
  options: OrderLineOptionsPayload,
  note?: string | null
) {
  return (
    (options.fixedItems?.length ?? 0) > 0 ||
    (options.slotSelections?.length ?? 0) > 0 ||
    (options.selectedOptions?.length ?? 0) > 0 ||
    Boolean(note?.trim())
  )
}

export function lineUnitPrice(
  basePrice: number,
  selectedOptions: SelectedOption[]
) {
  const extras = selectedOptions.reduce((sum, o) => sum + o.price, 0)
  return basePrice + extras
}

export function makeLineKey(
  itemId: string,
  selectedOptions: SelectedOption[],
  note?: string,
  productGroupId?: string,
  slotSelections?: SlotSelection[]
) {
  const opts = [...selectedOptions]
    .map(
      (o) =>
        `${o.productId ?? ""}:${o.groupId}:${o.optionId}`
    )
    .sort()
    .join("|")
  const slots = [...(slotSelections ?? [])]
    .map((s) => `${s.slotId}:${s.productId}`)
    .sort()
    .join("|")
  return `${productGroupId ?? itemId}::${opts}::${slots}::${note?.trim() || ""}`
}

export function cartSubtotal(lines: CartLine[]) {
  return lines.reduce((sum, line) => sum + line.unitPrice * line.qty, 0)
}

export function cartQty(lines: CartLine[]) {
  return lines.reduce((sum, line) => sum + line.qty, 0)
}
