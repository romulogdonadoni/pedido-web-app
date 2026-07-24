import type { Metadata } from "next"

import { MarketplaceHome } from "@/components/marketplace/marketplace-home"

export const metadata: Metadata = {
  title: "Peça perto de você",
  description: "Restaurantes, mercados e muito mais perto de você",
}

export default function MarketplacePage() {
  return <MarketplaceHome />
}
