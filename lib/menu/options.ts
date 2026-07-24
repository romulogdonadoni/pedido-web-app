import type {
  OptionGroup,
  ProductGroupItem,
  ProductGroupSlot,
  MenuItem,
} from "@/lib/menu/catalog"
import type { SelectedOption, SlotSelection } from "@/lib/cart/types"

export type OptionsValidationIssue = {
  message: string
  focusId: string
}

export function optionGroupFocusId(groupId: string, productId?: string) {
  return productId
    ? `opt-group-${productId}-${groupId}`
    : `opt-group-${groupId}`
}

export function slotFocusId(slotId: string) {
  return `opt-slot-${slotId}`
}

export function countSelectedInGroup(
  selected: SelectedOption[],
  groupId: string,
  productId?: string
) {
  return selected.filter(
    (s) =>
      s.groupId === groupId &&
      (productId ? s.productId === productId : !s.productId)
  ).length
}

export function validateOptionGroups(
  groups: OptionGroup[] | undefined,
  selected: SelectedOption[],
  productId?: string
): OptionsValidationIssue | null {
  if (!groups?.length) return null
  for (const group of groups) {
    const count = countSelectedInGroup(selected, group.id, productId)
    if (count < group.min) {
      return {
        message: `Selecione pelo menos ${group.min} em “${group.title}”.`,
        focusId: optionGroupFocusId(group.id, productId),
      }
    }
    if (count > group.max) {
      return {
        message: `Selecione no máximo ${group.max} em “${group.title}”.`,
        focusId: optionGroupFocusId(group.id, productId),
      }
    }
  }
  return null
}

/** Validates option groups on fixed items of a product group. */
export function validateProductGroupOptions(
  items: ProductGroupItem[] | undefined,
  selected: SelectedOption[]
): OptionsValidationIssue | null {
  if (!items?.length) return null
  for (const item of items) {
    const err = validateOptionGroups(
      item.optionGroups,
      selected,
      item.productId
    )
    if (err) {
      return {
        message: `${item.name}: ${err.message}`,
        focusId: err.focusId,
      }
    }
  }
  return null
}

export function validateProductGroupSlots(
  slots: ProductGroupSlot[] | undefined,
  selections: SlotSelection[] | undefined
): OptionsValidationIssue | null {
  if (!slots?.length) return null
  const sels = selections ?? []
  for (const slot of slots) {
    const count = sels.filter((s) => s.slotId === slot.id).length
    if (count < slot.minSelect) {
      return {
        message: `Selecione pelo menos ${slot.minSelect} em “${slot.title}”.`,
        focusId: slotFocusId(slot.id),
      }
    }
    if (count > slot.maxSelect) {
      return {
        message: `Selecione no máximo ${slot.maxSelect} em “${slot.title}”.`,
        focusId: slotFocusId(slot.id),
      }
    }
  }
  return null
}

/** Validates option groups of products chosen in slots. */
export function validateProductGroupSlotOptions(
  slots: ProductGroupSlot[] | undefined,
  selections: SlotSelection[] | undefined,
  selected: SelectedOption[]
): OptionsValidationIssue | null {
  if (!slots?.length || !selections?.length) return null
  for (const sel of selections) {
    const slot = slots.find((s) => s.id === sel.slotId)
    const product = slot?.products.find((p) => p.productId === sel.productId)
    if (!product) continue
    const err = validateOptionGroups(
      product.optionGroups,
      selected,
      product.productId
    )
    if (err) {
      return {
        message: `${product.name}: ${err.message}`,
        focusId: err.focusId,
      }
    }
  }
  return null
}

/** True when the item has option groups or selectable slots (needs detail UI). */
export function itemNeedsCustomization(item: MenuItem): boolean {
  if ((item.optionGroups ?? []).some((g) => g.options.length > 0)) return true

  if (item.kind === "productGroup") {
    if ((item.productGroupSlots ?? []).some((s) => s.products.length > 0)) {
      return true
    }
    if (
      (item.productGroupItems ?? []).some((p) =>
        (p.optionGroups ?? []).some((g) => g.options.length > 0)
      )
    ) {
      return true
    }
  }

  return false
}

/** First blocking customization issue for the item detail UI. */
export function findItemCustomizationIssue(
  item: MenuItem,
  selected: SelectedOption[],
  slotSelections: SlotSelection[]
): OptionsValidationIssue | null {
  if (item.kind === "productGroup") {
    return (
      validateProductGroupSlots(item.productGroupSlots, slotSelections) ??
      validateProductGroupOptions(item.productGroupItems, selected) ??
      validateProductGroupSlotOptions(
        item.productGroupSlots,
        slotSelections,
        selected
      )
    )
  }
  return validateOptionGroups(item.optionGroups, selected)
}

export function toggleSlotSelection(
  slots: ProductGroupSlot[],
  selections: SlotSelection[],
  slotId: string,
  productId: string
): SlotSelection[] {
  const slot = slots.find((s) => s.id === slotId)
  if (!slot) return selections

  const already = selections.some(
    (s) => s.slotId === slotId && s.productId === productId
  )

  if (slot.maxSelect === 1) {
    if (already) {
      if (slot.minSelect <= 0) {
        return selections.filter((s) => s.slotId !== slotId)
      }
      return selections
    }
    const product = slot.products.find((p) => p.productId === productId)
    return [
      ...selections.filter((s) => s.slotId !== slotId),
      {
        slotId,
        productId,
        slotTitle: slot.title,
        productName: product?.name,
      },
    ]
  }

  if (already) {
    return selections.filter(
      (s) => !(s.slotId === slotId && s.productId === productId)
    )
  }

  const inSlot = selections.filter((s) => s.slotId === slotId)
  if (inSlot.length >= slot.maxSelect) return selections

  const product = slot.products.find((p) => p.productId === productId)
  return [
    ...selections,
    {
      slotId,
      productId,
      slotTitle: slot.title,
      productName: product?.name,
    },
  ]
}

/** Drops selected options that belong to products no longer chosen in slots. */
export function pruneOptionsForSlotSelections(
  selected: SelectedOption[],
  fixedProductIds: Set<string>,
  slotSelections: SlotSelection[]
): SelectedOption[] {
  const allowed = new Set([
    ...fixedProductIds,
    ...slotSelections.map((s) => s.productId),
  ])
  return selected.filter(
    (o) => !o.productId || allowed.has(o.productId)
  )
}

export function toggleOptionSelection(
  groups: OptionGroup[],
  selected: SelectedOption[],
  groupId: string,
  optionId: string,
  productId?: string,
  namePrefix?: string
): SelectedOption[] {
  const group = groups.find((g) => g.id === groupId)
  const option = group?.options.find((o) => o.id === optionId)
  if (!group || !option) return selected

  const same = (s: SelectedOption) =>
    s.groupId === groupId &&
    s.optionId === optionId &&
    (productId ? s.productId === productId : !s.productId)

  const already = selected.find(same)
  if (already) {
    return selected.filter((s) => !same(s))
  }

  const inGroup = selected.filter(
    (s) =>
      s.groupId === groupId &&
      (productId ? s.productId === productId : !s.productId)
  )
  let next = selected

  if (group.max === 1) {
    next = selected.filter(
      (s) =>
        !(
          s.groupId === groupId &&
          (productId ? s.productId === productId : !s.productId)
        )
    )
  } else if (inGroup.length >= group.max) {
    return selected
  }

  return [
    ...next,
    {
      groupId,
      optionId: option.id,
      name: namePrefix ? `${namePrefix}: ${option.name}` : option.name,
      price: option.price,
      productId,
    },
  ]
}
