import type { LucideIcon } from "lucide-react"
import { icons } from "lucide-react"

/** Resolve a Lucide icon by PascalCase name (e.g. "Flame", "CupSoda"). */
export function resolveMenuSectionIcon(
  name: string | null | undefined
): LucideIcon | null {
  if (!name?.trim()) return null
  const key = name.trim()
  const Icon = (icons as Record<string, LucideIcon | undefined>)[key]
  return Icon ?? null
}
