export function OfflineBar({ isOpen }: { isOpen: boolean }) {
  if (isOpen) return null
  return (
    <div className="bg-foreground px-4 py-2 text-center text-sm font-medium text-background">
      Loja offline
    </div>
  )
}
