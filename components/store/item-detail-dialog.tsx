"use client"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { XIcon } from "lucide-react"
import * as React from "react"

import { ItemDetail } from "@/components/store/item-detail"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogOverlay,
  DialogPortal,
  DialogViewport,
} from "@/components/ui/dialog"
import type { MenuItem, StoreMenu } from "@/lib/menu/catalog"
import { cn } from "@/lib/utils"

export function ItemDetailDialog({
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
  // Keep content mounted while the close animation runs
  const [displayItem, setDisplayItem] = React.useState(item)

  React.useEffect(() => {
    if (item) setDisplayItem(item)
  }, [item])

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={(isOpen) => {
        if (!isOpen) setDisplayItem(null)
      }}
    >
      <DialogPortal>
        <DialogOverlay
          className={cn(
            "transition-opacity duration-[300ms] ease-out",
            "data-starting-style:opacity-0 data-ending-style:opacity-0"
          )}
        />
        <DialogViewport
          className={cn(
            "flex items-end justify-center outline-none",
            "sm:items-center sm:p-6",
            "[@media(min-height:700px)]:sm:py-8"
          )}
        >
          <DialogPrimitive.Popup
            data-slot="item-detail-dialog"
            className={cn(
              "relative flex w-full flex-col overflow-hidden bg-popover text-popover-foreground shadow-2xl outline-none",
              "transition-[translate,opacity,transform] duration-[400ms] ease-[cubic-bezier(0.32,0.72,0,1)]",
              "motion-reduce:transition-none",
              // Fixed sizes per breakpoint
              "h-[92dvh] rounded-t-3xl",
              "sm:h-[min(88dvh,52rem)] sm:w-full sm:max-w-3xl sm:rounded-3xl sm:duration-[220ms] sm:ease-out",
              "sm:ring-1 sm:ring-foreground/5 dark:sm:ring-foreground/10",
              // Mobile: slide up / down
              "data-starting-style:translate-y-full data-starting-style:opacity-0",
              "data-ending-style:translate-y-full data-ending-style:opacity-0",
              // Desktop overrides
              "sm:data-starting-style:translate-y-3 sm:data-starting-style:scale-[0.97]",
              "sm:data-ending-style:translate-y-3 sm:data-ending-style:scale-[0.97]"
            )}
          >
            <div
              className="flex shrink-0 justify-center pt-2.5 pb-1 sm:hidden"
              aria-hidden
            >
              <span className="h-1 w-10 rounded-full bg-muted-foreground/25" />
            </div>

            <DialogClose
              aria-label="Fechar"
              render={
                <Button
                  variant="secondary"
                  size="icon-sm"
                  className={cn(
                    "absolute z-20 size-9 rounded-full shadow-sm",
                    "top-3 right-3 sm:top-4 sm:right-4",
                    "bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/75"
                  )}
                />
              }
            >
              <XIcon className="size-4" />
            </DialogClose>

            {displayItem ? (
              <ItemDetail
                key={displayItem.id}
                menu={menu}
                item={displayItem}
                onClose={() => onOpenChange(false)}
              />
            ) : null}
          </DialogPrimitive.Popup>
        </DialogViewport>
      </DialogPortal>
    </Dialog>
  )
}
