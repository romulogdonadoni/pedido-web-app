"use client"

import { useLayoutEffect } from "react"

import {
  brandFontStylesheetHref,
  resolveBrandFont,
} from "@/lib/store/brand-fonts"

/**
 * Aplica cores e fonte da marca no <html> para que Dialog/Sheet (portais no body)
 * herdem --primary / tipografia em vez do tema padrão.
 */
export function BrandTheme({
  brandColor,
  brandForegroundColor,
  brandFont,
}: {
  brandColor?: string | null
  brandForegroundColor?: string | null
  brandFont?: string | null
}) {
  const font = resolveBrandFont(brandFont)

  useLayoutEffect(() => {
    const root = document.documentElement
    const prevPrimary = root.style.getPropertyValue("--primary")
    const prevForeground = root.style.getPropertyValue("--primary-foreground")
    const prevRing = root.style.getPropertyValue("--ring")
    const prevFont = root.style.getPropertyValue("--font-sans")
    const prevFontFamily = root.style.fontFamily

    if (brandColor) {
      root.style.setProperty("--primary", brandColor)
      root.style.setProperty("--ring", brandColor)
    }
    if (brandForegroundColor) {
      root.style.setProperty("--primary-foreground", brandForegroundColor)
    }
    if (font.id !== "geist") {
      root.style.setProperty("--font-sans", font.family)
      root.style.fontFamily = font.family
    }

    return () => {
      if (brandColor) {
        if (prevPrimary) root.style.setProperty("--primary", prevPrimary)
        else root.style.removeProperty("--primary")
        if (prevRing) root.style.setProperty("--ring", prevRing)
        else root.style.removeProperty("--ring")
      }
      if (brandForegroundColor) {
        if (prevForeground)
          root.style.setProperty("--primary-foreground", prevForeground)
        else root.style.removeProperty("--primary-foreground")
      }
      if (font.id !== "geist") {
        if (prevFont) root.style.setProperty("--font-sans", prevFont)
        else root.style.removeProperty("--font-sans")
        root.style.fontFamily = prevFontFamily
      }
    }
  }, [brandColor, brandForegroundColor, font.family, font.id])

  const href = brandFontStylesheetHref(brandFont)
  const css = [
    brandColor ? `--primary:${brandColor};--ring:${brandColor};` : "",
    brandForegroundColor
      ? `--primary-foreground:${brandForegroundColor};`
      : "",
    font.id !== "geist" ? `--font-sans:${font.family};` : "",
  ]
    .filter(Boolean)
    .join("")

  return (
    <>
      {href ? (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link rel="stylesheet" href={href} />
        </>
      ) : null}
      {css ? (
        <style
          dangerouslySetInnerHTML={{
            __html: `html,html.dark{${css}${font.id !== "geist" ? `font-family:${font.family};` : ""}}`,
          }}
        />
      ) : null}
    </>
  )
}
