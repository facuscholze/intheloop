"use client"

import { useEffect, useId, useRef, useState } from "react"
import Script from "next/script"
import { useLocale, useTranslations } from "next-intl"
import {
  BOOKING_LIMITS,
  BOOKING_MIN_LENGTHS,
  EMPTY_BOOKING_FORM,
  bookingErrorMessageKey,
  buildBookingPayload,
  createBookingSubmitter,
  isCaptchaTokenValid,
  validateBooking
} from "@/lib/booking"
import type { BookingFailureReason, BookingField, BookingValues } from "@/lib/booking"
import { WEB3FORMS_CLIENT_SCRIPT } from "@/lib/booking-config"

type Status = "idle" | "sending" | "success" | "error"
type CaptchaState = "loading" | "ready" | "error"

type HCaptchaGlobal = { reset: (widgetId?: string) => void }

/** Selector documentado por Web3Forms para leer el token de hCaptcha. */
const CAPTCHA_TOKEN_SELECTOR =
  'textarea[name="h-captcha-response"], input[name="h-captcha-response"]'

export function BookingForm({ contactEmail }: { contactEmail: string }) {
  // next-intl: textos es/en del formulario (antes estaban hardcodeados en español).
  // El cast mantiene las claves dinámicas sin perder el tipado del proveedor.
  const translate = useTranslations("booking.form") as unknown as (
    key: string,
    values?: Record<string, string>
  ) => string
  const locale = useLocale()

  const [form, setForm] = useState<BookingValues>(EMPTY_BOOKING_FORM)
  const [errors, setErrors] = useState<Partial<Record<BookingField, string>>>({})
  const [status, setStatus] = useState<Status>("idle")
  const [failure, setFailure] = useState<BookingFailureReason | null>(null)
  const [captchaState, setCaptchaState] = useState<CaptchaState>("loading")
  const formId = useId()

  const formRef = useRef<HTMLFormElement>(null)
  const captchaRef = useRef<HTMLDivElement>(null)
  const submitterRef = useRef<ReturnType<typeof createBookingSubmitter> | null>(null)
  if (!submitterRef.current) submitterRef.current = createBookingSubmitter()

  /**
   * La integración gratuita oficial de Web3Forms inyecta hCaptcha con
   * `https://web3forms.com/client/script.js`. El widget tarda en aparecer (el
   * script carga a su vez `js.hcaptcha.com`), así que detectamos que ya renderizó
   * y, si no aparece, mostramos un error localizado en vez de dejar un botón
   * que nunca puede enviar. No hay CSP ni headers custom en el export estático.
   */
  useEffect(() => {
    let attempts = 0
    const isRendered = () =>
      Boolean(captchaRef.current?.querySelector('textarea[name="h-captcha-response"], iframe'))

    if (isRendered()) {
      setCaptchaState("ready")
      return
    }

    const interval = window.setInterval(() => {
      attempts += 1
      if (isRendered()) {
        setCaptchaState("ready")
        window.clearInterval(interval)
      } else if (attempts >= 60) {
        setCaptchaState("error")
        window.clearInterval(interval)
      }
    }, 250)

    return () => window.clearInterval(interval)
  }, [])

  const readCaptchaToken = () =>
    formRef.current?.querySelector<HTMLTextAreaElement | HTMLInputElement>(CAPTCHA_TOKEN_SELECTOR)
      ?.value ?? ""

  const clearCaptchaToken = () => {
    const node = formRef.current?.querySelector<HTMLTextAreaElement | HTMLInputElement>(
      CAPTCHA_TOKEN_SELECTOR
    )
    if (node) node.value = ""
    try {
      if (typeof window === "undefined") return
      const hcaptcha = (window as Window & { hcaptcha?: HCaptchaGlobal }).hcaptcha
      hcaptcha?.reset()
    } catch {
      // Si el SDK no está disponible, el token ya se limpió arriba.
    }
  }

  const focusCaptcha = () => captchaRef.current?.focus()

  const handleChange = (field: keyof BookingValues, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field as BookingField]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
    // Si hubo un error, se conserva todo lo escrito y se limpia sólo el aviso.
    if (status === "error") {
      setStatus("idle")
      setFailure(null)
    }
  }

  const resetForm = () => {
    setForm(EMPTY_BOOKING_FORM)
    setErrors({})
    setFailure(null)
    setStatus("idle")
    // El form estaba oculto durante el éxito: se resetea el widget en el
    // siguiente tick, cuando ya volvió a ser visible para hCaptcha.
    window.setTimeout(() => clearCaptchaToken(), 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const submitter = submitterRef.current!
    if (status === "sending" || submitter.busy) return

    setFailure(null)
    setErrors({})

    const validation = validateBooking(form)
    if (!validation.ok) {
      if (validation.blocked) {
        // Honeypot: no se envía nada ni se finge un éxito.
        return
      }
      setErrors(validation.errors)
      if (validation.firstField) {
        document.getElementById(`${formId}-${validation.firstField}`)?.focus()
      }
      return
    }

    if (captchaState === "error") {
      setFailure("captcha-load")
      focusCaptcha()
      return
    }

    const token = readCaptchaToken()
    if (!isCaptchaTokenValid(token)) {
      setFailure("captcha-missing")
      focusCaptcha()
      return
    }

    setStatus("sending")
    try {
      const result = await submitter.submit(buildBookingPayload(validation.data, token))
      if (result.ok) {
        // Éxito SÓLO cuando Web3Forms respondió 2xx + success:true.
        setStatus("success")
        setFailure(null)
        clearCaptchaToken()
        return
      }
      if (result.reason === "in-flight") {
        setStatus("idle")
        return
      }
      setStatus("error")
      setFailure(result.reason)
      clearCaptchaToken()
    } catch {
      setStatus("error")
      setFailure("unknown")
      clearCaptchaToken()
    }
  }

  const failureKey = failure ? bookingErrorMessageKey(failure) : null
  const failureText = failureKey ? translate(`errors.${failureKey}`, { email: contactEmail }) : ""

  return (
    <>
      {status === "success" && (
        <div
          className="rounded-[2rem] border border-[var(--accent-lime)] bg-[var(--accent-lime)]/10 p-8 text-center"
          role="alert"
          aria-live="polite"
        >
          <div className="font-display text-2xl font-bold text-[var(--accent-lime)]">
            {translate("success.title")}
          </div>
          <div className="mt-2 font-mono text-xs tracking-widest text-[var(--fg-muted)] uppercase">
            {translate("success.body", { name: form.name })}
          </div>
          <button
            onClick={resetForm}
            className="mt-6 rounded-full bg-[var(--fg)] px-6 py-3 font-mono text-xs tracking-widest text-black uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
            autoFocus
          >
            {translate("success.another")}
          </button>
        </div>
      )}

      {/* El form queda montado (oculto) durante el éxito: así el widget de
          hCaptcha sigue vivo y "Enviar otro mensaje" no requiere recargar. */}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        hidden={status === "success"}
        className="rounded-[2rem] border border-[var(--border)] bg-[var(--bg)] p-8"
        noValidate
        aria-label={translate("formLabel")}
        aria-describedby={`${formId}-description`}
      >
        <div className="mb-6 flex items-center justify-between">
          <div
            id={`${formId}-description`}
            className="font-mono text-xs tracking-widest text-[var(--fg-muted)] uppercase"
          >
            {translate("description")}
          </div>
          <div className="flex items-center gap-2" aria-live="polite" aria-atomic="true">
            <span
              className={`h-2 w-2 rounded-full ${status === "sending" ? "animate-pulse bg-[var(--accent-fire)]" : "bg-[var(--border)]"}`}
              aria-hidden="true"
            />
            <span className="font-mono text-[10px] text-[var(--fg-dim)] uppercase">
              {status === "sending" ? translate("sending") : translate("ready")}
            </span>
          </div>
        </div>

        {/* Honeypot local + `botcheck` (compatible con Web3Forms). Ambos ocultos. */}
        <div
          className="absolute top-auto left-[-5000px] h-0 w-0 overflow-hidden"
          aria-hidden="true"
        >
          <label htmlFor={`${formId}-honeypot`}>{translate("honeypotLabel")}</label>
          <input
            id={`${formId}-honeypot`}
            type="text"
            name="honeypot"
            value={form.honeypot}
            onChange={(e) => handleChange("honeypot", e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />
          <input
            type="checkbox"
            name="botcheck"
            checked={form.botcheck}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, botcheck: e.target.checked }))
              if (status === "error") {
                setStatus("idle")
                setFailure(null)
              }
            }}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ display: "none" }}
          />
        </div>

        <fieldset className="grid gap-4 border-0 p-0">
          <legend className="sr-only">{translate("legend")}</legend>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor={`${formId}-name`}
                className="font-mono text-[10px] tracking-widest text-[var(--fg-muted)] uppercase"
              >
                {translate("name")} <span aria-hidden="true">*</span>
                <span className="sr-only">{translate("required")}</span>
              </label>
              <input
                id={`${formId}-name`}
                type="text"
                name="name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder={translate("placeholders.name")}
                maxLength={BOOKING_LIMITS.name}
                className={`mt-1 w-full rounded-full border bg-[var(--bg-2)] px-4 py-3 font-sans text-sm transition-colors outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)] ${errors.name ? "border-red-500 focus:border-red-500" : "border-[var(--border)] focus:border-[var(--accent-fire)]"}`}
                required
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? `${formId}-name-error` : undefined}
                autoComplete="name"
              />
              {errors.name && (
                <div
                  id={`${formId}-name-error`}
                  className="mt-1 font-mono text-[10px] text-red-400"
                  role="alert"
                >
                  {translate(`errors.${errors.name}`)}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor={`${formId}-email`}
                className="font-mono text-[10px] tracking-widest text-[var(--fg-muted)] uppercase"
              >
                {translate("email")}
              </label>
              <input
                id={`${formId}-email`}
                type="email"
                name="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder={translate("placeholders.email")}
                maxLength={BOOKING_LIMITS.email}
                className={`mt-1 w-full rounded-full border bg-[var(--bg-2)] px-4 py-3 font-sans text-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)] ${errors.email ? "border-red-500" : "border-[var(--border)] focus:border-[var(--accent-fire)]"}`}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? `${formId}-email-error` : `${formId}-email-hint`}
                autoComplete="email"
              />
              <div id={`${formId}-email-hint`} className="sr-only">
                {translate("hints.email")}
              </div>
              {errors.email && (
                <div
                  id={`${formId}-email-error`}
                  className="mt-1 font-mono text-[10px] text-red-400"
                  role="alert"
                >
                  {translate(`errors.${errors.email}`)}
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor={`${formId}-event`}
              className="font-mono text-[10px] tracking-widest text-[var(--fg-muted)] uppercase"
            >
              {translate("event")} <span aria-hidden="true">*</span>
              <span className="sr-only">{translate("required")}</span>
            </label>
            <input
              id={`${formId}-event`}
              type="text"
              name="event"
              value={form.event}
              onChange={(e) => handleChange("event", e.target.value)}
              placeholder={translate("placeholders.event")}
              maxLength={BOOKING_LIMITS.event}
              className={`mt-1 w-full rounded-full border bg-[var(--bg-2)] px-4 py-3 font-sans text-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)] ${errors.event ? "border-red-500" : "border-[var(--border)] focus:border-[var(--accent-fire)]"}`}
              required
              aria-invalid={!!errors.event}
              aria-describedby={errors.event ? `${formId}-event-error` : undefined}
            />
            {errors.event && (
              <div
                id={`${formId}-event-error`}
                className="mt-1 font-mono text-[10px] text-red-400"
                role="alert"
              >
                {translate(`errors.${errors.event}`)}
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor={`${formId}-date`}
                className="font-mono text-[10px] tracking-widest text-[var(--fg-muted)] uppercase"
              >
                {translate("date")} <span aria-hidden="true">*</span>
                <span className="sr-only">{translate("required")}</span>
              </label>
              <input
                id={`${formId}-date`}
                type="text"
                name="date"
                value={form.date}
                onChange={(e) => handleChange("date", e.target.value)}
                placeholder={translate("placeholders.date")}
                maxLength={BOOKING_LIMITS.date}
                className={`mt-1 w-full rounded-full border bg-[var(--bg-2)] px-4 py-3 font-sans text-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)] ${errors.date ? "border-red-500" : "border-[var(--border)] focus:border-[var(--accent-fire)]"}`}
                required
                aria-invalid={!!errors.date}
                aria-describedby={errors.date ? `${formId}-date-error` : undefined}
              />
              {errors.date && (
                <div
                  id={`${formId}-date-error`}
                  className="mt-1 font-mono text-[10px] text-red-400"
                  role="alert"
                >
                  {translate(`errors.${errors.date}`)}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor={`${formId}-city`}
                className="font-mono text-[10px] tracking-widest text-[var(--fg-muted)] uppercase"
              >
                {translate("city")} <span aria-hidden="true">*</span>
                <span className="sr-only">{translate("required")}</span>
              </label>
              <input
                id={`${formId}-city`}
                type="text"
                name="city"
                value={form.city}
                onChange={(e) => handleChange("city", e.target.value)}
                placeholder={translate("placeholders.city")}
                maxLength={BOOKING_LIMITS.city}
                className={`mt-1 w-full rounded-full border bg-[var(--bg-2)] px-4 py-3 font-sans text-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)] ${errors.city ? "border-red-500" : "border-[var(--border)] focus:border-[var(--accent-fire)]"}`}
                required
                aria-invalid={!!errors.city}
                aria-describedby={errors.city ? `${formId}-city-error` : undefined}
                autoComplete="address-level2"
              />
              {errors.city && (
                <div
                  id={`${formId}-city-error`}
                  className="mt-1 font-mono text-[10px] text-red-400"
                  role="alert"
                >
                  {translate(`errors.${errors.city}`)}
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor={`${formId}-message`}
              className="font-mono text-[10px] tracking-widest text-[var(--fg-muted)] uppercase"
            >
              {translate("message")} <span aria-hidden="true">*</span>
              <span className="sr-only">{translate("messageRequired")}</span>
            </label>
            <textarea
              id={`${formId}-message`}
              name="message"
              value={form.message}
              onChange={(e) => handleChange("message", e.target.value)}
              placeholder={translate("placeholders.message")}
              rows={4}
              minLength={BOOKING_MIN_LENGTHS.message}
              maxLength={BOOKING_LIMITS.message}
              className={`mt-1 h-28 w-full resize-none overflow-y-auto rounded-2xl border bg-[var(--bg-2)] px-4 py-3 font-sans text-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)] ${errors.message ? "border-red-500" : "border-[var(--border)] focus:border-[var(--accent-fire)]"}`}
              required
              aria-invalid={!!errors.message}
              aria-describedby={
                errors.message ? `${formId}-message-error` : `${formId}-message-hint`
              }
            />
            <div
              id={`${formId}-message-hint`}
              className="mt-1 font-mono text-[10px] text-[var(--fg-dim)]"
            >
              {translate("hints.message")}
            </div>
            {errors.message && (
              <div
                id={`${formId}-message-error`}
                className="mt-1 font-mono text-[10px] text-red-400"
                role="alert"
              >
                {translate(`errors.${errors.message}`)}
              </div>
            )}
          </div>
        </fieldset>

        {/* hCaptcha gratuito oficial de Web3Forms: tema oscuro + tamaño compacto
            (entra en pantallas de celular) e idioma del sitio. */}
        <div className="mt-4">
          <div
            id={`${formId}-captcha-label`}
            className="font-mono text-[10px] tracking-widest text-[var(--fg-muted)] uppercase"
          >
            {translate("captcha.label")} <span aria-hidden="true">*</span>
            <span className="sr-only">{translate("required")}</span>
          </div>
          <div
            ref={captchaRef}
            className="h-captcha mt-1 min-h-[74px] rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
            data-captcha="true"
            data-theme="dark"
            data-size="compact"
            data-lang={locale}
            role="group"
            aria-labelledby={`${formId}-captcha-label`}
            aria-describedby={`${formId}-captcha-hint`}
            tabIndex={-1}
          />
          <div
            id={`${formId}-captcha-hint`}
            className="mt-1 font-mono text-[10px] text-[var(--fg-dim)]"
          >
            {translate("captcha.hint")}
          </div>
        </div>

        {captchaState === "error" && (
          <div
            className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 font-mono text-xs text-red-300"
            role="alert"
          >
            {translate("errors.captchaLoad")}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-2 rounded-full bg-[var(--fg)] px-4 py-2 font-mono text-[10px] tracking-widest text-black uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
            >
              {translate("captcha.retry")}
            </button>
          </div>
        )}

        {failure && status !== "success" && failureText && (
          <div
            className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 font-mono text-xs text-red-300"
            role="alert"
            aria-live="assertive"
          >
            {failureText}
          </div>
        )}

        <button
          type="submit"
          disabled={status === "sending" || captchaState !== "ready"}
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[var(--accent-fire)] px-6 py-4 text-sm font-bold tracking-widest text-black uppercase transition-all hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)] disabled:opacity-50 disabled:hover:scale-100"
          style={{ boxShadow: `0 0 calc(10px + var(--bass) * 20px) rgba(255,90,31,0.3)` }}
          aria-label={
            status === "sending" ? translate("submitSendingAria") : translate("submitAria")
          }
        >
          {status === "sending" ? translate("sending") : translate("submit")}
        </button>

        <div className="mt-3 text-center font-mono text-[10px] tracking-widest text-[var(--fg-dim)] uppercase">
          {captchaState === "loading" ? translate("captcha.loading") : translate("footer")}
        </div>
      </form>

      {/* Script oficial de la integración gratuita de hCaptcha de Web3Forms.
          `afterInteractive` lo inyecta en el body luego de la hidratación,
          compatible con export estático y con el tema oscuro del sitio. */}
      <Script
        id="web3forms-hcaptcha-client"
        src={WEB3FORMS_CLIENT_SCRIPT}
        strategy="afterInteractive"
        onError={() => setCaptchaState("error")}
      />
    </>
  )
}
