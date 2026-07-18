"use client"

import * as React from "react"
import { Dialog } from "@base-ui/react/dialog"

type CartHandle = ReturnType<typeof Dialog.createHandle>

type CartSheetContextValue = {
  handle: CartHandle
  open: boolean
  setOpen: (open: boolean) => void
  openCart: () => void
  closeCart: () => void
}

const CartSheetContext = React.createContext<CartSheetContextValue | null>(null)

export function CartSheetProvider({ children }: { children: React.ReactNode }) {
  const handle = React.useRef(Dialog.createHandle()).current
  const [open, setOpen] = React.useState(false)

  const openCart = React.useCallback(() => {
    handle.open(null)
    setOpen(true)
  }, [handle])

  const closeCart = React.useCallback(() => {
    handle.close()
    setOpen(false)
  }, [handle])

  const value = React.useMemo(
    () => ({ handle, open, setOpen, openCart, closeCart }),
    [handle, open, openCart, closeCart]
  )

  return (
    <CartSheetContext.Provider value={value}>{children}</CartSheetContext.Provider>
  )
}

export function useCartSheet() {
  const ctx = React.useContext(CartSheetContext)
  if (!ctx) {
    throw new Error("useCartSheet must be used within CartSheetProvider")
  }
  return ctx
}
