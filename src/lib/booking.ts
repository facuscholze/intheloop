/**
 * Lógica pura del formulario de bookings (sin React ni APIs del navegador).
 *
 * Mantener estas funciones fuera del componente permite probar el contrato de
 * Web3Forms con un `fetch` simulado, sin enviar correos reales. El componente
 * sólo se encarga de la UI y de traducir los códigos de error a es/en.
 */

import { z } from "zod"
import {
  BOOKING_FROM_NAME,
  BOOKING_SUBJECT_PREFIX,
  BOOKING_TIMEOUT_MS,
  WEB3FORMS_ACCESS_KEY,
  WEB3FORMS_ENDPOINT
} from "./booking-config"

/** Límites razonables: también se aplican como `maxLength` en el DOM.
 *  `date` no va acá: con `type="date"` el navegador controla el formato ISO. */
export const BOOKING_LIMITS = {
  name: 100,
  email: 254,
  event: 120,
  city: 100,
  message: 2000
} as const

export const BOOKING_MIN_LENGTHS = {
  name: 2,
  event: 2,
  city: 2,
  message: 10
} as const

export const BOOKING_FIELD_ORDER = ["name", "email", "event", "date", "city", "message"] as const

export type BookingField = (typeof BOOKING_FIELD_ORDER)[number]
export type BookingErrorCode = "required" | "tooShort" | "tooLong" | "invalidEmail" | "invalidDate"
export type BookingLocale = "es" | "en"

export function normalizeBookingLocale(locale: string): BookingLocale {
  return locale === "en" ? "en" : "es"
}
export type BookingValues = {
  name: string
  email: string
  event: string
  date: string
  city: string
  message: string
  /** Trampa local (texto oculto), no se envía como dato. */
  honeypot: string
  /** Honeypot compatible con Web3Forms (`botcheck`). */
  botcheck: boolean
}
export type BookingData = Pick<BookingValues, BookingField>
export type BookingPayload = Record<string, string | boolean>

export const EMPTY_BOOKING_FORM: BookingValues = {
  name: "",
  email: "",
  event: "",
  date: "",
  city: "",
  message: "",
  honeypot: "",
  botcheck: false
}

/** Motivos de falla, en términos de UX (nunca se muestra el detalle técnico). */
export type BookingFailureReason =
  | "in-flight"
  | "captcha-missing"
  | "captcha"
  | "captcha-load"
  | "network"
  | "timeout"
  | "http"
  | "invalid-json"
  | "invalid-key"
  | "domain"
  | "spam"
  | "rate-limit"
  | "rejected"
  | "unknown"

export type BookingSubmitResult = { ok: true } | { ok: false; reason: BookingFailureReason }

export type BookingValidation =
  | { ok: true; data: BookingData }
  | { ok: false; blocked: true }
  | {
      ok: false
      blocked: false
      errors: Partial<Record<BookingField, BookingErrorCode>>
      firstField?: BookingField
    }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Campos de una sola línea: se eliminan CRLF para no ensuciar el `subject`. */
function singleLine(min: number, max: number) {
  return z
    .string()
    .transform((value) => value.replace(/[\r\n]+/g, " ").trim())
    .superRefine((value, ctx) => {
      if (value.length === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "required" })
      } else if (value.length < min) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "tooShort" })
      } else if (value.length > max) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "tooLong" })
      }
    })
}

function messageField(max: number, min: number) {
  return z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      if (value.length === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "required" })
      } else if (value.length < min) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "tooShort" })
      } else if (value.length > max) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "tooLong" })
      }
    })
}

/** `type="date"` entrega `YYYY-MM-DD`; validamos también que sea una fecha real. */
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

const dateField = z.string().superRefine((value, ctx) => {
  if (value.length === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "required" })
    return
  }
  if (!ISO_DATE_RE.test(value)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "invalidDate" })
    return
  }
  const [year, month, day] = value.split("-").map(Number)
  if (year < 1000 || year > 9999) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "invalidDate" })
    return
  }
  const parsed = new Date(Date.UTC(year, month - 1, day))
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "invalidDate" })
  }
})

const BookingSchema = z.object({
  name: singleLine(BOOKING_MIN_LENGTHS.name, BOOKING_LIMITS.name),
  email: z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      if (value.length > BOOKING_LIMITS.email) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "tooLong" })
      } else if (value !== "" && !EMAIL_RE.test(value)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "invalidEmail" })
      }
    }),
  event: singleLine(BOOKING_MIN_LENGTHS.event, BOOKING_LIMITS.event),
  date: dateField,
  city: singleLine(BOOKING_MIN_LENGTHS.city, BOOKING_LIMITS.city),
  message: messageField(BOOKING_LIMITS.message, BOOKING_MIN_LENGTHS.message),
  honeypot: z.string().optional().default(""),
  botcheck: z.boolean().optional().default(false)
})

/**
 * Valida los datos del visitante. Si salta el honeypot se bloquea en silencio:
 * no se hace fetch y NO se muestra éxito (Web3Forms es la única fuente de éxito).
 */
export function validateBooking(values: BookingValues): BookingValidation {
  if (String(values.honeypot ?? "").trim() !== "" || values.botcheck) {
    return { ok: false, blocked: true }
  }

  const parsed = BookingSchema.safeParse(values)
  if (!parsed.success) {
    const errors: Partial<Record<BookingField, BookingErrorCode>> = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as BookingField | undefined
      if (!field || !(BOOKING_FIELD_ORDER as readonly string[]).includes(field)) continue
      const code = issue.message as BookingErrorCode
      // El primer error por campo es el más relevante.
      if (!errors[field]) errors[field] = code
    }
    const firstField = BOOKING_FIELD_ORDER.find((field) => errors[field])
    return { ok: false, blocked: false, errors, firstField }
  }

  const data = parsed.data
  return {
    ok: true,
    data: {
      name: data.name,
      email: data.email,
      event: data.event,
      date: data.date,
      city: data.city,
      message: data.message
    }
  }
}

/** El token lo genera hCaptcha; en el cliente se lee del textarea oficial. */
export function isCaptchaTokenValid(token: string | null | undefined): boolean {
  return typeof token === "string" && token.trim().length > 0
}

const MONTHS: Record<BookingLocale, string[]> = {
  es: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
}

/** Fecha legible para el asunto; el payload conserva el ISO `YYYY-MM-DD`.
 *  Se arma a mano (sin `Intl`/`Date` local) para no correrse un día por timezone. */
export function formatBookingDate(iso: string, locale: BookingLocale): string {
  if (!ISO_DATE_RE.test(iso)) return iso
  const [year, month, day] = iso.split("-")
  return `${Number(day)} ${MONTHS[locale][Number(month) - 1] ?? month} ${year}`
}

/**
 * Arma el body JSON según el contrato documentado de Web3Forms.
 * No se usa `to`: el destinatario está configurado en el dashboard.
 * `replyto` repite `email` (plan gratuito, opción documentada) para que
 * "Responder" apunte al visitante; `email` solo se envía si lo completó.
 * `botcheck` es el honeypot que Web3Forms valida del lado del servicio.
 * El `subject` muestra la fecha formateada en es/en; el campo `date` viaja ISO.
 */
export function buildBookingPayload(
  data: BookingData,
  captchaToken: string,
  locale: BookingLocale = "es"
): BookingPayload {
  const subject =
    `${BOOKING_SUBJECT_PREFIX} — ${data.event} · ${data.city} · ${formatBookingDate(data.date, locale)}`.slice(
      0,
      200
    )

  const payload: BookingPayload = {
    access_key: WEB3FORMS_ACCESS_KEY,
    subject,
    from_name: BOOKING_FROM_NAME,
    name: data.name,
    event: data.event,
    date: data.date,
    city: data.city,
    message: data.message,
    botcheck: false,
    "h-captcha-response": captchaToken.trim()
  }

  if (data.email) {
    payload.email = data.email
    payload.replyto = data.email
  }

  return payload
}

/** Clave de mensaje es/en para cada motivo; `in-flight` no se muestra. */
export const BOOKING_ERROR_MESSAGE_KEYS: Record<BookingFailureReason, string | null> = {
  "in-flight": null,
  "captcha-missing": "captchaMissing",
  captcha: "captcha",
  "captcha-load": "captchaLoad",
  network: "network",
  timeout: "timeout",
  http: "http",
  "invalid-json": "invalidResponse",
  "invalid-key": "config",
  domain: "domain",
  spam: "spam",
  "rate-limit": "rateLimit",
  rejected: "rejected",
  unknown: "unknown"
}

export function bookingErrorMessageKey(reason: BookingFailureReason): string | null {
  // `in-flight` tiene valor `null` deliberadamente (no se muestra mensaje);
  // `??` lo convertiría en "unknown", así que se distingue con `in`.
  return reason in BOOKING_ERROR_MESSAGE_KEYS ? BOOKING_ERROR_MESSAGE_KEYS[reason] : "unknown"
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/** Web3Forms devuelve `message` en la raíz (429), en `body` (400) o `error` (500). */
function extractMessage(body: unknown): string {
  if (!isRecord(body)) return ""
  const root = typeof body.message === "string" ? body.message : ""
  const nested =
    isRecord(body.body) && typeof body.body.message === "string" ? body.body.message : ""
  const error = typeof body.error === "string" ? body.error : ""
  return root || nested || error || ""
}

/**
 * Clasifica respuestas no exitosas para mostrar un mensaje amigable. Los textos
 * crudos del servicio NO se muestran al visitante.
 */
export function classifyWeb3FormsError(status: number, message: string): BookingFailureReason {
  const text = message.toLowerCase()
  if (status === 429 || /rate.?limit|too many|too may requests|try later/i.test(text)) {
    return "rate-limit"
  }
  if (/captcha|hcaptcha|verification|token|challenge/i.test(text)) return "captcha"
  if (/access.?key|api.?key|invalid key|form.?id|not found|not authori[sz]ed/i.test(text)) {
    return "invalid-key"
  }
  if (/domain|origin|whitelist|not allowed|sub.?domain/i.test(text)) return "domain"
  if (/spam|blacklist|blocked|botcheck|honeypot|firewall|abuse/i.test(text)) return "spam"
  if (status >= 500) return "http"
  return "rejected"
}

export type BookingRequestInit = {
  method: "POST"
  headers: Record<string, string>
  body: string
  signal: AbortSignal
}

export type BookingResponseLike = {
  ok: boolean
  status: number
  json: () => Promise<unknown>
}

export type FetchLike = (url: string, init: BookingRequestInit) => Promise<BookingResponseLike>

export type SubmitBookingOptions = {
  /** Inyectable en tests; en producción se usa el `fetch` del navegador. */
  fetchImpl?: FetchLike
  timeoutMs?: number
}

const browserFetch: FetchLike = (url, init) =>
  globalThis.fetch(url, init as RequestInit) as unknown as Promise<BookingResponseLike>

/**
 * POST a Web3Forms con AbortController + timeout (~15 s). Contempla error de red,
 * timeout, HTTP no exitoso, JSON inválido, `success:false` y errores inesperados.
 * Éxito SÓLO cuando hay 2xx y `success === true`.
 */
export async function submitBooking(
  payload: BookingPayload,
  options: SubmitBookingOptions = {}
): Promise<BookingSubmitResult> {
  const fetchImpl = options.fetchImpl ?? browserFetch
  const timeoutMs = options.timeoutMs ?? BOOKING_TIMEOUT_MS
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    let response: BookingResponseLike
    try {
      response = await fetchImpl(WEB3FORMS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      })
    } catch {
      return { ok: false, reason: controller.signal.aborted ? "timeout" : "network" }
    }

    if (!response || typeof response !== "object") {
      return { ok: false, reason: "unknown" }
    }

    let body: unknown
    try {
      body = await response.json()
    } catch {
      return { ok: false, reason: "invalid-json" }
    }

    try {
      if (!response.ok) {
        return {
          ok: false,
          reason: classifyWeb3FormsError(response.status, extractMessage(body))
        }
      }
      // Web3Forms confirma con { success: true, ... }. Un 200 con otra forma
      // (o success:false) no es éxito.
      if (!isRecord(body) || body.success !== true) {
        return {
          ok: false,
          reason: classifyWeb3FormsError(response.status, extractMessage(body))
        }
      }
      return { ok: true }
    } catch {
      return { ok: false, reason: "unknown" }
    }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Serializa los envíos: un segundo submit mientras el primero sigue en vuelo
 * devuelve `in-flight` sin hacer otro fetch (defensa contra doble clic, además
 * del botón deshabilitado en la UI). El flag se libera siempre en `finally`.
 */
export function createBookingSubmitter(options: SubmitBookingOptions = {}) {
  let inFlight = false
  return {
    get busy() {
      return inFlight
    },
    async submit(payload: BookingPayload): Promise<BookingSubmitResult> {
      if (inFlight) return { ok: false, reason: "in-flight" }
      inFlight = true
      try {
        return await submitBooking(payload, options)
      } catch {
        return { ok: false, reason: "unknown" }
      } finally {
        inFlight = false
      }
    }
  }
}
