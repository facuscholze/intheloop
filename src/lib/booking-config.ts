/**
 * Configuración del formulario de bookings (Web3Forms).
 *
 * El sitio es un export estático (`output: "export"`): no hay backend, ni API
 * routes, ni n8n, ni SMTP. Todo se resuelve en el navegador.
 *
 * La ACCESS KEY es PÚBLICA por diseño (Web3Forms FAQ: "Do I need to hide access
 * key? No"). Termina en el bundle del navegador y actúa como alias del correo
 * configurado en el dashboard, no como secreto. Se guarda UNA SOLA VEZ acá:
 * no se duplica en `.env`, `.env.example` ni en GitHub Actions, y por eso llega
 * al build de producción sin depender de variables de entorno del workflow.
 *
 * Destinatario, Auto Responder y Security Settings se configuran en el dashboard
 * de Web3Forms ("In The Loop - Bookings"), no en este archivo.
 */

export const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit"

export const WEB3FORMS_ACCESS_KEY = "5f459a7a-6422-419e-adda-33d7d8bc7146"

/** Nombre del formulario en el dashboard, sólo para documentación. */
export const WEB3FORMS_FORM_NAME = "In The Loop - Bookings"

/** Script oficial de la integración gratuita de hCaptcha de Web3Forms. */
export const WEB3FORMS_CLIENT_SCRIPT = "https://web3forms.com/client/script.js"

/** `from_name` (opción documentada) y prefijo de `subject` del aviso. */
export const BOOKING_FROM_NAME = "In The Loop Agency"
export const BOOKING_SUBJECT_PREFIX = "Booking In The Loop Agency"

/** Timeout del POST, en milisegundos. */
export const BOOKING_TIMEOUT_MS = 15_000
