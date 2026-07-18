import type { Metadata } from "next"

import { SearchPage } from "@/components/store/search-page"
import { requireStore } from "@/lib/store/resolve"

export const metadata: Metadata = { title: "Buscar" }

export default async function BuscaRoute() {
  const { menu } = await requireStore()
  return <SearchPage menu={menu} />
}
