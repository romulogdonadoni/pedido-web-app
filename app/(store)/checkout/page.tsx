import type { Metadata } from "next"

import { CheckoutPage } from "@/components/checkout/checkout-page"
import { requireStore } from "@/lib/store/resolve"

export const metadata: Metadata = { title: "Checkout" }

export default async function CheckoutRoute() {
  const { menu } = await requireStore()
  return <CheckoutPage menu={menu} />
}
