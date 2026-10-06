import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center bg-[var(--bg)] px-6 text-center">
      <div className="font-display text-[clamp(48px,12vw,120px)] font-bold leading-none">404</div>
      <div className="mt-4 font-mono text-xs uppercase tracking-widest text-[var(--fg-muted)]">
        La pista que buscás no existe... pero la fiesta sigue
      </div>
      <Link href="/" className="mt-8 rounded-full bg-[var(--accent-fire)] px-8 py-3 font-bold uppercase tracking-widest text-black">
        Volver al inicio
      </Link>
      {/* TODO Fase 4: 404 interactiva con visualizador y easter egg */}
    </div>
  );
}
