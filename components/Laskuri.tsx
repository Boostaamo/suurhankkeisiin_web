"use client";

import { useEffect, useRef, useState } from "react";

// Luku, joka laskee nollasta arvoonsa, kun se tulee näkyviin. Kunnioittaa "vähennä liikettä" -asetusta.
export default function Laskuri({ arvo, desimaalit = 0, kesto = 1400 }: { arvo: number; desimaalit?: number; kesto?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(arvo);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || typeof IntersectionObserver === "undefined") return;
    setN(0);
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const askel = (t: number) => {
        const s = Math.min(1, (t - t0) / kesto);
        setN(arvo * (1 - Math.pow(1 - s, 4)));
        if (s < 1) raf = requestAnimationFrame(askel);
      };
      raf = requestAnimationFrame(askel);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [arvo, kesto]);
  return <span ref={ref}>{n.toLocaleString("fi-FI", { minimumFractionDigits: desimaalit, maximumFractionDigits: desimaalit })}</span>;
}
