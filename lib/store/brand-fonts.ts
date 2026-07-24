export type BrandFontPreset = {
  id: string
  label: string
  /** CSS font-family stack */
  family: string
  /** Google Fonts CSS2 family param, or null for system/Geist */
  googleFamily: string | null
}

export const BRAND_FONT_PRESETS: BrandFontPreset[] = [
  {
    id: "geist",
    label: "Geist (padrão)",
    family: "var(--font-sans), ui-sans-serif, system-ui, sans-serif",
    googleFamily: null,
  },
  {
    id: "dm-sans",
    label: "DM Sans",
    family: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
    googleFamily: "DM+Sans:wght@400;500;600;700",
  },
  {
    id: "inter",
    label: "Inter",
    family: '"Inter", ui-sans-serif, system-ui, sans-serif',
    googleFamily: "Inter:wght@400;500;600;700",
  },
  {
    id: "outfit",
    label: "Outfit",
    family: '"Outfit", ui-sans-serif, system-ui, sans-serif',
    googleFamily: "Outfit:wght@400;500;600;700",
  },
  {
    id: "manrope",
    label: "Manrope",
    family: '"Manrope", ui-sans-serif, system-ui, sans-serif',
    googleFamily: "Manrope:wght@400;500;600;700",
  },
  {
    id: "plus-jakarta",
    label: "Plus Jakarta Sans",
    family: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
    googleFamily: "Plus+Jakarta+Sans:wght@400;500;600;700",
  },
  {
    id: "poppins",
    label: "Poppins",
    family: '"Poppins", ui-sans-serif, system-ui, sans-serif',
    googleFamily: "Poppins:wght@400;500;600;700",
  },
  {
    id: "montserrat",
    label: "Montserrat",
    family: '"Montserrat", ui-sans-serif, system-ui, sans-serif',
    googleFamily: "Montserrat:wght@400;500;600;700",
  },
  {
    id: "space-grotesk",
    label: "Space Grotesk",
    family: '"Space Grotesk", ui-sans-serif, system-ui, sans-serif',
    googleFamily: "Space+Grotesk:wght@400;500;600;700",
  },
  {
    id: "rubik",
    label: "Rubik",
    family: '"Rubik", ui-sans-serif, system-ui, sans-serif',
    googleFamily: "Rubik:wght@400;500;600;700",
  },
  {
    id: "nunito",
    label: "Nunito",
    family: '"Nunito", ui-sans-serif, system-ui, sans-serif',
    googleFamily: "Nunito:wght@400;600;700",
  },
  {
    id: "lato",
    label: "Lato",
    family: '"Lato", ui-sans-serif, system-ui, sans-serif',
    googleFamily: "Lato:wght@400;700",
  },
  {
    id: "raleway",
    label: "Raleway",
    family: '"Raleway", ui-sans-serif, system-ui, sans-serif',
    googleFamily: "Raleway:wght@400;500;600;700",
  },
  {
    id: "barlow",
    label: "Barlow",
    family: '"Barlow", ui-sans-serif, system-ui, sans-serif',
    googleFamily: "Barlow:wght@400;500;600;700",
  },
  {
    id: "cabin",
    label: "Cabin",
    family: '"Cabin", ui-sans-serif, system-ui, sans-serif',
    googleFamily: "Cabin:wght@400;500;600;700",
  },
  {
    id: "bebas-neue",
    label: "Bebas Neue",
    family: '"Bebas Neue", ui-sans-serif, system-ui, sans-serif',
    googleFamily: "Bebas+Neue",
  },
  {
    id: "fraunces",
    label: "Fraunces",
    family: '"Fraunces", ui-serif, Georgia, serif',
    googleFamily: "Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700",
  },
  {
    id: "playfair",
    label: "Playfair Display",
    family: '"Playfair Display", ui-serif, Georgia, serif',
    googleFamily: "Playfair+Display:wght@400;600;700",
  },
  {
    id: "libre-baskerville",
    label: "Libre Baskerville",
    family: '"Libre Baskerville", ui-serif, Georgia, serif',
    googleFamily: "Libre+Baskerville:wght@400;700",
  },
  {
    id: "source-serif",
    label: "Source Serif 4",
    family: '"Source Serif 4", ui-serif, Georgia, serif',
    googleFamily: "Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700",
  },
  {
    id: "lora",
    label: "Lora",
    family: '"Lora", ui-serif, Georgia, serif',
    googleFamily: "Lora:wght@400;500;600;700",
  },
  {
    id: "merriweather",
    label: "Merriweather",
    family: '"Merriweather", ui-serif, Georgia, serif',
    googleFamily: "Merriweather:wght@400;700",
  },
  {
    id: "cormorant",
    label: "Cormorant Garamond",
    family: '"Cormorant Garamond", ui-serif, Georgia, serif',
    googleFamily: "Cormorant+Garamond:wght@400;500;600;700",
  },
  {
    id: "instrument-serif",
    label: "Instrument Serif",
    family: '"Instrument Serif", ui-serif, Georgia, serif',
    googleFamily: "Instrument+Serif:wght@400;400i",
  },
  {
    id: "bitter",
    label: "Bitter",
    family: '"Bitter", ui-serif, Georgia, serif',
    googleFamily: "Bitter:wght@400;500;600;700",
  },
]

export function resolveBrandFont(id?: string | null): BrandFontPreset {
  if (!id) return BRAND_FONT_PRESETS[0]!
  return (
    BRAND_FONT_PRESETS.find((p) => p.id === id.toLowerCase()) ??
    BRAND_FONT_PRESETS[0]!
  )
}

export function brandFontStylesheetHref(id?: string | null): string | null {
  const preset = resolveBrandFont(id)
  if (!preset.googleFamily) return null
  return `https://fonts.googleapis.com/css2?family=${preset.googleFamily}&display=swap`
}
