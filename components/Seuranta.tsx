"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

// Mittaus kolmella tasolla: maakunta, kunta ja hanke. Parametrit asetetaan myös myöhemmille tapahtumille
// (esim. sign_up), jotta GA4:n mukautetuilla ulottuvuuksilla saa raportit tasoittain.
export default function Seuranta({ taso, maakunta = "", kunta = "", hanke = "" }: { taso: "maakunta" | "kunta" | "hanke"; maakunta?: string; kunta?: string; hanke?: string }) {
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (typeof window.gtag === "function") window.gtag("set", { maakunta, kunta, hanke });
      track("alue_nakyma", { taso, maakunta, kunta, hanke });
    }, 800); // annetaan GA:n latautua suostumuksen jälkeen
    return () => window.clearTimeout(t);
  }, [taso, maakunta, kunta, hanke]);
  return null;
}
