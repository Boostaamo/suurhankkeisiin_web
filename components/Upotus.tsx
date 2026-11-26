"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";

// Kunnalle: upotuskoodi, jolla kunnan hankkeet saa näkyviin omille sivuille (iframe /upotus/<maakunta>/<kunta>).
export default function Upotus({ polku, kunta, genetiivi }: { polku: string; kunta: string; genetiivi: string }) {
  const [origin, setOrigin] = useState("https://suurhankkeisiin.fi");
  const [kopioitu, setKopioitu] = useState(false);
  useEffect(() => setOrigin(window.location.origin), []);
  const koodi = `<iframe src="${origin}${polku}" title="${genetiivi} suurhankkeet" width="100%" height="520" style="border:0;max-width:720px" loading="lazy"></iframe>`;
  return (
    <details className="upotus" onToggle={(e) => { if ((e.target as HTMLDetailsElement).open) track("upotus_avaus", { kunta }); }}>
      <summary>Kunnalle: näytä {genetiivi} hankkeet omilla sivuillanne</summary>
      <p>Kopioi koodi kunnan verkkosivulle. Näkymä päivittyy automaattisesti, kun hankkeisiin tulee uutta tietoa. <a href={polku} target="_blank" rel="noopener">Esikatsele näkymää</a>.</p>
      <pre className="koodi"><code>{koodi}</code></pre>
      <button type="button" className="btn sm" onClick={async () => { try { await navigator.clipboard.writeText(koodi); setKopioitu(true); track("upotus_kopioi", { kunta }); } catch { /* ei leikepöytää */ } }}>
        {kopioitu ? "Koodi kopioitu ✓" : "Kopioi upotuskoodi"}
      </button>
    </details>
  );
}
