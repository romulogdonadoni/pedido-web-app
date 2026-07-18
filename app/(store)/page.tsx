import type { Metadata } from "next"

import { MenuHome } from "@/components/store/menu-home"
import { requireStore } from "@/lib/store/resolve"

export const metadata: Metadata = {
  title: "Cardápio",
}

export default async function HomePage() {
  const { menu } = await requireStore()
  return <MenuHome menu={menu} />
}
