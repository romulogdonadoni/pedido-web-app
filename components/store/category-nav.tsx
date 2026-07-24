"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CategoryNav({
  categories,
  activeId,
}: {
  categories: string[]
  activeId?: string
}) {
  const [active, setActive] = React.useState(activeId || categories[0] || "")

  function scrollTo(cat: string) {
    setActive(cat)
    const el = document.getElementById(`cat-${slugify(cat)}`)
    el?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  React.useEffect(() => {
    const observers: IntersectionObserver[] = []
    categories.forEach((cat) => {
      const el = document.getElementById(`cat-${slugify(cat)}`)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) setActive(cat)
        },
        { rootMargin: "-28% 0px -55% 0px", threshold: 0 }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [categories])

  if (categories.length === 0) return null

  return (
    <div className="sticky top-0 z-20 border-b border-border/60 bg-background/90 py-3 backdrop-blur-md">
      <div className="flex gap-2 overflow-x-auto px-4 [-ms-overflow-style:none] [scrollbar-width:none] lg:px-6 [&::-webkit-scrollbar]:hidden">
        {categories.map((cat) => {
          const isActive = active === cat
          return (
            <Button
              key={cat}
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
