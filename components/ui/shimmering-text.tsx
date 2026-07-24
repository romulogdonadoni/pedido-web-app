"use client"

import type * as React from "react"

import { cn } from "@/lib/utils"

type ShimmeringTextProps = {
  text: string
  duration?: number
  wave?: boolean
  color?: string
  shimmeringColor?: string
} & React.ComponentProps<"span">

/**
 * Text shine via CSS background-clip (Motion cannot tween oklch/lab CSS vars).
 * @see https://motion.dev/troubleshooting/color-not-animatable
 */
function ShimmeringText({
  text,
  duration = 1.6,
  className,
  color = "var(--foreground)",
  shimmeringColor = "var(--primary)",
  style,
  ...props
}: ShimmeringTextProps) {
  return (
    <span
      className={cn("shimmering-text inline-block", className)}
      style={
        {
          "--shimmer-base": color,
          "--shimmer-highlight": shimmeringColor,
          "--shimmer-duration": `${duration}s`,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {text}
    </span>
  )
}

export { ShimmeringText, type ShimmeringTextProps }
export default ShimmeringText
