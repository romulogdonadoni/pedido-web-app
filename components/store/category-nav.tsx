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
        { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [categories])

  return (
    <div className="sticky top-0 border-b bg-background/95 px-4 py-3 backdrop-blur lg:px-0">
      <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((cat) => (
          <Button
            key={cat}
            size="sm"
            variant={active === cat ? "default" : "secondary"}
            className={cn(
              "shrink-0 rounded-full",
              active === cat && "shadow-sm"
            )}
            onClick={() => scrollTo(cat)}
          >
            {cat}
          </Button>
        ))}
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
