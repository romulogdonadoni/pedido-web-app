import type { Metadata } from "next"

import { StoreProfile } from "@/components/store/store-profile"
import { requireStore } from "@/lib/store/resolve"

export const metadata: Metadata = { title: "Perfil da loja" }

export default async function PerfilRoute() {
  const { menu } = await requireStore()
  return <StoreProfile menu={menu} />
}
