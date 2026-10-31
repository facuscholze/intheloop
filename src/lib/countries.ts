/**
 * Países derivados del código ISO 3166-1 alpha-2 (`AR`, `FR`, `JP`…).
 *
 * Nombre y bandera se calculan desde el código — sin listas hardcodeadas:
 * un show con un país nuevo aparece con su nombre y su bandera sin tocar
 * código (antes había un `COUNTRY_META` con 6 países y un mapa de banderas
 * con 13; el resto se veía como código crudo).
 *
 * - Nombre: `Intl.DisplayNames` (viene con el runtime, sin dependencias).
 *   Se fija en español porque así estaban los nombres hardcodeados en la UI.
 * - Bandera: par de símbolos "regional indicator" derivado de las letras.
 */

const REGION_CODE = /^[A-Za-z]{2}$/

let displayNames: Intl.DisplayNames | null | undefined
const nameCache = new Map<string, string>()

function getDisplayNames(): Intl.DisplayNames | null {
  if (displayNames !== undefined) return displayNames
  try {
    displayNames = new Intl.DisplayNames(["es"], { type: "region" })
  } catch {
    displayNames = null
  }
  return displayNames
}

/** `"AR"` → `"Argentina"`. Código inválido o desconocido: devuelve el código. */
export function countryName(code: string): string {
  const normalized = code.trim().toUpperCase()
  if (!REGION_CODE.test(normalized)) return code
  const cached = nameCache.get(normalized)
  if (cached) return cached
  let name = normalized
  try {
    // Para códigos con formato válido pero sin país asignado (`XX`),
    // `of()` devuelve el propio código: sirve como fallback.
    name = getDisplayNames()?.of(normalized) ?? normalized
  } catch {
    name = normalized
  }
  nameCache.set(normalized, name)
  return name
}

/** Normaliza `ar`, ` AR ` o `aR` a `AR`; cualquier otro valor queda vacío. */
export function normalizeCountryCode(code: string | null | undefined): string {
  if (!code) return ""
  const normalized = code.trim().toUpperCase()
  return REGION_CODE.test(normalized) ? normalized : ""
}

/** `"AR"` → `"🇦🇷"`. Código inválido: cadena vacía (sin bandera). */
export function countryFlag(code: string): string {
  const normalized = code.trim().toUpperCase()
  if (!REGION_CODE.test(normalized)) return ""
  const REGIONAL_INDICATOR_A = 0x1f1e6
  return String.fromCodePoint(
    ...[...normalized].map((char) => REGIONAL_INDICATOR_A + char.charCodeAt(0) - 65)
  )
}
