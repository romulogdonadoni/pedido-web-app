"use client"

import * as React from "react"

import {
  cartQty,
  cartSubtotal,
  lineUnitPrice,
  makeLineKey,
  type CartFixedItem,
  type CartLine,
  type SelectedOption,
  type SlotSelection,
} from "@/lib/cart/types"

const STORAGE_PREFIX = "whitelabel.pedido.cart."

type CartContextValue = {
  tenant: string
  lines: CartLine[]
  qty: number
  subtotal: number
  hydrated: boolean
  addItem: (input: {
    itemId: string
    name: string
    image?: string
    basePrice: number
    selectedOptions: SelectedOption[]
    note?: string
    qty?: number
    productGroupId?: string
    slotSelections?: SlotSelection[]
    fixedItems?: CartFixedItem[]
  }) => void
  setQty: (key: string, qty: number) => void
  setNote: (key: string, note: string) => void
  removeLine: (key: string) => void
  clear: () => void
}

const CartContext = React.createContext<CartContextValue | null>(null)

function loadCart(tenant: string): CartLine[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${tenant}`)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartLine[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveCart(tenant: string, lines: CartLine[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(`${STORAGE_PREFIX}${tenant}`, JSON.stringify(lines))
}

export function CartProvider({
  tenant,
  children,
}: {
  tenant: string
  children: React.ReactNode
}) {
  const [lines, setLines] = React.useState<CartLine[]>([])
  const [hydrated, setHydrated] = React.useState(false)

  React.useEffect(() => {
    setLines(loadCart(tenant))
    setHydrated(true)
  }, [tenant])

  React.useEffect(() => {
    if (!hydrated) return
    saveCart(tenant, lines)
  }, [tenant, lines, hydrated])

  const addItem: CartContextValue["addItem"] = React.useCallback(
    (input) => {
      const selectedOptions = input.selectedOptions
      const slotSelections = input.slotSelections
      const note = input.note?.trim() || undefined
      const key = makeLineKey(
        input.itemId,
        selectedOptions,
        note,
        input.productGroupId,
        slotSelections
      )
      const unitPrice = lineUnitPrice(input.basePrice, selectedOptions)
      const addQty = input.qty ?? 1

      setLines((prev) => {
        const existing = prev.find((line) => line.key === key)
        if (existing) {
          return prev.map((line) =>
            line.key === key ? { ...line, qty: line.qty + addQty } : line
          )
        }
        return [
          ...prev,
          {
            key,
            itemId: input.itemId,
            name: input.name,
            image: input.image,
            qty: addQty,
            basePrice: input.basePrice,
            selectedOptions,
            note,
            unitPrice,
            productGroupId: input.productGroupId,
            slotSelections,
            fixedItems: input.fixedItems,
          },
        ]
      })
    },
    []
  )

  const setQty = React.useCallback((key: string, qty: number) => {
    setLines((prev) => {
      if (qty <= 0) return prev.filter((line) => line.key !== key)
      return prev.map((line) => (line.key === key ? { ...line, qty } : line))
    })
  }, [])

  const setNote = React.useCallback((key: string, note: string) => {
    setLines((prev) =>
      prev.map((line) =>
        line.key === key ? { ...line, note: note.trim() || undefined } : line
      )
    )
  }, [])

  const removeLine = React.useCallback((key: string) => {
    setLines((prev) => prev.filter((line) => line.key !== key))
  }, [])

  const clear = React.useCallback(() => setLines([]), [])

  const value: CartContextValue = {
    tenant,
    lines,
    qty: cartQty(lines),
    subtotal: cartSubtotal(lines),
    hydrated,
    addItem,
    setQty,
    setNote,
    removeLine,
    clear,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = React.useContext(CartContext)
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider")
  }
  return ctx
}
