import { makeLineKey, type CartFixedItem } from "@/lib/cart/types"
import {
  defaultSlotSelections,
  type MenuItem,
} from "@/lib/menu/catalog"

export function simpleItemLineKey(item: MenuItem) {
  const isGroup = item.kind === "productGroup"
  return makeLineKey(
    item.id,
    [],
    undefined,
    isGroup ? item.id : undefined,
    isGroup ? defaultSlotSelections(item.productGroupSlots) : undefined
  )
}

export function simpleItemAddInput(item: MenuItem) {
  const isGroup = item.kind === "productGroup"
  const slotSelections = isGroup
    ? defaultSlotSelections(item.productGroupSlots)
    : undefined
  const fixedItems: CartFixedItem[] | undefined = isGroup
    ? (item.productGroupItems ?? []).map((i) => ({
        productId: i.productId,
        name: i.name,
        quantity: i.quantity,
      }))
    : undefined

  return {
    itemId: item.id,
    name: item.name,
    image: item.image,
    basePrice: item.price,
    selectedOptions: [],
    qty: 1,
    productGroupId: isGroup ? item.id : undefined,
    slotSelections,
    fixedItems,
  }
}
