"use client";

import { useState, useId } from "react";
import { z } from "zod";

const BookingSchema = z.object({
  name: z.string().min(2, "Nombre muy corto, mínimo 2 caracteres"),
  event: z.string().min(2, "Evento requerido, mínimo 2 caracteres"),
  date: z.string().min(4, "Fecha requerida"),
  city: z.string().min(2, "Ciudad requerida"),
  message: z.string().min(10, "Mensaje mínimo 10 caracteres"),
  honeypot: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
});

type BookingForm = z.infer<typeof BookingSchema>;

export function BookingForm({ contactEmail }: { contactEmail: string }) {
  const [form, setForm] = useState<BookingForm>({
    name: "",
    event: "",
    date: "",
    city: "",
    message: "",
    honeypot: "",
    email: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const formId = useId();

  const handleChange = (field: keyof BookingForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.honeypot) {
      setStatus("success");
      return;
    }

    const parsed = BookingSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      // Focus first error
      const firstErrorField = Object.keys(fieldErrors)[0];
      if (firstErrorField) {
        document.getElementById(`${formId}-${firstErrorField}`)?.focus();
      }
      return;
    }

    setStatus("sending");
    setErrorMsg("");

    // Sitio estático (GitHub Pages): no hay API routes. Si está configurado,
    // se POSTea directo al webhook (n8n); el mailto de respaldo siempre corre.
    const webhook = process.env.NEXT_PUBLIC_BOOKING_WEBHOOK_URL;
    if (webhook) {
      try {
        await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        });
      } catch (e) {
        console.warn("Webhook de booking falló, sigue el mailto de respaldo", e);
      }
    }

    setStatus("success");

    const subject = `Booking: ${form.event} - ${form.city} - ${form.date}`;
    const body = `Hola Tommy,\n\nNombre: ${form.name}\nEvento: ${form.event}\nFecha: ${form.date}\nCiudad: ${form.city}\nEmail: ${form.email}\n\nMensaje:\n${form.message}\n\n---\nEnviado desde intheloop.agency`;
    const mailto = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    setTimeout(() => {
      window.open(mailto, "_blank");
    }, 500);
  };

  if (status === "success") {
    return (
      <div
        className="rounded-[2rem] border border-[var(--accent-lime)] bg-[var(--accent-lime)]/10 p-8 text-center"
        role="alert"
        aria-live="polite"
      >
        <div className="font-display text-2xl font-bold text-[var(--accent-lime)]">
          ¡Mensaje enviado!
        </div>
        <div className="mt-2 font-mono text-xs tracking-widest text-[var(--fg-muted)] uppercase">
          Gracias {form.name}. Te respondemos en 24h. Se abrió tu cliente de mail como respaldo.
        </div>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 rounded-full bg-[var(--fg)] px-6 py-3 font-mono text-xs tracking-widest text-black uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
          autoFocus
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[2rem] border border-[var(--border)] bg-[var(--bg)] p-8"
      noValidate
      aria-label="Formulario de booking"
      aria-describedby={`${formId}-description`}
    >
      <div className="mb-6 flex items-center justify-between">
        <div
          id={`${formId}-description`}
          className="font-mono text-xs tracking-widest text-[var(--fg-muted)] uppercase"
        >
          Formulario booking • Respuesta 24h • Campos con * requeridos
        </div>
        <div className="flex items-center gap-2" aria-live="polite" aria-atomic="true">
          <span
            className={`h-2 w-2 rounded-full ${status === "sending" ? "animate-pulse bg-[var(--accent-fire)]" : "bg-[var(--border)]"}`}
            aria-hidden="true"
          />
          <span className="font-mono text-[10px] text-[var(--fg-dim)] uppercase">
            {status === "sending" ? "Enviando..." : "Listo"}
          </span>
        </div>
      </div>

      {/* Honeypot - hidden */}
      <div className="absolute top-auto left-[-5000px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor={`${formId}-honeypot`}>No llenar este campo (anti-spam)</label>
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
      </div>

      <fieldset className="grid gap-4 border-0 p-0">
        <legend className="sr-only">Información de contacto y evento</legend>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor={`${formId}-name`}
              className="font-mono text-[10px] tracking-widest text-[var(--fg-muted)] uppercase"
            >
              Nombre <span aria-hidden="true">*</span>
              <span className="sr-only">(requerido)</span>
            </label>
            <input
              id={`${formId}-name`}
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Tu nombre"
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
                {errors.name}
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor={`${formId}-email`}
              className="font-mono text-[10px] tracking-widest text-[var(--fg-muted)] uppercase"
            >
              Email
            </label>
            <input
              id={`${formId}-email`}
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="tu@email.com"
              className={`mt-1 w-full rounded-full border bg-[var(--bg-2)] px-4 py-3 font-sans text-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)] ${errors.email ? "border-red-500" : "border-[var(--border)] focus:border-[var(--accent-fire)]"}`}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? `${formId}-email-error` : `${formId}-email-hint`}
              autoComplete="email"
            />
            <div id={`${formId}-email-hint`} className="sr-only">
              Opcional, para responderte más rápido
            </div>
            {errors.email && (
              <div
                id={`${formId}-email-error`}
                className="mt-1 font-mono text-[10px] text-red-400"
                role="alert"
              >
                {errors.email}
              </div>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor={`${formId}-event`}
            className="font-mono text-[10px] tracking-widest text-[var(--fg-muted)] uppercase"
          >
            Evento <span aria-hidden="true">*</span>
            <span className="sr-only">(requerido)</span>
          </label>
          <input
            id={`${formId}-event`}
            type="text"
            value={form.event}
            onChange={(e) => handleChange("event", e.target.value)}
            placeholder="Nombre del evento / club / festival"
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
              {errors.event}
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor={`${formId}-date`}
              className="font-mono text-[10px] tracking-widest text-[var(--fg-muted)] uppercase"
            >
              Fecha <span aria-hidden="true">*</span>
              <span className="sr-only">(requerido)</span>
            </label>
            <input
              id={`${formId}-date`}
              type="text"
              value={form.date}
              onChange={(e) => handleChange("date", e.target.value)}
              placeholder="Ej: 15 Marzo 2026"
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
                {errors.date}
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor={`${formId}-city`}
              className="font-mono text-[10px] tracking-widest text-[var(--fg-muted)] uppercase"
            >
              Ciudad <span aria-hidden="true">*</span>
              <span className="sr-only">(requerido)</span>
            </label>
            <input
              id={`${formId}-city`}
              type="text"
              value={form.city}
              onChange={(e) => handleChange("city", e.target.value)}
              placeholder="Ej: CABA, Berlín, París"
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
                {errors.city}
              </div>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor={`${formId}-message`}
            className="font-mono text-[10px] tracking-widest text-[var(--fg-muted)] uppercase"
          >
            Mensaje <span aria-hidden="true">*</span>
            <span className="sr-only">(requerido, mínimo 10 caracteres)</span>
          </label>
          <textarea
            id={`${formId}-message`}
            value={form.message}
            onChange={(e) => handleChange("message", e.target.value)}
            placeholder="Contame sobre el evento, público, equipo, etc."
            rows={4}
            className={`mt-1 w-full rounded-2xl border bg-[var(--bg-2)] px-4 py-3 font-sans text-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)] ${errors.message ? "border-red-500" : "border-[var(--border)] focus:border-[var(--accent-fire)]"}`}
            required
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? `${formId}-message-error` : `${formId}-message-hint`}
          />
          <div
            id={`${formId}-message-hint`}
            className="mt-1 font-mono text-[10px] text-[var(--fg-dim)]"
          >
            Mínimo 10 caracteres, contá sobre el evento
          </div>
          {errors.message && (
            <div
              id={`${formId}-message-error`}
              className="mt-1 font-mono text-[10px] text-red-400"
              role="alert"
            >
              {errors.message}
            </div>
          )}
        </div>
      </fieldset>

      {status === "error" && (
        <div
          className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 font-mono text-xs text-red-300"
          role="alert"
          aria-live="assertive"
        >
          {errorMsg} — Se abrió mailto como respaldo.
        </div>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[var(--accent-fire)] px-6 py-4 text-sm font-bold tracking-widest text-black uppercase transition-all hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)] disabled:opacity-50 disabled:hover:scale-100"
        style={{ boxShadow: `0 0 calc(10px + var(--bass) * 20px) rgba(255,90,31,0.3)` }}
        data-cursor="view"
        aria-label={status === "sending" ? "Enviando formulario" : "Enviar formulario de booking"}
      >
        {status === "sending" ? "Enviando..." : "Enviar booking →"}
      </button>

      <div className="mt-3 text-center font-mono text-[10px] tracking-widest text-[var(--fg-dim)] uppercase">
        Respuesta en 24h • Webhook n8n + mailto fallback • No spam • Datos protegidos
      </div>
    </form>
  );
}
