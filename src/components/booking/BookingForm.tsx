"use client";

import { useState } from "react";
import { z } from "zod";
import { useAudioReactive } from "@/hooks/useAudioReactive";

const BookingSchema = z.object({
  name: z.string().min(2, "Nombre muy corto"),
  event: z.string().min(2, "Evento requerido"),
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
  const { bass } = useAudioReactive();

  const handleChange = (field: keyof BookingForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot
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
      return;
    }

    setStatus("sending");
    setErrorMsg("");

    try {
      // Try webhook first
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al enviar");
      }

      setStatus("success");

      // Also open mailto as fallback / confirmation
      const subject = `Booking: ${form.event} - ${form.city} - ${form.date}`;
      const body = `Hola Tommy,\n\nNombre: ${form.name}\nEvento: ${form.event}\nFecha: ${form.date}\nCiudad: ${form.city}\nEmail: ${form.email}\n\nMensaje:\n${form.message}\n\n---\nEnviado desde intheloop.agency`;
      const mailto = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      // Delay mailto to avoid popup blocker confusion
      setTimeout(() => {
        window.open(mailto, "_blank");
      }, 500);
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Error al enviar. Probá mail directo.");

      // Fallback mailto
      const subject = `Booking: ${form.event} - ${form.city}`;
      const body = `Nombre: ${form.name}\nEvento: ${form.event}\nFecha: ${form.date}\nCiudad: ${form.city}\nMensaje: ${form.message}`;
      window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-[2rem] border border-[var(--accent-lime)] bg-[var(--accent-lime)]/10 p-8 text-center">
        <div className="font-display text-2xl font-bold text-[var(--accent-lime)]">¡Mensaje enviado!</div>
        <div className="mt-2 font-mono text-xs uppercase tracking-widest text-[var(--fg-muted)]">
          Gracias {form.name}. Te respondemos en 24h. Se abrió tu cliente de mail como respaldo.
        </div>
        <button onClick={() => setStatus("idle")} className="mt-6 rounded-full bg-[var(--fg)] px-6 py-2 font-mono text-xs uppercase tracking-widest text-black">
          Enviar otro
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[2rem] border border-[var(--border)] bg-[var(--bg)] p-8" noValidate>
      <div className="mb-6 flex items-center justify-between">
        <div className="font-mono text-xs uppercase tracking-widest text-[var(--fg-muted)]">Formulario booking • Zod + honeypot + webhook</div>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${status === "sending" ? "animate-pulse bg-[var(--accent-fire)]" : "bg-[var(--border)]"}`} />
          <span className="font-mono text-[10px] uppercase text-[var(--fg-dim)]">{status === "sending" ? "Enviando..." : "Listo"}</span>
        </div>
      </div>

      {/* Honeypot - hidden */}
      <div className="absolute left-[-5000px] top-auto h-0 w-0 overflow-hidden" aria-hidden="true">
        <label>
          No llenar
          <input type="text" name="honeypot" value={form.honeypot} onChange={(e) => handleChange("honeypot", e.target.value)} tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-[var(--fg-muted)]">Nombre *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Tu nombre"
              className={`mt-1 w-full rounded-full border bg-[var(--bg-2)] px-4 py-3 font-sans text-sm outline-none transition-colors ${errors.name ? "border-red-500" : "border-[var(--border)] focus:border-[var(--accent-fire)]"}`}
              required
              aria-invalid={!!errors.name}
            />
            {errors.name && <div className="mt-1 font-mono text-[10px] text-red-400">{errors.name}</div>}
          </div>

          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-[var(--fg-muted)]">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="tu@email.com"
              className={`mt-1 w-full rounded-full border bg-[var(--bg-2)] px-4 py-3 font-sans text-sm outline-none ${errors.email ? "border-red-500" : "border-[var(--border)] focus:border-[var(--accent-fire)]"}`}
            />
            {errors.email && <div className="mt-1 font-mono text-[10px] text-red-400">{errors.email}</div>}
          </div>
        </div>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-[var(--fg-muted)]">Evento *</label>
          <input
            type="text"
            value={form.event}
            onChange={(e) => handleChange("event", e.target.value)}
            placeholder="Nombre del evento / club / festival"
            className={`mt-1 w-full rounded-full border bg-[var(--bg-2)] px-4 py-3 font-sans text-sm outline-none ${errors.event ? "border-red-500" : "border-[var(--border)] focus:border-[var(--accent-fire)]"}`}
            required
          />
          {errors.event && <div className="mt-1 font-mono text-[10px] text-red-400">{errors.event}</div>}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-[var(--fg-muted)]">Fecha *</label>
            <input
              type="text"
              value={form.date}
              onChange={(e) => handleChange("date", e.target.value)}
              placeholder="Ej: 15 Marzo 2026"
              className={`mt-1 w-full rounded-full border bg-[var(--bg-2)] px-4 py-3 font-sans text-sm outline-none ${errors.date ? "border-red-500" : "border-[var(--border)] focus:border-[var(--accent-fire)]"}`}
              required
            />
            {errors.date && <div className="mt-1 font-mono text-[10px] text-red-400">{errors.date}</div>}
          </div>

          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-[var(--fg-muted)]">Ciudad *</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => handleChange("city", e.target.value)}
              placeholder="Ej: CABA, Berlín, París"
              className={`mt-1 w-full rounded-full border bg-[var(--bg-2)] px-4 py-3 font-sans text-sm outline-none ${errors.city ? "border-red-500" : "border-[var(--border)] focus:border-[var(--accent-fire)]"}`}
              required
            />
            {errors.city && <div className="mt-1 font-mono text-[10px] text-red-400">{errors.city}</div>}
          </div>
        </div>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-[var(--fg-muted)]">Mensaje *</label>
          <textarea
            value={form.message}
            onChange={(e) => handleChange("message", e.target.value)}
            placeholder="Contame sobre el evento, público, equipo, etc."
            rows={4}
            className={`mt-1 w-full rounded-2xl border bg-[var(--bg-2)] px-4 py-3 font-sans text-sm outline-none ${errors.message ? "border-red-500" : "border-[var(--border)] focus:border-[var(--accent-fire)]"}`}
            required
          />
          {errors.message && <div className="mt-1 font-mono text-[10px] text-red-400">{errors.message}</div>}
        </div>
      </div>

      {status === "error" && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 font-mono text-xs text-red-300">
          {errorMsg} — Se abrió mailto como respaldo.
        </div>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[var(--accent-fire)] px-6 py-4 text-sm font-bold uppercase tracking-widest text-black transition-all hover:scale-[1.02] disabled:opacity-50"
        style={{ boxShadow: `0 0 ${10 + bass * 20}px rgba(255,90,31,0.3)` }}
        data-cursor="view"
      >
        {status === "sending" ? "Enviando..." : "Enviar booking →"}
      </button>

      <div className="mt-3 text-center font-mono text-[10px] uppercase tracking-widest text-[var(--fg-dim)]">
        Respuesta en 24h • Webhook n8n + mailto fallback • No spam
      </div>
    </form>
  );
}
