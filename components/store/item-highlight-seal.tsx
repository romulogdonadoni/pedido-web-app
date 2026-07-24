import {
  highlightLabel,
  highlightSealClass,
  parseHighlightKind,
} from "@/lib/menu/highlights"
import { cn } from "@/lib/utils"

export function ItemHighlightSeal({
  highlightKind,
  className,
  size = "md",
}: {
  highlightKind?: string | null
  className?: string
  size?: "sm" | "md"
}) {
  const kind = parseHighlightKind(highlightKind)
  const label = highlightLabel(kind)
  if (!label) return null

  return (
    <span
      className={cn(
        "rounded-md font-semibold tracking-wide uppercase shadow-sm",
        highlightSealClass(kind),
        size === "sm"
          ? "px-1 py-px text-[7px]"
          : "px-1.5 py-0.5 text-[9px]",
        className
      )}
    >
      {label}
    </span>
  )
}
