"use client";

import { useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  event: z.string().trim().min(2).max(200),
  date: z.string().trim().min(4).max(100),
  city: z.string().trim().min(2).max(200),
  message: z.string().trim().min(10).max(5000),
  honeypot: z.string().max(0),
});
const empty = { name: "", email: "", event: "", date: "", city: "", message: "", honeypot: "" };
type Field = Exclude<keyof typeof empty, "honeypot">;
const fields: Field[] = ["name", "email", "event", "date", "city", "message"];

export function BookingForm() {
  const t = useTranslations("booking.form");
  const locale = useLocale();
  const id = useId();
  const busy = useRef(false);
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy.current) return;
    if (form.honeypot) return; // No request for bots; server must validate too.
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const invalid = parsed.error.issues.map((issue) => String(issue.path[0]));
      setErrors(invalid);
      document.getElementById(`${id}-${invalid[0]}`)?.focus();
      return;
    }
    setErrors([]);
    const webhook = process.env.NEXT_PUBLIC_CONTACT_WEBHOOK_URL;
    if (!webhook) {
      setError(t("unconfigured"));
      setStatus("error");
      return;
    }
    busy.current = true;
    setStatus("sending");
    setError("");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const url = new URL(webhook);
      if (url.protocol !== "https:") throw new Error("HTTPS required");
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "omit",
        body: JSON.stringify({ ...parsed.data, locale }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("HTTP error");
      const result = await response.json();
      if (result?.ok !== true) throw new Error("Invalid acknowledgement");
      setStatus("success");
      setForm(empty);
    } catch {
      setError(t(controller.signal.aborted ? "timeout" : "error"));
      setStatus("error");
    } finally {
      clearTimeout(timeout);
      busy.current = false;
    }
  }

  return (
    <form onSubmit={submit} noValidate aria-label={t("title")} className="rounded-[2rem] border border-[var(--border)] bg-[var(--bg)] p-8">
      <h3 className="mb-6 font-mono text-xs uppercase tracking-widest">{t("title")}</h3>
      <div className="absolute left-[-5000px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor={`${id}-honeypot`}>Website</label>
        <input id={`${id}-honeypot`} name="honeypot" value={form.honeypot} tabIndex={-1} autoComplete="off" onChange={(e) => setForm({ ...form, honeypot: e.target.value })} />
      </div>
      <fieldset disabled={status === "sending"} className="grid gap-4 border-0 p-0">
        <legend className="sr-only">{t("title")}</legend>
        {fields.map((field) => {
          const inputId = `${id}-${field}`;
          const invalid = errors.includes(field);
          const common = {
            id: inputId, name: field, value: form[field], required: true,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
              setForm((previous) => ({ ...previous, [field]: e.target.value }));
              setErrors((previous) => previous.filter((key) => key !== field));
              setStatus("idle");
            },
            "aria-invalid": invalid,
            "aria-describedby": invalid ? `${inputId}-error` : field === "message" ? `${inputId}-hint` : undefined,
            className: `mt-1 w-full rounded-2xl border bg-[var(--bg-2)] px-4 py-3 text-sm outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent-lime)] ${invalid ? "border-red-500" : "border-[var(--border)]"}`,
          };
          return <div key={field}>
            <label htmlFor={inputId} className="font-mono text-xs uppercase tracking-widest">{t(field)} *</label>
            {field === "message" ? <textarea {...common} minLength={10} maxLength={5000} /> : <input {...common} type={field === "email" ? "email" : "text"} maxLength={field === "email" ? 254 : field === "name" ? 120 : field === "date" ? 100 : 200} autoComplete={field === "name" ? "name" : field === "email" ? "email" : field === "city" ? "address-level2" : "off"} />}
            {field === "message" && <p id={`${inputId}-hint`} className="mt-1 text-xs text-[var(--fg-muted)]">{t("messageHint")}</p>}
            {invalid && <p id={`${inputId}-error`} role="alert" className="mt-1 text-xs text-red-400">{t(field === "message" ? "messageInvalid" : "invalid")}</p>}
          </div>;
        })}
      </fieldset>
      <div aria-live="polite" role="status" className="mt-4 text-sm">
        {status === "sending" && t("sending")}
        {status === "success" && <span className="text-[var(--accent-lime)]">{t("success")}</span>}
      </div>
      {status === "error" && <p role="alert" className="mt-4 text-sm text-red-400">{error}</p>}
      <button type="submit" disabled={status === "sending"} className="mt-6 w-full rounded-full bg-[var(--accent-fire)] px-6 py-4 font-bold text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent-lime)] disabled:opacity-50">{t(status === "sending" ? "sending" : "submit")}</button>
    </form>
  );
}
