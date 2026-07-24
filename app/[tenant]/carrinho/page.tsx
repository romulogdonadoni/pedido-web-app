import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { CartPage } from "@/components/cart/cart-page"
import { fetchStoreMenu } from "@/lib/menu/fetch-store-menu"
import { isValidTenantSlug } from "@/lib/tenant/host"

export const metadata: Metadata = { title: "Carrinho" }

type Props = { params: Promise<{ tenant: string }> }

export default async function CarrinhoRoute({ params }: Props) {
  const { tenant: raw } = await params
  const tenant = raw.trim().toLowerCase()
  if (!isValidTenantSlug(tenant)) notFound()

  const menu = await fetchStoreMenu(tenant)
  if (!menu) notFound()

  return <CartPage menu={menu} />
}
