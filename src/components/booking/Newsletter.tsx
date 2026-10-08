"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { z } from "zod";

const Schema = z.object({
  email: z.string().email("Email inválido"),
  honeypot: z.string().optional(),
});

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) {
      setStatus("success");
      return;
    }

    const parsed = Schema.safeParse({ email, honeypot });
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }

    setStatus("sending");
    setError("");

    // Sitio estático (GitHub Pages): no hay API routes. Si hay endpoint
    // público configurado se POSTea directo; si no, se registra igual.
    const endpoint = process.env.NEXT_PUBLIC_NEWSLETTER_ENDPOINT;
    if (endpoint) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!res.ok) throw new Error("Error");
      } catch {
        setStatus("error");
        setError("Error al suscribir. Probá más tarde.");
        return;
      }
    }

    setStatus("success");
    setEmail("");
  };

  if (status === "success") {
    return (
      <div className="flex items-center justify-center gap-1.5 rounded-2xl border border-[var(--accent-lime)] bg-[var(--accent-lime)]/10 p-4 text-center font-mono text-xs uppercase text-[var(--accent-lime)]">
        ¡Suscripto! Gracias
        {/* Icono SVG: U+2665 puede renderizarse como emoji en mobile */}
        <Heart className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
      <div className="font-mono text-xs uppercase tracking-widest text-[var(--fg-muted)]">Newsletter</div>

      <div className="absolute left-[-5000px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <input type="text" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="min-w-0 flex-1 rounded-full border border-[var(--border)] bg-[var(--bg)] px-4 py-2 font-mono text-xs uppercase outline-none focus:border-[var(--accent-fire)]"
          required
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="shrink-0 rounded-full bg-[var(--fg)] px-6 py-2 font-mono text-xs font-bold uppercase tracking-widest text-black hover:bg-[var(--accent-lime)] disabled:opacity-50"
        >
          {status === "sending" ? "..." : "OK"}
        </button>
      </div>

      {error && <div className="font-mono text-[10px] text-red-400">{error}</div>}
      {status === "error" && <div className="font-mono text-[10px] text-red-400">Error. Probá más tarde.</div>}

      <div className="font-mono text-[9px] uppercase tracking-widest text-[var(--fg-dim)]">Sin spam • Solo fechas y música nueva</div>
    </form>
  );
}
