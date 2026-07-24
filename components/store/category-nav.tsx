"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { getScrollParent, scrollToElement } from "@/lib/dom/scroll-to-element"
import { cn } from "@/lib/utils"

export function CategoryNav({
  categories,
  activeId,
}: {
  categories: string[]
  activeId?: string
}) {
  const [active, setActive] = React.useState(activeId || categories[0] || "")
  const navRef = React.useRef<HTMLDivElement>(null)

  function scrollTo(cat: string) {
    setActive(cat)
    const el = document.getElementById(`cat-${slugify(cat)}`)
    if (!el) return
    scrollToElement(el, { offset: navRef.current?.offsetHeight ?? 0 })
  }

  React.useEffect(() => {
    const first = document.getElementById(`cat-${slugify(categories[0] ?? "")}`)
    const root = first ? getScrollParent(first) : null
    const observers: IntersectionObserver[] = []

    categories.forEach((cat) => {
      const el = document.getElementById(`cat-${slugify(cat)}`)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) setActive(cat)
        },
        {
          root: root instanceof Element ? root : null,
          rootMargin: "-20% 0px -60% 0px",
          threshold: 0,
        }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [categories])

  if (categories.length === 0) return null

  return (
    <div
      ref={navRef}
      data-slot="category-nav"
      className="sticky top-0 z-30 w-full self-start border-b border-border/60 bg-background/95 py-3 backdrop-blur-md supports-backdrop-filter:bg-background/80"
    >
      <div className="flex gap-2 overflow-x-auto px-4 [-ms-overflow-style:none] [scrollbar-width:none] lg:px-6 [&::-webkit-scrollbar]:hidden">
        {categories.map((cat) => {
          const isActive = active === cat
          return (
            <Button
              key={cat}
              type="button"
              size="sm"
              variant={isActive ? "default" : "outline"}
              className={cn(
                "h-9 shrink-0 rounded-full px-4 text-xs font-semibold tracking-wide uppercase",
                !isActive && "border-border/70 bg-transparent text-muted-foreground"
              )}
              onClick={() => scrollTo(cat)}
            >
              {cat}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}
