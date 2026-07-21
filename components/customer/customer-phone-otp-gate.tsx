"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  saveCustomerSession,
  sendCustomerOtp,
  verifyCustomerOtp,
  type CustomerSession,
} from "@/lib/customer/api"
import {
  formatBrPhoneInput,
  isValidBrMobile,
} from "@/lib/phone/br"

type Step = "phone" | "otp"

export function CustomerPhoneOtpGate({
  tenant,
  title = "Identificação",
  description = "Confirme seu WhatsApp para ver fidelidade, promoções e seus pedidos nesta loja.",
  onVerified,
}: {
  tenant: string
  title?: string
  description?: string
  onVerified: (session: CustomerSession) => void
}) {
  const [step, setStep] = React.useState<Step>("phone")
  const [phone, setPhone] = React.useState("")
  const [phoneDisplay, setPhoneDisplay] = React.useState("")
  const [otpCode, setOtpCode] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  async function sendOtp(e?: React.FormEvent) {
    e?.preventDefault()
    setError(null)
    if (!isValidBrMobile(phone)) {
      setError("Informe um telefone válido com DDD.")
      return
    }
    setSubmitting(true)
    try {
      const result = await sendCustomerOtp(tenant, phone)
      setPhoneDisplay(result.phoneDisplay)
      setOtpCode("")
      setStep("otp")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao enviar código.")
    } finally {
      setSubmitting(false)
    }
  }

  async function confirmOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!/^\d{4,8}$/.test(otpCode.trim())) {
      setError("Digite o código recebido no WhatsApp.")
      return
    }
    setSubmitting(true)
    try {
      const result = await verifyCustomerOtp(tenant, phone, otpCode)
      const next: CustomerSession = {
        token: result.token,
        phone: result.profile.phone,
        expiresAtUtc: result.expiresAtUtc,
        profile: result.profile,
      }
      saveCustomerSession(tenant, next)
      onVerified(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Código inválido.")
    } finally {
      setSubmitting(false)
    }
  }

  if (step === "otp") {
    return (
      <form onSubmit={confirmOtp} className="mx-auto max-w-md space-y-5 px-4 py-6 lg:px-6">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">
            Enviamos um código para{" "}
            <span className="font-medium text-foreground">
              {phoneDisplay || phone}
            </span>{" "}
            no WhatsApp.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="orders-otp">Código</Label>
          <Input
            id="orders-otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            value={otpCode}
            onChange={(e) =>
              setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 8))
            }
            className="text-center text-lg tracking-[0.3em]"
            required
          />
        </div>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Validando…" : "Confirmar"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          disabled={submitting}
          onClick={() => {
            setError(null)
            setStep("phone")
          }}
        >
          Trocar número
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          disabled={submitting}
          onClick={() => void sendOtp()}
        >
          Reenviar código
        </Button>
      </form>
    )
  }

  return (
    <form onSubmit={sendOtp} className="mx-auto max-w-md space-y-5 px-4 py-6 lg:px-6">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="orders-phone">Telefone</Label>
        <Input
          id="orders-phone"
          inputMode="tel"
          autoComplete="tel"
          placeholder="(21) 99865-2091"
          value={phone}
          onChange={(e) => setPhone(formatBrPhoneInput(e.target.value))}
          required
        />
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Enviando…" : "Receber código no WhatsApp"}
      </Button>
    </form>
  )
}
