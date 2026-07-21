"use client"

import * as React from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  orderLineHasDetails,
  parseOrderLineOptions,
  type OrderLineOptionsPayload,
} from "@/lib/cart/types"
import { formatBrl } from "@/lib/menu/catalog"
import { cn } from "@/lib/utils"

export type OrderLineView = {
  id: string
  name: string
  quantity: number
  lineTotal: number
  note?: string | null
  optionsJson?: string | null
  /** When options already parsed (local cart / mapped order). */
  options?: OrderLineOptionsPayload
}

function LineDetails({
  options,
  note,
}: {
  options: OrderLineOptionsPayload
  note?: string | null
}) {
  const fixed = options.fixedItems ?? []
  const slots = options.slotSelections ?? []
  const selected = options.selectedOptions ?? []

  if (!orderLineHasDetails(options, note)) {
    return (
      <p className="text-xs text-muted-foreground">Sem opções adicionais.</p>
    )
  }

  return (
    <div className="space-y-3 text-sm">
      {fixed.length > 0 ? (
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Inclui
          </p>
          <ul className="space-y-1">
            {fixed.map((item) => (
              <li key={`${item.productId}-${item.name}`}>
                {item.quantity}x {item.name}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {slots.length > 0 ? (
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Escolhas
          </p>
          <ul className="space-y-1">
            {slots.map((slot) => (
              <li key={`${slot.slotId}-${slot.productId}`}>
                <span className="text-muted-foreground">
                  {slot.slotTitle || "Opção"}:{" "}
                </span>
                {slot.productName || slot.productId}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {selected.length > 0 ? (
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Acompanhamentos / opções
          </p>
          <ul className="space-y-1">
            {selected.map((opt) => (
              <li key={`${opt.productId ?? ""}-${opt.groupId}-${opt.optionId}`}>
                {opt.name}
                {opt.price > 0 ? (
                  <span className="text-muted-foreground">
                    {" "}
                    (+{formatBrl(opt.price)})
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {note?.trim() ? (
        <p>
          <span className="text-muted-foreground">Obs.: </span>
          {note.trim()}
        </p>
      ) : null}
    </div>
  )
}

function openValuesFor(
  lines: {
    id: string
    options: OrderLineOptionsPayload
    note?: string | null
  }[],
  defaultOpen: boolean
) {
  if (defaultOpen) return lines.map((line) => line.id)
  return lines
    .filter((line) => orderLineHasDetails(line.options, line.note))
    .map((line) => line.id)
}

export function OrderLinesAccordion({
  lines,
  className,
  defaultOpen = true,
}: {
  lines: OrderLineView[]
  className?: string
  /** Open all items by default so kitchen/customer always see composition. */
  defaultOpen?: boolean
}) {
  const resolved = lines.map((line) => ({
    ...line,
    options: line.options ?? parseOrderLineOptions(line.optionsJson),
  }))

  const lineIdsKey = resolved.map((line) => line.id).join("|")
  const [value, setValue] = React.useState<string[]>(() =>
    openValuesFor(resolved, defaultOpen)
  )

  React.useEffect(() => {
    setValue(openValuesFor(resolved, defaultOpen))
    // Re-sync when the set of lines changes (e.g. remote order loaded).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- lineIdsKey captures identity
  }, [lineIdsKey, defaultOpen])

  return (
    <Accordion
      multiple
      value={value}
      onValueChange={(next) => setValue(next ?? [])}
      className={cn("rounded-2xl", className)}
    >
      {resolved.map((line) => (
        <AccordionItem key={line.id} value={line.id}>
          <AccordionTrigger className="py-3.5 hover:no-underline">
            <span className="flex min-w-0 flex-1 items-start justify-between gap-3 pr-2">
              <span className="min-w-0 text-left font-medium">
                {line.quantity}x {line.name}
              </span>
              <span className="shrink-0 tabular-nums">
                {formatBrl(line.lineTotal)}
              </span>
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <LineDetails options={line.options} note={line.note} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
