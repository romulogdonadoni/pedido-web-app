import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { StoreProfile } from "@/components/store/store-profile"
import { fetchStoreMenu } from "@/lib/menu/fetch-store-menu"
import { isValidTenantSlug } from "@/lib/tenant/host"

export const metadata: Metadata = { title: "Perfil da loja" }

type Props = { params: Promise<{ tenant: string }> }

export default async function PerfilRoute({ params }: Props) {
  const { tenant: raw } = await params
  const tenant = raw.trim().toLowerCase()
  if (!isValidTenantSlug(tenant)) notFound()

  const menu = await fetchStoreMenu(tenant)
  if (!menu) notFound()

  return <StoreProfile menu={menu} />
}
