import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { MenuHome } from "@/components/store/menu-home"
import { fetchStoreMenu } from "@/lib/menu/fetch-store-menu"
import { isValidTenantSlug } from "@/lib/tenant/host"

export const metadata: Metadata = {
  title: "Cardápio",
}

type Props = { params: Promise<{ tenant: string }> }

export default async function StoreHomePage({ params }: Props) {
  const { tenant: raw } = await params
  const tenant = raw.trim().toLowerCase()
  if (!isValidTenantSlug(tenant)) notFound()

  const menu = await fetchStoreMenu(tenant)
  if (!menu) notFound()

  return <MenuHome menu={menu} />
}
