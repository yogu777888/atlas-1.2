"use client";

import { useEffect } from "react";

/**
 * Turns on the site's motion system: marks <html> with `js` (so reveal styles
 * only apply when there's script to undo them), reveals `[data-reveal]` blocks
 * as they scroll in, and feeds the cursor position to `.glow` covers.
 */
export function MotionRoot() {
  useEffect(() => {
    const root = document.documentElement;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.classList.add("js");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    const watch = (scope: ParentNode) =>
      scope.querySelectorAll<HTMLElement>("[data-reveal]:not(.in)").forEach((el) => (reduce ? el.classList.add("in") : io.observe(el)));
    watch(document);
    // Pages rendered after client-side navigation
    const mo = new MutationObserver((records) => records.forEach((r) => r.addedNodes.forEach((n) => n instanceof HTMLElement && watch(n.parentNode ?? n))));
    mo.observe(document.body, { childList: true, subtree: true });

    const onMove = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(".glow");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      io.disconnect();
      mo.disconnect();
      document.removeEventListener("pointermove", onMove);
    };
  }, []);
  return null;
}
