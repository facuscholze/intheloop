"use client";

import { useRef, useEffect, type ReactNode, type RefObject } from "react";
import { gsap } from "@/lib/motion";

interface Props {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  /** Si se pasa, el CTA es un <a href> (navegación/anclas). */
  href?: string;
  ariaLabel?: string;
}

/**
 * CTA con efecto magnético (imán hacia el cursor).
 *
 * IMPORTANTE: el elemento interactivo es UNO solo — el <a> cuando hay href,
 * o el <button> cuando hay onClick. Antes el componente envolvía a sus hijos
 * en un <span class="pointer-events-none">, así que cualquier <a> anidado por
 * el call site (Header, Hero) heredaba `pointer-events: none` (la propiedad es
 * heredable) y el click nunca llegaba al link: el botón "BOOK TOMMY" quedaba
 * muerto. Además generaba HTML inválido (<button> con un <a> adentro).
 *
 * El <span> interno del label sí lleva pointer-events-none a propósito: el
 * label se mueve con GSAP y así el hit-testing queda clavado en el CTA.
 */
export function MagneticButton({ children, className = "", onClick, href, ariaLabel }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const innerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const inner = innerRef.current;
    if (!el || !inner) return;

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(inner, {
        x: x * 0.35,
        y: y * 0.5,
        duration: 0.4,
        ease: "power3.out",
        overwrite: "auto",
      });
      gsap.to(el, {
        x: x * 0.15,
        y: y * 0.15,
        duration: 0.6,
        ease: "power3.out",
        overwrite: "auto",
      });
    };
    const handleLeave = () => {
      gsap.to([inner, el], {
        x: 0,
        y: 0,
        duration: 0.8,
        ease: "elastic.out(1,0.4)",
        overwrite: "auto",
      });
    };

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  const common = `relative inline-flex items-center justify-center rounded-full font-bold uppercase tracking-widest transition-colors ${className}`;
  const label = (
    <span ref={innerRef} className="pointer-events-none inline-flex items-center gap-2">
      {children}
    </span>
  );

  if (href) {
    return (
      <a
        ref={ref as RefObject<HTMLAnchorElement>}
        href={href}
        onClick={onClick}
        className={common}
        aria-label={ariaLabel}
      >
        {label}
      </a>
    );
  }

  return (
    <button
      ref={ref as RefObject<HTMLButtonElement>}
      type="button"
      onClick={onClick}
      className={common}
      aria-label={ariaLabel}
    >
      {label}
    </button>
  );
}
