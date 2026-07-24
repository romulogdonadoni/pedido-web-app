"use client"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { SelectedOption, SlotSelection } from "@/lib/cart/types"
import {
  formatBrl,
  type MenuItem,
  type OptionGroup,
  type ProductGroupItem,
  type ProductGroupSlot,
  type ProductGroupSlotProduct,
} from "@/lib/menu/catalog"
import {
  countSelectedInGroup,
  optionGroupFocusId,
  slotFocusId,
} from "@/lib/menu/options"
import { cn } from "@/lib/utils"

function OptionGroupsList({
  groups,
  selected,
  productId,
  namePrefix,
  onToggle,
  errorFocusId,
}: {
  groups: OptionGroup[]
  selected: SelectedOption[]
  productId?: string
  namePrefix?: string
  onToggle: (
    groupId: string,
    optionId: string,
    productId?: string,
    namePrefix?: string
  ) => void
  errorFocusId?: string | null
}) {
  if (groups.length === 0) return null

  return (
    <div className="space-y-5">
      {groups.map((group) => {
        const count = countSelectedInGroup(selected, group.id, productId)
        const required = group.min > 0
        const focusId = optionGroupFocusId(group.id, productId)
        const hasError = errorFocusId === focusId
        return (
          <div
            key={group.id}
            id={focusId}
            data-option-section={focusId}
            className={cn(
              "scroll-mt-4 space-y-2.5 rounded-2xl border border-transparent p-3 -mx-3 transition-colors",
              hasError && "border-destructive/50 bg-destructive/5"
            )}
          >
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold">{group.title}</p>
                {required ? (
                  <Badge
                    variant="outline"
                    className={cn(
                      "px-1.5 py-0 text-[10px] font-medium tracking-wide uppercase",
                      hasError && "border-destructive/40 text-destructive"
                    )}
                  >
                    Obrigatório
                  </Badge>
                ) : null}
              </div>
              <p
                className={cn(
                  "text-xs text-muted-foreground",
                  hasError && "font-medium text-destructive"
                )}
              >
                Escolha{" "}
                {group.min === group.max ? group.min : `até ${group.max}`}
                {required ? "" : " (opcional)"} · {count}/{group.max}
              </p>
            </div>
            <ul className="space-y-2">
              {group.options.map((option) => {
                const checked = selected.some(
                  (s) =>
                    s.groupId === group.id &&
                    s.optionId === option.id &&
                    (productId
                      ? s.productId === productId
                      : !s.productId)
                )
                return (
                  <li key={option.id}>
                    <label
                      className={cn(
                        "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors",
                        checked
                          ? "border-primary/60 bg-primary/8"
                          : "border-border/70 hover:border-border hover:bg-muted/35"
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() =>
                          onToggle(
                            group.id,
                            option.id,
                            productId,
                            namePrefix
                          )
                        }
                      />
                      <span className="min-w-0 flex-1 text-sm font-medium">
                        {option.name}
                      </span>
                      {option.price > 0 ? (
                        <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
                          + {formatBrl(option.price)}
                        </span>
                      ) : null}
                    </label>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

function FixedItemSection({
  item,
  selected,
  onToggle,
  errorFocusId,
}: {
  item: ProductGroupItem
  selected: SelectedOption[]
  onToggle: (
    groupId: string,
    optionId: string,
    productId?: string,
    namePrefix?: string
  ) => void
  errorFocusId?: string | null
}) {
  const groups = item.optionGroups ?? []
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold">{item.name}</p>
        {item.quantity > 1 ? (
          <Badge variant="secondary">{item.quantity}×</Badge>
        ) : null}
        <Badge
          variant="outline"
          className="px-1.5 py-0 text-[10px] font-medium tracking-wide uppercase"
        >
          Incluído
        </Badge>
      </div>
      {groups.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Sem opções para este item.
        </p>
      ) : (
        <OptionGroupsList
          groups={groups}
          selected={selected}
          productId={item.productId}
          namePrefix={item.name}
          onToggle={onToggle}
          errorFocusId={errorFocusId}
        />
      )}
    </div>
  )
}

function SlotProductRow({
  product,
  checked,
  multi,
  onSelect,
}: {
  product: ProductGroupSlotProduct
  checked: boolean
  multi: boolean
  onSelect: () => void
}) {
  return (
    <label
      className={cn(
        "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors",
        checked
          ? "border-primary/60 bg-primary/8"
          : "border-border/70 hover:border-border hover:bg-muted/35"
      )}
    >
      {multi ? (
        <Checkbox checked={checked} onCheckedChange={() => onSelect()} />
      ) : (
        <RadioGroupItem value={product.productId} />
      )}
      <span className="min-w-0 flex-1 text-sm font-medium">{product.name}</span>
      {product.extraPrice > 0 ? (
        <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
          + {formatBrl(product.extraPrice)}
        </span>
      ) : null}
    </label>
  )
}

function SlotSection({
  slot,
  slotSelections,
  selected,
  onSlotToggle,
  onToggle,
  errorFocusId,
}: {
  slot: ProductGroupSlot
  slotSelections: SlotSelection[]
  selected: SelectedOption[]
  onSlotToggle: (slotId: string, productId: string) => void
  onToggle: (
    groupId: string,
    optionId: string,
    productId?: string,
    namePrefix?: string
  ) => void
  errorFocusId?: string | null
}) {
  const multi = slot.maxSelect > 1
  const count = slotSelections.filter((s) => s.slotId === slot.id).length
  const required = slot.minSelect > 0
  const selectedInSlot = slotSelections.filter((s) => s.slotId === slot.id)
  const singleValue = selectedInSlot[0]?.productId ?? ""
  const focusId = slotFocusId(slot.id)
  const hasError = errorFocusId === focusId

  return (
    <div
      id={focusId}
      data-option-section={focusId}
      className={cn(
        "scroll-mt-4 space-y-2 rounded-2xl border border-transparent p-3 -mx-3 transition-colors",
        hasError && "border-destructive/50 bg-destructive/5"
      )}
    >
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold">{slot.title}</p>
          {required ? (
            <Badge
              variant="outline"
              className={cn(
                "px-1.5 py-0 text-[10px] font-medium tracking-wide uppercase",
                hasError && "border-destructive/40 text-destructive"
              )}
            >
              Obrigatório
            </Badge>
          ) : null}
        </div>
        <p
          className={cn(
            "text-xs text-muted-foreground",
            hasError && "font-medium text-destructive"
          )}
        >
          Escolha{" "}
          {slot.minSelect === slot.maxSelect
            ? slot.minSelect
            : `até ${slot.maxSelect}`}
          {required ? "" : " (opcional)"} · {count}/{slot.maxSelect}
        </p>
      </div>

      {multi ? (
        <ul className="space-y-2">
          {slot.products.map((product) => {
            const checked = slotSelections.some(
              (s) =>
                s.slotId === slot.id && s.productId === product.productId
            )
            return (
              <li key={product.productId}>
                <SlotProductRow
                  product={product}
                  checked={checked}
                  multi
                  onSelect={() => onSlotToggle(slot.id, product.productId)}
                />
              </li>
            )
          })}
        </ul>
      ) : (
        <RadioGroup
          value={singleValue}
          onValueChange={(value) => {
            if (typeof value === "string" && value) {
              onSlotToggle(slot.id, value)
            }
          }}
          className="gap-2"
        >
          {slot.products.map((product) => {
            const checked = singleValue === product.productId
            return (
              <SlotProductRow
                key={product.productId}
                product={product}
                checked={checked}
                multi={false}
                onSelect={() => onSlotToggle(slot.id, product.productId)}
              />
            )
          })}
        </RadioGroup>
      )}

      {selectedInSlot.map((sel) => {
        const product = slot.products.find(
          (p) => p.productId === sel.productId
        )
        if (!product?.optionGroups?.length) return null
        return (
          <div key={`${slot.id}-${sel.productId}`} className="space-y-2 pt-1">
            <p className="text-xs font-medium text-muted-foreground">
              Opções de {product.name}
            </p>
            <OptionGroupsList
              groups={product.optionGroups}
              selected={selected}
              productId={product.productId}
              namePrefix={product.name}
              onToggle={onToggle}
              errorFocusId={errorFocusId}
            />
          </div>
        )
      })}
    </div>
  )
}

export function ItemOptionsSections({
  item,
  selected,
  onToggle,
  slotSelections = [],
  onSlotToggle,
  errorFocusId,
}: {
  item: MenuItem
  selected: SelectedOption[]
  onToggle: (
    groupId: string,
    optionId: string,
    productId?: string,
    namePrefix?: string
  ) => void
  slotSelections?: SlotSelection[]
  onSlotToggle?: (slotId: string, productId: string) => void
  errorFocusId?: string | null
}) {
  const isProductGroup = item.kind === "productGroup"
  const fixedItems = item.productGroupItems ?? []
  const slots = item.productGroupSlots ?? []

  if (isProductGroup) {
    if (fixedItems.length === 0 && slots.length === 0) return null
    return (
      <div className="space-y-5">
        {fixedItems.map((fixed) => (
          <FixedItemSection
            key={fixed.productId}
            item={fixed}
            selected={selected}
            onToggle={onToggle}
            errorFocusId={errorFocusId}
          />
        ))}
        {slots.map((slot) => (
          <SlotSection
            key={slot.id}
            slot={slot}
            slotSelections={slotSelections}
            selected={selected}
            onSlotToggle={onSlotToggle ?? (() => {})}
            onToggle={onToggle}
            errorFocusId={errorFocusId}
          />
        ))}
      </div>
    )
  }

  const groups = item.optionGroups ?? []
  if (groups.length === 0) return null

  return (
    <OptionGroupsList
      groups={groups}
      selected={selected}
      onToggle={onToggle}
      errorFocusId={errorFocusId}
    />
  )
}
