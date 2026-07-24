import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { SearchPage } from "@/components/store/search-page"
import { fetchStoreMenu } from "@/lib/menu/fetch-store-menu"
import { isValidTenantSlug } from "@/lib/tenant/host"

export const metadata: Metadata = { title: "Buscar" }

type Props = { params: Promise<{ tenant: string }> }

export default async function BuscaRoute({ params }: Props) {
  const { tenant: raw } = await params
  const tenant = raw.trim().toLowerCase()
  if (!isValidTenantSlug(tenant)) notFound()

  const menu = await fetchStoreMenu(tenant)
  if (!menu) notFound()

  return <SearchPage menu={menu} />
}
