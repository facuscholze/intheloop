"use client";

/**
 * Reference-counted body scroll lock shared by Menu, CineMode and the
 * gallery lightbox. Multiple overlays can be open at once without one of
 * them accidentally unlocking the scroll of the other (the old per-component
 * `document.body.style.overflow = ""` did exactly that), and every close
 * path (button, Esc, popstate, unmount) unlocks idempotently.
 */

const locks = new Set<symbol>();

export function lockScroll(): symbol {
  const token = Symbol("scroll-lock");
  locks.add(token);
  if (typeof document !== "undefined") {
    document.body.style.overflow = "hidden";
  }
  return token;
}

export function unlockScroll(token: symbol): void {
  if (!locks.delete(token)) return; // already released — no-op
  if (typeof document !== "undefined" && locks.size === 0) {
    document.body.style.overflow = "";
  }
}
