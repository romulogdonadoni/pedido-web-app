export type SelectedOption = {
  groupId: string
  optionId: string
  name: string
  price: number
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
  note?: string
) {
  const opts = [...selectedOptions]
    .map((o) => `${o.groupId}:${o.optionId}`)
    .sort()
    .join("|")
  return `${itemId}::${opts}::${note?.trim() || ""}`
}

export function cartSubtotal(lines: CartLine[]) {
  return lines.reduce((sum, line) => sum + line.unitPrice * line.qty, 0)
}

export function cartQty(lines: CartLine[]) {
  return lines.reduce((sum, line) => sum + line.qty, 0)
}
