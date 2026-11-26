"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

// Jakopainikkeet ja seuranta: LinkedIn, linkin kopiointi ja RSS. Jakokuva syntyy sivun opengraph-image-tiedostosta.
export default function Jaa({ polku, otsikko, syote, kalenteri }: { polku: string; otsikko: string; syote?: string; kalenteri?: string }) {
  const [kopioitu, setKopioitu] = useState(false);
  const url = () => `${window.location.origin}${polku}`;
  const li = () => {
    track("share", { method: "linkedin", content_type: "hanke", item_id: polku });
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url())}`, "_blank", "noopener,width=640,height=640");
  };
  const kopioi = async () => {
    try { await navigator.clipboard.writeText(url()); setKopioitu(true); window.setTimeout(() => setKopioitu(false), 2000); } catch { /* ei leikepöytää */ }
    track("share", { method: "kopioi", content_type: "hanke", item_id: polku });
  };
  return (
    <div className="jaa" aria-label={`Jaa ja seuraa: ${otsikko}`}>
      <button type="button" className="jaa-nappi" onClick={li}>
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1V21h-4v-5.1c0-1.22-.02-2.78-1.7-2.78-1.7 0-1.96 1.33-1.96 2.7V21h-4z" /></svg>
        Jaa LinkedInissä
      </button>
      <button type="button" className="jaa-nappi" onClick={kopioi} aria-live="polite">{kopioitu ? "Linkki kopioitu ✓" : "Kopioi linkki"}</button>
      {syote ? <a className="jaa-nappi" href={syote} data-track="click_rss">RSS-syöte</a> : null}
      {kalenteri ? <a className="jaa-nappi" href={kalenteri} data-track="click_kalenteri">Tapahtumat kalenteriin</a> : null}
    </div>
  );
}
