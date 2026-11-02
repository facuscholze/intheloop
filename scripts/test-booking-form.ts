/**
 * Tests del formulario de bookings con `fetch` SIMULADO.
 *
 * NO se hacen envíos reales a Web3Forms ni se mandan correos: globalThis.fetch se
 * reemplaza por un centinela que falla si alguien lo llama, y cada caso inyecta
 * su propio `fetchImpl`. Correr con `pnpm test:booking`.
 */
import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import test from "node:test"
import {
  BOOKING_ERROR_MESSAGE_KEYS,
  EMPTY_BOOKING_FORM,
  BOOKING_LIMITS,
  BOOKING_MIN_LENGTHS,
  bookingErrorMessageKey,
  buildBookingPayload,
  classifyWeb3FormsError,
  createBookingSubmitter,
  isCaptchaTokenValid,
  submitBooking,
  validateBooking
} from "../src/lib/booking"
import type {
  BookingPayload,
  BookingRequestInit,
  BookingResponseLike,
  BookingValues,
  FetchLike
} from "../src/lib/booking"
import { WEB3FORMS_ACCESS_KEY, WEB3FORMS_ENDPOINT } from "../src/lib/booking-config"

let realFetchCalls = 0
const originalFetch = globalThis.fetch
globalThis.fetch = (async () => {
  realFetchCalls += 1
  throw new Error("Los tests no deben usar la red real")
}) as typeof globalThis.fetch

process.on("exit", () => {
  globalThis.fetch = originalFetch
})

function validValues(overrides: Partial<BookingValues> = {}): BookingValues {
  return {
    ...EMPTY_BOOKING_FORM,
    name: "Tommy Petersen",
    email: "booker@club.example",
    event: "Tribal Sunset Festival",
    date: "15 Marzo 2026",
    city: "Córdoba",
    message: "Queremos cerrar el lineup del sábado con un set de tribal house.",
    ...overrides
  }
}

function response(body: unknown, status = 200): BookingResponseLike {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body
  }
}

function fakeFetch(
  responder: (init: BookingRequestInit) => BookingResponseLike | Promise<BookingResponseLike>
): { fetchImpl: FetchLike; calls: { url: string; init: BookingRequestInit }[] } {
  const calls: { url: string; init: BookingRequestInit }[] = []
  return {
    calls,
    fetchImpl: async (url, init) => {
      assert.equal(url, WEB3FORMS_ENDPOINT)
      calls.push({ url, init })
      return responder(init)
    }
  }
}

/** Reproduce el orden de validación del componente sin React. */
function attempt(values: BookingValues, token: string, fetchImpl: FetchLike) {
  const validation = validateBooking(values)
  if (!validation.ok || !isCaptchaTokenValid(token)) {
    return { sent: false, result: null }
  }
  return {
    sent: true,
    result: submitBooking(buildBookingPayload(validation.data, token), { fetchImpl })
  }
}

function payloadFor(
  values: BookingValues = validValues(),
  token = "hcaptcha-token"
): BookingPayload {
  const validation = validateBooking(values)
  assert.equal(validation.ok, true)
  if (!validation.ok) throw new Error("valores inválidos en fixture")
  return buildBookingPayload(validation.data, token)
}

test("envío válido: contrato Web3Forms, todos los campos, reply-to, sin `to`", async () => {
  const validation = validateBooking(validValues())
  assert.equal(validation.ok, true)
  if (!validation.ok) throw new Error("valores inválidos en fixture")

  const payload = buildBookingPayload(validation.data, "  hcaptcha-token  ")
  assert.equal(payload.access_key, WEB3FORMS_ACCESS_KEY)
  assert.equal("to" in payload, false)
  assert.equal(String(payload.subject).includes("In The Loop Agency"), true)
  assert.equal(String(payload.subject).includes("Tribal Sunset Festival"), true)
  assert.equal(payload.from_name, "In The Loop Agency")
  for (const field of ["name", "event", "date", "city", "message", "email"] as const) {
    assert.equal(payload[field], validation.data[field])
  }
  assert.equal(payload.replyto, validation.data.email)
  assert.equal(payload.botcheck, false)
  assert.equal(payload["h-captcha-response"], "hcaptcha-token")

  const { fetchImpl, calls } = fakeFetch(() =>
    response({ success: true, message: "Email sent successfully!" })
  )
  const result = await submitBooking(payload, { fetchImpl })
  assert.deepEqual(result, { ok: true })
  assert.equal(calls.length, 1)
  assert.equal(calls[0].init.method, "POST")
  assert.equal(calls[0].init.headers["Content-Type"], "application/json")
  assert.equal(calls[0].init.headers.Accept, "application/json")
  assert.deepEqual(JSON.parse(calls[0].init.body), payload)
  assert.equal(calls[0].init.signal instanceof AbortSignal, true)
})

test("campos vacíos: errores por campo y foco al primero, sin fetch", () => {
  const validation = validateBooking(EMPTY_BOOKING_FORM)
  assert.equal(validation.ok, false)
  if (validation.ok || validation.blocked) throw new Error("se esperaban errores de campo")
  for (const field of ["name", "event", "date", "city", "message"] as const) {
    assert.equal(validation.errors[field], "required")
  }
  assert.equal(validation.firstField, "name")

  const { fetchImpl, calls } = fakeFetch(() => response({ success: true }))
  const attemptResult = attempt(EMPTY_BOOKING_FORM, "hcaptcha-token", fetchImpl)
  assert.equal(attemptResult.sent, false)
  assert.equal(calls.length, 0)
})

test("email inválido y mensaje corto: validación es/en sin detalles técnicos", () => {
  const invalidEmail = validateBooking(validValues({ email: "no-es-un-email" }))
  assert.equal(invalidEmail.ok, false)
  if (invalidEmail.ok || invalidEmail.blocked) throw new Error("se esperaba error de email")
  assert.equal(invalidEmail.errors.email, "invalidEmail")

  const shortMessage = validateBooking(validValues({ message: "muy corto" }))
  assert.equal(shortMessage.ok, false)
  if (shortMessage.ok || shortMessage.blocked) throw new Error("se esperaba error de mensaje")
  assert.equal(shortMessage.errors.message, "tooShort")

  const longName = validateBooking(validValues({ name: "x".repeat(BOOKING_LIMITS.name + 1) }))
  assert.equal(longName.ok, false)
  if (longName.ok || longName.blocked) throw new Error("se esperaba error de longitud")
  assert.equal(longName.errors.name, "tooLong")

  const emptyEmail = validateBooking(validValues({ email: "" }))
  assert.equal(emptyEmail.ok, true, "el email sigue siendo opcional")
})

test("honeypot (texto oculto y botcheck): bloquea sin fetch y sin fingir éxito", () => {
  const { fetchImpl, calls } = fakeFetch(() => response({ success: true }))
  const textTrap = attempt(validValues({ honeypot: "soy-un-bot" }), "hcaptcha-token", fetchImpl)
  const checkboxTrap = attempt(validValues({ botcheck: true }), "hcaptcha-token", fetchImpl)
  assert.equal(textTrap.sent, false)
  assert.equal(checkboxTrap.sent, false)
  assert.equal(calls.length, 0)
})

test("captcha: token faltante/vacío, error del servicio y error de carga", async () => {
  const { fetchImpl, calls } = fakeFetch(() => response({ success: true }))
  assert.equal(isCaptchaTokenValid(""), false)
  assert.equal(isCaptchaTokenValid("   "), false)
  assert.equal(isCaptchaTokenValid("hcaptcha-token"), true)
  assert.equal(attempt(validValues(), "", fetchImpl).sent, false)
  assert.equal(calls.length, 0, "sin token no se hace fetch")

  assert.equal(classifyWeb3FormsError(400, "hCaptcha verification failed"), "captcha")
  assert.equal(classifyWeb3FormsError(400, "Captcha token expired"), "captcha")
  assert.equal(bookingErrorMessageKey("captcha"), "captcha")
  assert.equal(bookingErrorMessageKey("captcha-missing"), "captchaMissing")
  assert.equal(bookingErrorMessageKey("captcha-load"), "captchaLoad")

  const captchaRejection = fakeFetch(() =>
    response({ success: false, body: { message: "hCaptcha verification failed" } }, 400)
  )
  const result = await submitBooking(payloadFor(), { fetchImpl: captchaRejection.fetchImpl })
  assert.deepEqual(result, { ok: false, reason: "captcha" })
})

test("doble clic: un solo fetch, segundo responde in-flight y el estado se libera", async () => {
  let release!: (value: BookingResponseLike) => void
  const pending = new Promise<BookingResponseLike>((resolve) => {
    release = resolve
  })
  let calls = 0
  const fetchImpl: FetchLike = async () => {
    calls += 1
    return pending
  }
  const submitter = createBookingSubmitter({ fetchImpl })
  const payload = payloadFor()

  const first = submitter.submit(payload)
  const second = submitter.submit(payload)
  assert.deepEqual(await second, { ok: false, reason: "in-flight" })
  assert.equal(calls, 1)
  assert.equal(submitter.busy, true)

  release(response({ success: true }))
  assert.deepEqual(await first, { ok: true })
  assert.equal(submitter.busy, false, "el flag se restaura en finally")

  const third = submitter.submit(payload)
  assert.deepEqual(await third, { ok: true })
  assert.equal(calls, 2)
})

test("timeout: AbortController aborta a los ~15 s (parámetro inyectable)", async () => {
  const fetchImpl: FetchLike = (_url, init) =>
    new Promise((_resolve, reject) => {
      init.signal.addEventListener("abort", () => reject(new Error("AbortError")))
    })
  const result = await submitBooking(payloadFor(), { fetchImpl, timeoutMs: 5 })
  assert.deepEqual(result, { ok: false, reason: "timeout" })
})

test("error de red y error inesperado: sin detalles técnicos en la UI", async () => {
  const network = fakeFetch(() => {
    throw new Error("ECONNRESET")
  })
  assert.deepEqual(await submitBooking(payloadFor(), { fetchImpl: network.fetchImpl }), {
    ok: false,
    reason: "network"
  })

  const broken = fakeFetch(() => undefined as unknown as BookingResponseLike)
  assert.deepEqual(await submitBooking(payloadFor(), { fetchImpl: broken.fetchImpl }), {
    ok: false,
    reason: "unknown"
  })
})

test("HTTP no exitoso, JSON inválido y success:false: nunca se muestra éxito", async () => {
  const httpError = fakeFetch(() =>
    response({ statusCode: 500, error: "Something went wrong on server." }, 500)
  )
  assert.deepEqual(await submitBooking(payloadFor(), { fetchImpl: httpError.fetchImpl }), {
    ok: false,
    reason: "http"
  })

  const invalidJson = fakeFetch(() => ({
    ok: true,
    status: 200,
    json: async () => {
      throw new SyntaxError("Unexpected token <")
    }
  }))
  assert.deepEqual(await submitBooking(payloadFor(), { fetchImpl: invalidJson.fetchImpl }), {
    ok: false,
    reason: "invalid-json"
  })

  const successFalse = fakeFetch(() => response({ success: false, message: "Submission rejected" }))
  assert.deepEqual(await submitBooking(payloadFor(), { fetchImpl: successFalse.fetchImpl }), {
    ok: false,
    reason: "rejected"
  })

  const htmlBody = fakeFetch(() => response("<html>not json</html>"))
  assert.deepEqual(await submitBooking(payloadFor(), { fetchImpl: htmlBody.fetchImpl }), {
    ok: false,
    reason: "rejected"
  })
})

test("clave inválida, restricción de dominio, antispam y rate limit", async () => {
  assert.equal(classifyWeb3FormsError(400, "Invalid Access Key"), "invalid-key")
  assert.equal(classifyWeb3FormsError(403, "Domain is not allowed to submit"), "domain")
  assert.equal(classifyWeb3FormsError(400, "Spam detected by our filter"), "spam")
  assert.equal(classifyWeb3FormsError(429, "Too may requests. Please try later!"), "rate-limit")

  const cases: [string, number, unknown, string][] = [
    [
      "Invalid Access Key",
      400,
      { success: false, body: { message: "Invalid Access Key" } },
      "invalid-key"
    ],
    ["domain", 403, { success: false, message: "Domain is not allowed" }, "domain"],
    ["spam", 400, { success: false, body: { message: "Spam detected" } }, "spam"],
    ["rate", 429, { success: false, message: "Too may requests. Please try later!" }, "rate-limit"]
  ]
  for (const [label, status, body, reason] of cases) {
    const { fetchImpl } = fakeFetch(() => response(body, status))
    assert.deepEqual(await submitBooking(payloadFor(), { fetchImpl }), { ok: false, reason }, label)
  }
})

test("mensajes es/en: cobertura completa, sin jerga técnica y con email de contacto", () => {
  const load = (locale: string) =>
    JSON.parse(readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), "utf8"))
  const es = load("es")
  const en = load("en")

  const keys = new Set(
    Object.values(BOOKING_ERROR_MESSAGE_KEYS).filter((key): key is string => key !== null)
  )
  keys.add("required")
  keys.add("tooShort")
  keys.add("tooLong")
  keys.add("invalidEmail")

  for (const [locale, messages] of [
    ["es", es],
    ["en", en]
  ] as const) {
    const form = messages.booking.form
    assert.ok(form, `falta booking.form en ${locale}`)
    assert.ok(form.errors, `falta booking.form.errors en ${locale}`)
    for (const key of keys) {
      assert.equal(typeof form.errors[key], "string", `falta errors.${key} en ${locale}`)
      assert.ok(form.errors[key].length > 0, `errors.${key} vacío en ${locale}`)
      assert.doesNotMatch(
        form.errors[key],
        /https?:\/\/|access_key|success\s*:\s*false|JSON|\bHTTP\b|\b500\b|Web3Forms|AbortController/i,
        `errors.${key} en ${locale} filtra detalles técnicos`
      )
    }
    for (const key of ["http", "invalidResponse", "config", "rejected", "unknown"]) {
      assert.ok(
        form.errors[key].includes("{email}"),
        `errors.${key} en ${locale} debe ofrecer el email`
      )
    }
    for (const key of ["submit", "sending", "footer", "description", "formLabel"]) {
      assert.equal(typeof form[key], "string", `falta ${key} en ${locale}`)
    }
    assert.ok(form.success.title && form.success.body && form.success.another)
    assert.ok(form.captcha.label && form.captcha.hint && form.captcha.loading && form.captcha.retry)
  }

  // Todas las claves estáticas que usa el componente existen en ambos idiomas.
  const componentSource = readFileSync(
    new URL("../src/components/booking/BookingForm.tsx", import.meta.url),
    "utf8"
  )
  const staticKeys = [...componentSource.matchAll(/translate\("([^"]+)"/g)].map((m) => m[1])
  assert.ok(staticKeys.length > 20, "no se encontraron claves de traducción")
  for (const [locale, messages] of [
    ["es", es],
    ["en", en]
  ] as const) {
    for (const key of staticKeys) {
      const value = key
        .split(".")
        .reduce<unknown>(
          (node, part) =>
            node && typeof node === "object" ? (node as Record<string, unknown>)[part] : undefined,
          messages.booking.form
        )
      assert.equal(typeof value, "string", `falta booking.form.${key} en ${locale}`)
    }
  }

  assert.notEqual(es.booking.form.errors.network, en.booking.form.errors.network)
  assert.notEqual(es.booking.form.success.title, en.booking.form.success.title)
  assert.equal(bookingErrorMessageKey("in-flight"), null, "doble clic no muestra mensaje")
})

test("textarea: resize none, alto fijo, scroll interno y mínimo 10 caracteres", () => {
  const component = readFileSync(
    new URL("../src/components/booking/BookingForm.tsx", import.meta.url),
    "utf8"
  )
  const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8")
  const textarea = component.match(/<textarea[\s\S]*?\/>/)?.[0] ?? ""

  assert.ok(textarea, "debe existir el textarea de Mensaje")
  assert.match(css, /textarea\s*\{[^}]*resize:\s*none/, "regla global resize: none")
  assert.match(css, /textarea\s*\{[^}]*overflow-y:\s*auto/, "scroll interno global")
  assert.match(textarea, /resize-none/, "la esquina no se puede arrastrar")
  assert.match(textarea, /\bh-28\b/, "altura fija")
  assert.match(textarea, /overflow-y-auto/, "scroll interno si el texto es largo")
  assert.match(textarea, /minLength=\{BOOKING_MIN_LENGTHS\.message\}/)
  assert.equal(BOOKING_MIN_LENGTHS.message, 10)
  assert.match(component, /rows=\{4\}/, "se conserva el alto de 4 filas como fallback")
})

test("Press Kit eliminado: sin componente, sin links rotos y contadores intactos", () => {
  assert.equal(
    existsSync(new URL("../src/components/booking/PressKit.tsx", import.meta.url)),
    false,
    "el componente PressKit.tsx no debe existir"
  )

  const page = readFileSync(new URL("../src/app/[locale]/page.tsx", import.meta.url), "utf8")
  assert.doesNotMatch(page, /PressKit|press[- ]?kit|\/press\//i, "page.tsx sin Press Kit")
  assert.match(
    page,
    /<Counters\s+shows=\{shows\.length\}\s+countries=\{countries\}\s+yearsRange=\{yearsRange\}/,
    "contadores del hero intactos"
  )
  assert.match(page, /<Hero countries=\{countries\}/, "hero intacto")

  const noPress = /press[- ]?kit|#press|\/press\/|PressKit/i
  const files = [
    "../src/app/sitemap.ts",
    "../src/app/opengraph-image.alt.txt",
    "../src/app/[locale]/layout.tsx",
    "../src/components/ui/Header.tsx",
    "../src/components/ui/Menu.tsx",
    "../messages/es.json",
    "../messages/en.json"
  ]
  for (const file of files) {
    const content = readFileSync(new URL(file, import.meta.url), "utf8")
    assert.doesNotMatch(content, noPress, `sin referencias a Press Kit en ${file}`)
  }
})

test("ningún test tocó la red real", () => {
  assert.equal(realFetchCalls, 0)
})
