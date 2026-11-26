"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { vaiheSlug, type HankeRivi } from "@/lib/vaihe";
import { track } from "@/lib/analytics";

// Hankeputki: aktiiviset hankkeet vaiheittain suunnittelusta rakentamiseen. Palkit kasvavat näkyviin tultaessa.
// onValitse annettuna (hankelista) klikkaus suodattaa listan, muuten linkki vie /hankkeet?vaihe=…
export const PUTKI = ["Suunnittelu", "Luvitus", "Investointipäätös", "Rakenteilla"];
const SIVUUN = ["Keskeytetty", "Ei tietoa"];

export default function Hankeputki({ rivit, valittu = "", onValitse }: { rivit: HankeRivi[]; valittu?: string; onValitse?: (v: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [nakyy, setNakyy] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return setNakyy(true);
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNakyy(true); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const n = (v: string) => rivit.filter((r) => r.vaihe === v).length;
  const max = Math.max(1, ...PUTKI.map(n));
  const summa = (v: string) => rivit.filter((r) => r.vaihe === v && r.investointi_meur != null).reduce((a, r) => a + (r.investointi_meur ?? 0), 0);
  const vaihe = (v: string, i: number) => {
    const c = n(v);
    const sisus = (
      <>
        <span className="putki-n">{c}</span>
        <span className="putki-nimi">{v}</span>
        <span className="putki-palkki"><i className={`c-${vaiheSlug(v)}`} style={{ width: nakyy ? `${(c / max) * 100}%` : 0, transitionDelay: `${i * 120}ms` }} /></span>
        {summa(v) ? <span className="putki-raha">ilmoitettu {summa(v) >= 1000 ? `${(summa(v) / 1000).toLocaleString("fi-FI", { maximumFractionDigits: 1 })} mrd €` : `${summa(v)} M€`}</span> : <span className="putki-raha">&nbsp;</span>}
      </>
    );
    const cls = `putki-vaihe${valittu === v ? " on" : ""}`;
    return onValitse ? (
      <button key={v} type="button" className={cls} aria-pressed={valittu === v} onClick={() => { track("click_putki", { vaihe: v }); onValitse(valittu === v ? "" : v); }}>{sisus}</button>
    ) : (
      <Link key={v} href={`/hankkeet?vaihe=${encodeURIComponent(v)}#kaikki`} className={cls} onClick={() => track("click_putki", { vaihe: v })}>{sisus}</Link>
    );
  };
  const sivu = SIVUUN.filter((v) => n(v));
  return (
    <div className="putki" ref={ref}>
      <div className="putki-rivi">{PUTKI.map(vaihe)}</div>
      {sivu.length ? <p className="muted small">Lisäksi {sivu.map((v) => `${v.toLowerCase()}: ${n(v)}`).join(", ")}. Investointisummat vain hankkeista, joilla summa on julkisessa lähteessä.</p> : <p className="muted small">Investointisummat vain hankkeista, joilla summa on julkisessa lähteessä.</p>}
    </div>
  );
}
