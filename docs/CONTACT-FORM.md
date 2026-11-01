# Formulario de contacto (sitio estático)

El navegador envía directamente al webhook público de n8n. No hay API route ni
SMTP en Next.js. Nunca agregues secretos al repositorio ni a NEXT_PUBLIC_. La URL
es pública y no debe contener claves ni credenciales: no es una protección antispam.

## Configuración

En GitHub → Settings → Secrets and variables → Actions → Variables, crear
`CONTACT_WEBHOOK_URL` con la URL HTTPS de producción del Webhook. El workflow la
expone como `NEXT_PUBLIC_CONTACT_WEBHOOK_URL` durante el build. En local usar esa
variable en `.env.local`. Después de cambiarla es necesario reconstruir/desplegar.
Sin variable, el sitio funciona y el formulario muestra un error con el email.

## Contrato

- Método: POST. Content-Type: application/json. Sin cookies ni autenticación.
- Campos JSON: `name` (2–120 caracteres), `email` (email obligatorio, máx. 254),
  `event` (2–200), `date` (texto libre, 4–100), `city` (2–200), `message`
  (10–5000), `honeypot` (debe ser vacío), `locale` (`es` o `en`). Los textos se
  envían sin espacios al principio/final. Todos son strings.
- Destino fijo del correo, configurado en n8n: `events@intheloop.agency`.
  No aceptar un destinatario arbitrario desde el navegador.
- Éxito: HTTP 200 y JSON `{"ok":true}`, solo después de que Send Email termine
  correctamente. Esto confirma aceptación SMTP, no entrega garantizada al buzón.
- Fallo: HTTP 4xx/5xx. El cliente no muestra respuestas internas del servidor.
- Timeout del cliente: 15 segundos, incluyendo la lectura de la respuesta.
  Conserva los datos ante un error; no reintenta automáticamente. Un timeout puede
  ocurrir después del envío: reintentar podría duplicar el correo.

## Flujo en n8n

1. Nodo **Webhook**, POST, ruta propia, URL de producción; activar el workflow.
   Responder mediante **Respond to Webhook**, no inmediatamente al recibir.
2. Validar en servidor longitudes, tipos, email, locale y honeypot. Rechazar bots
   y datos inválidos antes del envío. Agregar rate limiting en proxy/n8n: la
   validación del cliente y el honeypot no son medidas de seguridad suficientes.
3. Nodo **Send Email**: credenciales SMTP guardadas en el almacén de credenciales
   de n8n. From: una cuenta autorizada por ese SMTP. To: events@intheloop.agency.
   Reply-To: el `body.email` validado del visitante. No usar al visitante como From.
   Usar cuerpo de texto con nombre, evento, fecha, ciudad y mensaje; si se usa HTML,
   escapar el contenido. Evitar inyección de cabeceras (rechazar CR/LF en email).
4. **Respond to Webhook**: HTTP 200, JSON `{"ok":true}` después de Send Email.
   Configurar respuesta de error sin secretos si SMTP falla.
5. CORS: permitir el origen del sitio (y el origen local de prueba), método POST,
   cabecera Content-Type y preflight OPTIONS en n8n o su proxy. El POST JSON entre
   orígenes requiere preflight. No usar `no-cors`, que impide confirmar el resultado.

## Pruebas

Probar en `/es/` y `/en/`: campos vacíos, email inválido, mensaje de 9 caracteres,
respuesta correcta, HTTP 500, JSON sin `ok:true`, red caída y demora >15 segundos.
Sin variable debe mostrarse el error de configuración sin abrir un cliente mail.
Verificar en n8n la recepción del JSON y en el buzón el Reply-To del visitante.
El honeypot rellenado no debe generar ninguna petición. No se envían secretos.
No se probó entrega SMTP real: requiere tu flujo y credenciales de n8n.
