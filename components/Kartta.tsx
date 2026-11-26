"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { vaiheSlug, type HankeRivi } from "@/lib/vaihe";
import { track } from "@/lib/analytics";

// Interaktiivinen Suomen kartta: jokainen hanke on piste kuntansa keskuksen ympärillä, väri = vaihe, koko = ilmoitettu investointi.
// Kunnan klikkaus tarkentaa maakuntaan (onValitse) tai vie maakunnan sivulle. Pohjakartta: content/kartta.json (docs/kartta.md).
export type KarttaPohja = { leveys: number; korkeus: number; kunnat: { nimi: string; d: string; piste: [number, number]; rajaus: [number, number, number, number] }[] };
type Props = {
  pohja: KarttaPohja;
  rivit: HankeRivi[];
  maakunnat: Record<string, string>; // kunta -> maakunnan tunniste
  valittu?: string;
  onValitse?: (maakunta: string) => void;
  korostus?: string;
  otsikko?: string;
};
type Vb = [number, number, number, number];
type Vihje = { x: number; y: number; otsikko: string; rivit: string[] } | null;

const euroa = (m: number | null) => (m == null ? "" : m >= 1000 ? `noin ${(m / 1000).toLocaleString("fi-FI", { maximumFractionDigits: 1 })} mrd €` : `noin ${m.toLocaleString("fi-FI")} M€`);
const liikeVahennetty = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function Kartta({ pohja, rivit, maakunnat, valittu = "", onValitse, korostus, otsikko = "Suurhankkeet kartalla" }: Props) {
  const router = useRouter();
  const koko: Vb = [0, 0, pohja.leveys, pohja.korkeus];
  const [vb, setVb] = useState<Vb>(koko);
  const [vihje, setVihje] = useState<Vihje>(null);
  const anim = useRef<number>(0);
  const vbNyt = useRef<Vb>(koko);

  const kuntaPisteet = useMemo(() => new Map(pohja.kunnat.map((k) => [k.nimi, k])), [pohja]);
  const kuntiaDatassa = useMemo(() => new Set(rivit.map((r) => r.kunta)), [rivit]);

  // Tarkennus valittuun maakuntaan: kaikkien sen kuntien rajaus + reunus, animoituna.
  useEffect(() => {
    let kohde: Vb = koko;
    if (valittu) {
      const rr = pohja.kunnat.filter((k) => maakunnat[k.nimi] === valittu).map((k) => k.rajaus);
      if (rr.length) {
        const x0 = Math.min(...rr.map((r) => r[0])), y0 = Math.min(...rr.map((r) => r[1]));
        const x1 = Math.max(...rr.map((r) => r[2])), y1 = Math.max(...rr.map((r) => r[3]));
        // Sama kuvasuhde kuin koko kartalla, jotta vihjeiden prosenttisijainnit pitävät.
        const suhde = pohja.leveys / pohja.korkeus;
        let w = Math.max(x1 - x0, 150) * 1.25, h = Math.max(y1 - y0, 150) * 1.25;
        if (w / h > suhde) h = w / suhde; else w = h * suhde;
        kohde = [(x0 + x1) / 2 - w / 2, (y0 + y1) / 2 - h / 2, w, h];
      }
    }
    cancelAnimationFrame(anim.current);
    const alku = vbNyt.current;
    if (liikeVahennetty()) { vbNyt.current = kohde; setVb(kohde); return; }
    const t0 = performance.now(), kesto = 650;
    const askel = (t: number) => {
      const s = Math.min(1, (t - t0) / kesto), e = 1 - Math.pow(1 - s, 3);
      const v = alku.map((a, i) => a + (kohde[i] - a) * e) as Vb;
      vbNyt.current = v; setVb(v);
      if (s < 1) anim.current = requestAnimationFrame(askel);
    };
    anim.current = requestAnimationFrame(askel);
    return () => cancelAnimationFrame(anim.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valittu, pohja]);

  const mittakaava = vb[2] / pohja.leveys;
  const pisteet = useMemo(() => {
    const ryhmat = new Map<string, HankeRivi[]>();
    for (const r of rivit) ryhmat.set(r.kunta, [...(ryhmat.get(r.kunta) ?? []), r]);
    return [...ryhmat.entries()].flatMap(([kunta, lista]) => {
      const k = kuntaPisteet.get(kunta);
      if (!k) return [];
      return [...lista].sort((a, b) => (b.investointi_meur ?? 0) - (a.investointi_meur ?? 0)).map((r, i) => ({ r, i, k }));
    });
  }, [rivit, kuntaPisteet]);

  const nayta = (x: number, y: number, o: string, rr: string[]) => setVihje({ x: ((x - vb[0]) / vb[2]) * 100, y: ((y - vb[1]) / vb[3]) * 100, otsikko: o, rivit: rr });
  const kuntaKlikki = (nimi: string) => {
    const mk = maakunnat[nimi];
    if (!mk) return;
    track("click_kartta", { kohde: "kunta", kunta: nimi, maakunta: mk });
    if (onValitse) onValitse(mk === valittu ? "" : mk);
    else router.push(`/hankkeet/${mk}`);
  };

  return (
    <figure className="kartta" aria-label={otsikko}>
      <svg viewBox={vb.map((v) => v.toFixed(1)).join(" ")} role="img" aria-labelledby="kartta-otsikko" onMouseLeave={() => setVihje(null)}>
        <title id="kartta-otsikko">{otsikko}</title>
        <g className="kunnat">
          {pohja.kunnat.map((k) => {
            const mk = maakunnat[k.nimi];
            const cls = ["kunta", kuntiaDatassa.has(k.nimi) ? "on" : "", mk ? "mk" : "", valittu && mk === valittu ? "valittu" : ""].join(" ");
            const n = rivit.filter((r) => r.kunta === k.nimi).length;
            return (
              <path key={k.nimi} d={k.d} className={cls} style={{ strokeWidth: 0.6 * mittakaava }}
                onClick={mk ? () => kuntaKlikki(k.nimi) : undefined}
                onMouseEnter={() => nayta(k.piste[0], k.piste[1], k.nimi, n ? [`${n} ${n === 1 ? "hanke" : "hanketta"}`] : ["Ei seurattuja hankkeita"])} />
            );
          })}
        </g>
        <g className="pisteet">
          {pisteet.map(({ r, i, k }) => {
            const kulma = i * 2.39996, sade = 5.6 * Math.sqrt(i) * mittakaava;
            const x = k.piste[0] + Math.cos(kulma) * sade, y = k.piste[1] + Math.sin(kulma) * sade;
            const rr = (4 + (r.investointi_meur ? Math.min(5, Math.sqrt(r.investointi_meur) / 12) : 0)) * mittakaava;
            const tiedot = [`${r.kunta} · ${r.vaihe}`, r.tyyppi, euroa(r.investointi_meur)].filter(Boolean);
            return (
              <a key={r.polku} href={r.polku} aria-label={`${r.nimi}, ${r.kunta}, ${r.vaihe}`}
                onClick={(e) => { e.preventDefault(); track("click_kartta", { kohde: "hanke", hanke: r.nimi, kunta: r.kunta, maakunta: r.maakunta }); router.push(r.polku); }}
                onMouseEnter={() => nayta(x, y, r.nimi, tiedot)} onFocus={() => nayta(x, y, r.nimi, tiedot)} onBlur={() => setVihje(null)}>
                {korostus === r.polku ? <circle className="pulssi" cx={x} cy={y} r={rr * 2.6} /> : null}
                <circle className={`piste c-${vaiheSlug(r.vaihe)}${r.uusia ? " uusi" : ""}`} cx={x} cy={y} r={rr} style={{ strokeWidth: 0.9 * mittakaava, animationDelay: `${Math.min(i, 8) * 40 + (k.piste[1] / pohja.korkeus) * 500}ms` }} />
              </a>
            );
          })}
        </g>
      </svg>
      {vihje ? (
        <div className={`karttavihje${vihje.y < 22 ? " alas" : ""}`} style={{ left: `${vihje.x}%`, top: `${vihje.y}%` }} role="status">
          <b>{vihje.otsikko}</b>
          {vihje.rivit.map((t) => <span key={t}>{t}</span>)}
        </div>
      ) : null}
      {valittu && onValitse ? <button type="button" className="chip karttanappi" onClick={() => onValitse("")}>← Koko Suomi</button> : null}
    </figure>
  );
}
