"use client";

import { useEffect } from "react";

// Avaa kaikki / Sulje kaikki -painikkeet <details>-osioille. Ankkurilinkki (#vaihe-...) avaa kohteen osion.
export default function AvaaKaikki({ kohde }: { kohde: string }) {
  const aseta = (auki: boolean) => document.querySelectorAll<HTMLDetailsElement>(kohde).forEach((d) => (d.open = auki));
  useEffect(() => {
    const avaaAnkkuri = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (id.startsWith("ilmoittaudu-")) { document.getElementById("ilmoittaudu")?.scrollIntoView({ behavior: "smooth" }); return; }
      const d = id ? document.getElementById(id)?.querySelector("details") : null;
      if (d) d.open = true;
    };
    avaaAnkkuri();
    window.addEventListener("hashchange", avaaAnkkuri);
    return () => window.removeEventListener("hashchange", avaaAnkkuri);
  }, []);
  return (
    <div className="avaakaikki">
      <button type="button" className="chip" onClick={() => aseta(true)}>Avaa kaikki</button>
      <button type="button" className="chip" onClick={() => aseta(false)}>Sulje kaikki</button>
    </div>
  );
}
