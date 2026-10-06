"use client";

import { useRef, useEffect, type ReactNode } from "react";
import { gsap } from "@/lib/motion";

interface Props {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
}

export function MagneticButton({ children, className = "", onClick, href }: Props) {
  const ref = useRef<HTMLButtonElement & HTMLAnchorElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const inner = innerRef.current;
    if (!el || !inner) return;

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(inner, { x: x * 0.35, y: y * 0.5, duration: 0.4, ease: "power3.out" });
      gsap.to(el, { x: x * 0.15, y: y * 0.15, duration: 0.6, ease: "power3.out" });
    };
    const handleLeave = () => {
      gsap.to([inner, el], { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1,0.4)" });
    };

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);
    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  const common = `relative inline-flex items-center justify-center rounded-full px-8 py-4 font-bold uppercase tracking-widest transition-colors ${className}`;

  if (href) {
    return (
      <a ref={ref as any} href={href} className={common}>
        <span ref={innerRef} className="pointer-events-none">
          {children}
        </span>
      </a>
    );
  }

  return (
    <button ref={ref as any} onClick={onClick} className={common}>
      <span ref={innerRef} className="pointer-events-none">
        {children}
      </span>
    </button>
  );
}
