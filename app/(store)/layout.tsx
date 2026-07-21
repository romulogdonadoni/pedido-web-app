import { BottomNav } from "@/components/store/bottom-nav"
import { DesktopNav } from "@/components/store/desktop-nav"
import { OfflineBar } from "@/components/store/offline-bar"
import { StoreProviders } from "@/components/store/store-providers"
import { ScrollArea } from "@/components/ui/scroll-area"
import { resolveStore } from "@/lib/store/resolve"

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const store = await resolveStore()

  if (!store) return

  return (
    <StoreProviders tenant={store.tenant} menu={store.menu}>
      <ScrollArea className="h-0 min-h-svh bg-background lg:bg-background-secondary">
        <OfflineBar isOpen={store.menu.isOpen} />
        <div className="mx-auto flex w-full max-w-7xl flex-col lg:min-h-[calc(100svh-3rem)] lg:p-6">
          <DesktopNav storeName={store.menu.name} />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-background pb-14 lg:rounded-3xl lg:border lg:pb-0 lg:shadow-sm">
            {children}
          </div>
        </div>
        <BottomNav />
      </ScrollArea>
    </StoreProviders>
  )
}
