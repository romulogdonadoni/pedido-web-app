import type { Metadata } from "next"

import { CartPage } from "@/components/cart/cart-page"
import { requireStore } from "@/lib/store/resolve"

export const metadata: Metadata = { title: "Carrinho" }

export default async function CarrinhoRoute() {
  const { menu } = await requireStore()
  return <CartPage menu={menu} />
}
