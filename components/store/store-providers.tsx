"use client"

import { CartSheet } from "@/components/cart/cart-sheet"
import { CartProvider } from "@/lib/cart/cart-context"
import { CartSheetProvider } from "@/lib/cart/cart-sheet-context"
import type { StoreMenu } from "@/lib/menu/catalog"
import { OrdersProvider } from "@/lib/orders/orders-context"

export function StoreProviders({
  tenant,
  menu,
  children,
}: {
  tenant: string
  menu: StoreMenu
  children: React.ReactNode
}) {
  return (
    <CartProvider tenant={tenant}>
      <OrdersProvider tenant={tenant}>
        <CartSheetProvider>
          {children}
          <CartSheet menu={menu} />
        </CartSheetProvider>
      </OrdersProvider>
    </CartProvider>
  )
}
