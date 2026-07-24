export type ItemHighlightKind = "none" | "signature" | "chef" | "daily"

export function parseHighlightKind(raw?: string | null): ItemHighlightKind {
  const v = (raw ?? "none").trim().toLowerCase()
  if (v === "signature" || v === "chef" || v === "daily") return v
  return "none"
}

export function highlightLabel(kind: ItemHighlightKind): string | null {
  switch (kind) {
    case "signature":
      return "Assinatura"
    case "chef":
      return "Do chef"
    case "daily":
      return "Combo do dia"
    default:
      return null
  }
}

export function highlightSealClass(kind: ItemHighlightKind): string {
  switch (kind) {
    case "signature":
      return "bg-primary text-primary-foreground"
    case "chef":
      return "bg-foreground text-background"
    case "daily":
      return "bg-amber-600 text-white dark:bg-amber-500"
    default:
      return "bg-foreground text-background"
  }
}
