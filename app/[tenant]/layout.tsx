import type { CSSProperties } from "react"
import { notFound } from "next/navigation"

import { BottomNav } from "@/components/store/bottom-nav"
import { DesktopNav } from "@/components/store/desktop-nav"
import { OfflineBar } from "@/components/store/offline-bar"
import { StoreProviders } from "@/components/store/store-providers"
import { ScrollArea } from "@/components/ui/scroll-area"
import { fetchStoreMenu } from "@/lib/menu/fetch-store-menu"
import { isValidTenantSlug } from "@/lib/tenant/host"

type Props = {
  children: React.ReactNode
  params: Promise<{ tenant: string }>
}

export default async function StoreLayout({ children, params }: Props) {
  const { tenant: raw } = await params
  const tenant = raw.trim().toLowerCase()
  if (!isValidTenantSlug(tenant)) notFound()

  const menu = await fetchStoreMenu(tenant)
  if (!menu) notFound()

  const brandStyle: CSSProperties | undefined =
    menu.brandColor || menu.brandForegroundColor
      ? {
          ...(menu.brandColor
            ? { ["--primary" as string]: menu.brandColor }
            : null),
          ...(menu.brandForegroundColor
            ? {
                ["--primary-foreground" as string]: menu.brandForegroundColor,
              }
            : null),
        }
      : undefined

  return (
    <StoreProviders tenant={tenant} menu={menu}>
      <ScrollArea
        className="h-0 min-h-svh bg-background-secondary lg:bg-background-secondary"
        style={brandStyle}
      >
        <OfflineBar isOpen={menu.isOpen} />
        <div className="mx-auto flex w-full max-w-7xl flex-col lg:min-h-[calc(100svh-3rem)] lg:p-6">
          <DesktopNav storeName={menu.name} />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-background pb-14 lg:rounded-3xl lg:border lg:pb-0 lg:shadow-sm">
            {children}
          </div>
        </div>
        <BottomNav />
      </ScrollArea>
    </StoreProviders>
  )
}
