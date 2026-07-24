/** Subtle add-to-cart click via Web Audio. No-op if reduced motion or Audio fails. */
export function playAddToCartSound() {
  if (typeof window === "undefined") return
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!AudioCtx) return

    const ctx = new AudioCtx()
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = "sine"
    osc.frequency.setValueAtTime(880, now)
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.06)

    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.045, now + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.12)

    osc.onended = () => {
      void ctx.close().catch(() => undefined)
    }
  } catch {
    // Ignore autoplay / AudioContext errors
  }
}
