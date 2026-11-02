# Formulario de bookings — Web3Forms

El formulario de la sección **BOOK** envía las solicitudes a
**Web3Forms** y los correos llegan a `events@intheloop.agency`. Es un sitio
100% estático (`next.config.ts` → `output: "export"`, deploy a GitHub Pages):
**no hay backend propio, no hay API routes, no hay n8n, no hay SMTP ni
credenciales de correo**. El POST sale directamente desde el navegador.

> Documentación oficial consultada: <https://docs.web3forms.com/>
> (API Reference, hCaptcha, Custom Reply-To, Honeypot, Restrict to Domain,
> Troubleshooting, FAQ, Next.js / GitHub Pages).

---

## Cómo está configurado

| Concepto                   | Valor / ubicación                                                                                                                                                                                                                                                                                                                   |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Endpoint                   | `POST https://api.web3forms.com/submit` (siempre `https`, incluso si la página se abre por `http`)                                                                                                                                                                                                                                  |
| Formulario en el dashboard | `In The Loop - Bookings`                                                                                                                                                                                                                                                                                                            |
| Destinatario               | `events@intheloop.agency`, **configurado en el dashboard** (no se envía ningún campo `to`)                                                                                                                                                                                                                                          |
| Access key                 | `src/lib/booking-config.ts`, una sola vez. Es **pública por diseño** según el FAQ de Web3Forms: es un alias del correo, no un secreto, y termina en el bundle del navegador. No se duplica en `.env`, `.env.example`, GitHub Actions ni en secrets                                                                                  |
| Variables de entorno       | **Ninguna** para el formulario. Por eso la clave llega al build de producción sin depender de `vars`/`secrets` del workflow                                                                                                                                                                                                         |
| `Content-Type` / `Accept`  | `application/json` (evita el 301/CORS que documenta el Troubleshooting). No se usa `redirect`                                                                                                                                                                                                                                       |
| `subject`                  | `Booking In The Loop Agency — {evento} · {ciudad} · {fecha}` (máx. 200 caracteres, sin CRLF)                                                                                                                                                                                                                                        |
| `from_name`                | `In The Loop Agency` (opción documentada de Web3Forms)                                                                                                                                                                                                                                                                              |
| Campos del formulario      | `name`, `email`, `event`, `date`, `city`, `message` — se conservan los nombres originales                                                                                                                                                                                                                                           |
| Reply-to                   | **Sí, disponible en el plan gratis**: Web3Forms usa `email` como reply-to por defecto y además enviamos `replyto` con el mismo valor cuando el visitante completa su email. Si lo deja vacío (sigue siendo opcional), el correo no tiene reply-to                                                                                   |
| hCaptcha                   | Integración **gratuita oficial** de Web3Forms: `<div class="h-captcha" data-captcha="true" data-theme="dark" data-size="compact" data-lang="es                                                                                                                                                                                      | en">`+`https://web3forms.com/client/script.js` cargado con `next/script`. No hay sitekeys propias: el script de Web3Forms inyecta la sitekey del plan gratuito y `recaptchacompat=off`. El token se lee del `textarea[name="h-captcha-response"]` (validación del lado del cliente documentada) y se envía como `h-captcha-response` |
| Honeypot                   | Se mantiene el campo oculto `honeypot` (trampa local) y se agrega `botcheck` como checkbox oculto, que es el nombre que Web3Forms valida del lado del servicio. Si salta una trampa **no se hace el POST ni se finge un éxito**                                                                                                     |
| Validaciones               | `name` ≥ 2, `event` ≥ 2, `date` ≥ 4, `city` ≥ 2, `message` ≥ 10, email con formato válido si se completa; máximos 100 / 120 / 60 / 100 / 2000 / 254 caracteres (también como `maxLength` en el DOM). Éxito **sólo** con HTTP 2xx + `success: true`                                                                                  |
| Errores                    | `AbortController` con timeout de 15 s; se contemplan error de red, timeout, HTTP no exitoso, JSON inválido, `success:false`, clave inválida, restricción de dominio, antispam, rate limit y errores inesperados. Los textos al visitante son es/en y **sin detalles técnicos**; se conserva todo lo escrito y se resetea el captcha |
| Anti doble envío           | Botón deshabilitado mientras se procesa + un submitter que serializa los envíos; el estado siempre se restaura                                                                                                                                                                                                                      |
| i18n                       | Todos los textos del formulario (labels, placeholders, estados, éxito, errores, captcha) viven en `messages/es.json` y `messages/en.json` bajo `booking.form`                                                                                                                                                                       |
| Accesibilidad              | Se conservan `fieldset`/`legend`, `label htmlFor`, `aria-invalid`, `aria-describedby`, `role="alert"`, foco al primer error, foco al captcha, `autoFocus` en "Enviar otro mensaje" y los estilos `focus-visible` del sitio                                                                                                          |

El formulario permanece montado (oculto con `hidden`) durante la pantalla de
éxito para que el widget de hCaptcha siga vivo al volver a escribir. No se
rediseñó la landing: colores, tipografías, layout, animaciones, responsive y
`boxShadow` reactivo al bass quedan iguales.

---

## Configuración manual pendiente (en Web3Forms / GitHub)

1. **Activar hCaptcha en el dashboard** (paso obligatorio y manual). En
   `https://app.web3forms.com/` → formulario `In The Loop - Bookings` →
   **Security Settings / Block Spam** → elegir **hCaptcha**. La documentación
   dice textualmente que, después de agregar el `<div>` y el script, hay que
   activar hCaptcha en el dashboard para que sea **obligatorio en cada envío**.
   Con `Security Settings: Basic` y sin esa activación, el captcha existe en el
   frontend pero el servicio no lo exige. El frontend, por su parte, nunca envía
   sin token.
2. **Verificar** que el destinatario siga siendo `events@intheloop.agency` y que
   **Auto Responder** continúe desactivado (tal como está configurado hoy).
3. **Aprobación de dominio**, sólo si aparece un rechazo. Ver más abajo.
4. **Correo**: agregar `notify@web3forms.com` a contactos / remitentes seguros
   y revisar Promociones y Spam si no llega; confirmar que `intheloop.agency`
   tenga registros MX válidos (el Troubleshooting de Web3Forms lo exige para
   entregar).
5. **GitHub**: no hay que crear secrets ni variables para este formulario. El
   dominio y su certificado HTTPS se gestionan como ya están en
   `Settings → Pages` y `public/CNAME`; este cambio **no toca DNS ni el dominio**.
   La prueba real (un envío de verdad) la hace el dueño del sitio.

### Restricción de dominio en el plan gratis

- **Domain Restriction / whitelist es una función PRO** (`docs.web3forms.com/getting-started/pro-features/restrict-to-domain.md`).
  En el plan gratuito **no se puede** limitar el formulario a
  `intheloop.agency` ni a `www.intheloop.agency`.
- Lo que sí aplica en el plan gratis es un **filtro antispam del servicio**:
  Web3Forms bloquea por defecto ciertos dominios, subdominios y TLD. Si el
  formulario funciona en `localhost` pero no en el dominio propio, hay que
  **contactar a soporte con el nombre del dominio para revisión/aprobación
  manual** (`https://web3forms.com/contact`). Los subdominios gratuitos tipo
  `*.github.io` **no se aprueban**: para eso hace falta el dominio propio (que
  ya está conectado) o un plan pago.
- **La URL del formulario cargada en el dashboard no es una restricción de
  seguridad**: es un dato informativo. La access key es pública y cualquiera
  podría hacer un POST desde otro origen; las defensas reales son hCaptcha, el
  honeypot, los filtros del servicio y —si se contrata— la whitelist de dominio.
- Compatibilidad con `http` mientras GitHub Pages termina de emitir el
  certificado: el endpoint (`https://api.web3forms.com/submit`), el script de
  Web3Forms y el de hCaptcha son **siempre `https`**, así que no hay contenido
  mixto bloqueado. No se usa Node en producción y Web3Forms permite CORS desde
  cualquier origen con `application/json`. En el export estático **no hay CSP ni
  headers custom** (`headers()` no se soporta con `output: "export"`, GitHub
  Pages no permite headers propios, y no existe `_headers` ni CSP en
  `vercel.json`), por lo que nada bloquea los scripts del captcha. Si en el
  futuro se agrega una CSP, hay que permitir `https://web3forms.com`,
  `https://js.hcaptcha.com` y los frames/recursos de `*.hcaptcha.com`.

---

## Límite gratuito de 250 envíos por mes

El plan Free de Web3Forms incluye **250 submissions por mes** (y un rate limit
por IP: demasiados envíos seguidos devuelven `429` y se libera
aproximadamente en una hora). Si se supera el cupo:

1. Revisar el contador/uso en el dashboard y esperar al reinicio del mes: el
   plan gratis **deja de aceptar envíos** hasta el siguiente ciclo.
2. Si el volumen real de bookings lo justifica, **contratar un plan pago** de
   Web3Forms (Starter/Pro según el cupo) o cambiar de proveedor de formularios
   estáticos. No hace falta crear un backend propio.
3. Mientras tanto, el sitio ya muestra los emails/WhatsApp/Instagram de contacto
   en la sección BOOK; el formulario mostrará un mensaje amigable en es/en
   ("Demasiados envíos seguidos…" / "No pudimos enviar el mensaje…") y **nunca**
   un falso éxito.
4. No usar el formulario para pruebas masivas: cada prueba real consume el cupo
   y puede disparar el `429`. Para probar la lógica existen los tests con
   `fetch` simulado.

---

## Cómo probar

### Automático (sin enviar correos ni pegarle a Web3Forms)

```bash
pnpm install --frozen-lockfile
pnpm test:booking
```

`scripts/test-booking-form.ts` usa `fetch` **simulado** y cubre: envío válido,
campos vacíos, email inválido, mensaje corto, longitudes máximas, honeypot,
doble clic, timeout, error de red, HTTP de error, JSON inválido,
`success:false`, clave inválida, dominio bloqueado, antispam, rate limit,
errores inesperados, errores del captcha y mensajes es/en. También corre en CI
(`.github/workflows/ci.yml`). Si alguien intentara usar la red real, el test
falla.

### Local / build

```bash
CI=true pnpm lint
pnpm typecheck
pnpm build          # genera out/ (export estático)
pnpm preview        # sirve out/ para revisar /es/ y /en/
```

En el navegador: completar el formulario, resolver el hCaptcha (tema oscuro,
tamaño compacto apto para celulares) y enviar. En la pestaña **Network** tiene
que verse un `POST https://api.web3forms.com/submit` con
`Content-Type: application/json` y una respuesta `200` con `success: true`.
Probar también `/en/`: labels, errores y éxito deben estar en inglés.

### Prueba real (la hace el dueño del sitio)

Una vez desplegado en `https://intheloop.agency` (o `http://` mientras el
certificado está pendiente), enviar **un solo** booking de prueba y confirmar
que llega a `events@intheloop.agency`, que el **Responder** apunta al email
cargado y que el asunto identifica el booking de In The Loop Agency. Revisar
Spam/Promociones si no aparece en Inbox.

---

## Troubleshooting rápido

| Síntoma                                                        | Causa / acción                                                                                                                                                          |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| El botón queda deshabilitado y dice "Cargando verificación..." | No cargó `web3forms.com/client/script.js` o `js.hcaptcha.com`. Aparece un aviso es/en con botón **Reintentar** (recarga la página). Revisar bloqueadores/red/CSP futura |
| "No pudimos verificar el captcha"                              | Token vencido o rechazado; se resetea el widget automáticamente. Verificar además que hCaptcha esté activado en el dashboard                                            |
| `429` / "Demasiados envíos seguidos"                           | Rate limit por IP o cupo mensual agotado. Esperar ~1 hora / al mes siguiente, o pasar a un plan pago                                                                    |
| "El formulario no está disponible"                             | Access key inválida o formulario mal configurado en el dashboard. Verificar `src/lib/booking-config.ts` contra el dashboard (sin generar otra clave)                    |
| "El envío fue rechazado" con dominio                           | Filtro de dominio del plan gratis: pedir aprobación manual a soporte con `intheloop.agency`                                                                             |
| Funciona en local pero no en producción                        | Revisar lo anterior, MX del dominio y que el POST salga desde el navegador (Web3Forms bloquea llamadas server-side con `403`)                                           |
| CORS / 301                                                     | Ya se usa `Content-Type: application/json` + `Accept: application/json` y no se envía `redirect`, que es la combinación que documenta Web3Forms                         |
| El correo llega a Spam                                         | Agregar `notify@web3forms.com` a contactos y marcar como "No es spam"                                                                                                   |
