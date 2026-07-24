/** Nearest scrollable ancestor (ScrollArea viewport, overflow container, or document). */
export function getScrollParent(el: HTMLElement): HTMLElement {
  const viewport = el.closest<HTMLElement>('[data-slot="scroll-area-viewport"]')
  if (viewport) return viewport

  let parent = el.parentElement
  while (parent) {
    const { overflowY } = getComputedStyle(parent)
    if (
      overflowY === "auto" ||
      overflowY === "scroll" ||
      overflowY === "overlay"
    ) {
      return parent
    }
    parent = parent.parentElement
  }

  return (document.scrollingElement as HTMLElement | null) ?? document.documentElement
}

/** Scroll so `el` sits below an optional sticky offset inside its scroll parent. */
export function scrollToElement(
  el: HTMLElement,
  {
    offset = 0,
    behavior = "smooth",
  }: {
    offset?: number
    behavior?: ScrollBehavior
  } = {}
) {
  const scroller = getScrollParent(el)
  const elTop = el.getBoundingClientRect().top
  const scrollerTop = scroller.getBoundingClientRect().top
  const nextTop = scroller.scrollTop + (elTop - scrollerTop) - offset

  scroller.scrollTo({ top: Math.max(0, nextTop), behavior })
}
