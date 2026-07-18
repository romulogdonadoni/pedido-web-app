import type { OptionGroup } from "@/lib/menu/catalog"
import type { SelectedOption } from "@/lib/cart/types"

export function countSelectedInGroup(
  selected: SelectedOption[],
  groupId: string
) {
  return selected.filter((s) => s.groupId === groupId).length
}

export function validateOptionGroups(
  groups: OptionGroup[] | undefined,
  selected: SelectedOption[]
): string | null {
  if (!groups?.length) return null
  for (const group of groups) {
    const count = countSelectedInGroup(selected, group.id)
    if (count < group.min) {
      return `Selecione pelo menos ${group.min} em “${group.title}”.`
    }
    if (count > group.max) {
      return `Selecione no máximo ${group.max} em “${group.title}”.`
    }
  }
  return null
}

export function toggleOptionSelection(
  groups: OptionGroup[],
  selected: SelectedOption[],
  groupId: string,
  optionId: string
): SelectedOption[] {
  const group = groups.find((g) => g.id === groupId)
  const option = group?.options.find((o) => o.id === optionId)
  if (!group || !option) return selected

  const already = selected.find(
    (s) => s.groupId === groupId && s.optionId === optionId
  )
  if (already) {
    return selected.filter(
      (s) => !(s.groupId === groupId && s.optionId === optionId)
    )
  }

  const inGroup = selected.filter((s) => s.groupId === groupId)
  let next = selected

  if (group.max === 1) {
    next = selected.filter((s) => s.groupId !== groupId)
  } else if (inGroup.length >= group.max) {
    return selected
  }

  return [
    ...next,
    {
      groupId,
      optionId: option.id,
      name: option.name,
      price: option.price,
    },
  ]
}
