"use client";

import { useCallback, useEffect, useState } from "react";
import Kartta, { type KarttaPohja } from "@/components/Kartta";
import Hankeputki from "@/components/Hankeputki";
import Laskuri from "@/components/Laskuri";
import Syke from "@/components/Syke";
import { vaiheSlug, type HankeRivi } from "@/lib/vaihe";
import type { tunnusluvut } from "@/lib/tunnusluvut";

// Tilannehuone: vaihtuvat näkymät (kartta, hankeputki, uutiset, eniten uutisoidut). Nuolinäppäimet ja välilyönti ohjaavat.
type Props = {
  luvut: ReturnType<typeof tunnusluvut>; rivit: HankeRivi[]; pohja: KarttaPohja; maakunnat: Record<string, string>; lahde: string;
  uutiset: { otsikko: string; ingressi: string; julkaisija: string; pvm: string; kunta: string }[];
  kuumat: { nimi: string; kunta: string; vaihe: string; n: number; syke: number[] }[];
};
const KESTO = 15000;

export default function Tilannehuone({ luvut, rivit, pohja, maakunnat, lahde, uutiset, kuumat }: Props) {
  const nakymat = ["Kartta", "Hankeputki", "Uusimmat uutiset", ...(kuumat.length ? ["Eniten uutisoidut"] : [])];
  const [i, setI] = useState(0);
  const [tauko, setTauko] = useState(false);
  const [kello, setKello] = useState("");
  const siirry = useCallback((d: number) => setI((x) => (x + d + nakymat.length) % nakymat.length), [nakymat.length]);
  useEffect(() => {
    if (tauko) return;
    const t = window.setTimeout(() => siirry(1), KESTO);
    return () => window.clearTimeout(t);
  }, [i, tauko, siirry]);
  useEffect(() => {
    const k = () => setKello(new Date().toLocaleTimeString("fi-FI", { hour: "2-digit", minute: "2-digit" }));
    k(); const t = window.setInterval(k, 10000);
    const nappi = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") siirry(1); else if (e.key === "ArrowLeft") siirry(-1); else if (e.key === " ") { e.preventDefault(); setTauko((x) => !x); }
      else if (e.key === "f") document.documentElement.requestFullscreen?.().catch(() => {});
    };
    window.addEventListener("keydown", nappi);
    return () => { window.clearInterval(t); window.removeEventListener("keydown", nappi); };
  }, [siirry]);

  return (
    <div className="irrallinen tilannehuone">
      <header className="th-yla">
        <div className="wm">Suurhankkeisiin<span>.fi</span></div>
        <nav className="th-valinnat" aria-label="Näkymät">
          {nakymat.map((n, j) => <button key={n} type="button" className={j === i ? "on" : ""} onClick={() => setI(j)}>{n}</button>)}
        </nav>
        <div className="th-oikea">
          <button type="button" className="th-nappi" onClick={() => setTauko((x) => !x)}>{tauko ? "▶ Jatka" : "❚❚ Tauko"}</button>
          <button type="button" className="th-nappi" onClick={() => document.documentElement.requestFullscreen?.().catch(() => {})}>Koko näyttö</button>
          <span className="th-kello">{kello}</span>
        </div>
      </header>
      <div className="th-edistys"><i key={`${i}-${tauko}`} style={{ animationDuration: `${KESTO}ms`, animationPlayState: tauko ? "paused" : "running" }} /></div>
      <div className="th-runko">
        <aside className="th-luvut">
          <div><b><Laskuri arvo={luvut.hankkeita} /></b><span>aktiivista suurhanketta</span></div>
          <div><b><Laskuri arvo={luvut.rakenteilla} /></b><span>rakenteilla</span></div>
          <div><b><Laskuri arvo={luvut.investoinnitMrd} desimaalit={1} /> mrd €</b><span>ilmoitettuja investointeja ({luvut.summallisia} hanketta)</span></div>
          <div><b><Laskuri arvo={luvut.kuntia} /></b><span>kuntaa, {luvut.maakuntia} maakuntaa</span></div>
          <div><b><Laskuri arvo={luvut.uutisia30} /></b><span>uutista 30 päivässä</span></div>
        </aside>
        <main className="th-nakyma" key={i}>
          {nakymat[i] === "Kartta" ? (
            <div className="th-kartta"><Kartta pohja={pohja} rivit={rivit} maakunnat={maakunnat} otsikko="Suurhankkeet kartalla" /><p className="th-lahde">{lahde}</p></div>
          ) : nakymat[i] === "Hankeputki" ? (
            <div className="th-putki"><h2>Hankkeet vaiheittain</h2><Hankeputki rivit={rivit} /></div>
          ) : nakymat[i] === "Uusimmat uutiset" ? (
            <div className="th-uutiset"><h2>Uusimmat uutiset</h2>
              <ol>{uutiset.map((u, j) => <li key={j} style={{ animationDelay: `${j * 120}ms` }}><div className="th-meta">{u.pvm} · {u.julkaisija}{u.kunta ? ` · ${u.kunta}` : ""}</div><h3>{u.otsikko}</h3><p>{u.ingressi}</p></li>)}</ol>
            </div>
          ) : (
            <div className="th-kuumat"><h2>Eniten uutisoidut, 30 päivää</h2>
              <ol>{kuumat.map((k, j) => <li key={k.nimi} style={{ animationDelay: `${j * 120}ms` }}><span className="th-n">{j + 1}</span><div><h3>{k.nimi}</h3><div className="th-meta">{k.kunta} · <span className={`vaihe v-${vaiheSlug(k.vaihe)}`}>{k.vaihe}</span></div></div><div className="th-sk"><Syke syke={k.syke} leveys={160} korkeus={44} /><span>{k.n} uutista</span></div></li>)}</ol>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
