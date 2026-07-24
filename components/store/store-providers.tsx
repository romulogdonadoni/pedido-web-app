"use client"

import { CartSheet } from "@/components/cart/cart-sheet"
import { BrandTheme } from "@/components/store/brand-theme"
import { CartProvider } from "@/lib/cart/cart-context"
import { CartSheetProvider } from "@/lib/cart/cart-sheet-context"
import type { StoreMenu } from "@/lib/menu/catalog"
import { OrdersProvider } from "@/lib/orders/orders-context"
import { StoreNavProvider } from "@/lib/store/nav-context"

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
    <StoreNavProvider tenant={tenant}>
      <CartProvider tenant={tenant}>
        <OrdersProvider tenant={tenant}>
          <CartSheetProvider>
            <BrandTheme
              brandColor={menu.brandColor}
              brandForegroundColor={menu.brandForegroundColor}
              brandFont={menu.brandFont}
            />
            {children}
            <CartSheet menu={menu} />
          </CartSheetProvider>
        </OrdersProvider>
      </CartProvider>
    </StoreNavProvider>
  )
}
