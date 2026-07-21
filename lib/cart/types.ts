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
