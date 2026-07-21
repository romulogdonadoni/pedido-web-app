/** Brazilian mobile phone helpers for pedido-app. */

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "")
}

/** Format as (XX) XXXXX-XXXX while typing. */
export function formatBrPhoneInput(value: string) {
  const d = onlyDigits(value).slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ""
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

/** Digits with country 55 for API. */
export function toBrWhatsAppPhone(value: string) {
  let d = onlyDigits(value)
  if (d.startsWith("55") && d.length >= 12) return d
  if (d.length === 10 || d.length === 11) return `55${d}`
  return d
}

export function isValidBrMobile(value: string) {
  const d = onlyDigits(value)
  // DDD + 9 digits, or with 55
  if (d.startsWith("55")) return d.length === 12 || d.length === 13
  return d.length === 10 || d.length === 11
}
