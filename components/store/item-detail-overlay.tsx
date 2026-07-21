"use client"

import * as React from "react"

import { ItemDetailDialog } from "@/components/store/item-detail-dialog"
import { ItemDetailSheet } from "@/components/store/item-detail-sheet"
import type { MenuItem, StoreMenu } from "@/lib/menu/catalog"

const MOBILE_MQ = "(max-width: 639px)"

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | null>(null)

  React.useEffect(() => {
    const media = window.matchMedia(MOBILE_MQ)
    const sync = () => setIsMobile(media.matches)
    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [])

  return isMobile
}

/** Picks Sheet (mobile) or Dialog (desktop) — no shared body component. */
export function ItemDetailOverlay({
  menu,
  item,
  open,
  onOpenChange,
}: {
  menu: StoreMenu
  item: MenuItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const isMobile = useIsMobile()

  if (isMobile === null) return null

  if (isMobile) {
    return (
      <ItemDetailSheet
        menu={menu}
        item={item}
        open={open}
        onOpenChange={onOpenChange}
      />
    )
  }

  return (
    <ItemDetailDialog
      menu={menu}
      item={item}
      open={open}
      onOpenChange={onOpenChange}
    />
  )
}
