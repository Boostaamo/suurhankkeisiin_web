"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { vaiheSlug } from "@/lib/vaihe";
import Syke from "@/components/Syke";

type Tieto = { otsikko: string; arvo: string; tila: string; lahde: string | null };
type H = { polku: string; nimi: string; kunta: string; maakunta: string; tyyppi: string; vaihe: string; investointi_meur: number | null; tiivistelma: string; tiedot: Tieto[]; toimialat: string[]; uutisia: number; viimeisin: string | null; syke: number[] };

const pvm = (s: string | null) => (s ? s.split("-").map(Number).reverse().join(".") : "–");
const euroa = (m: number | null) => (m == null ? "Ei julkista tietoa" : m >= 1000 ? `noin ${(m / 1000).toLocaleString("fi-FI", { maximumFractionDigits: 1 })} mrd €` : `noin ${m.toLocaleString("fi-FI")} M€`);
const lahde = (u: string | null) => { try { return u ? new URL(u).hostname.replace(/^www\./, "") : ""; } catch { return ""; } };

export default function Vertailu() {
  const q = useSearchParams();
  const polut = useMemo(() => (q.get("h") ?? "").split(",").map((s) => decodeURIComponent(s)).filter(Boolean).slice(0, 3), [q]);
  const [data, setData] = useState<H[] | null>(null);
  useEffect(() => { fetch("/vertailu.json").then((r) => r.json()).then(setData).catch(() => setData([])); }, []);
  if (!data) return <p className="muted">Ladataan…</p>;
  const hh = polut.map((p) => data.find((x) => x.polku === p)).filter((x): x is H => !!x);
  if (hh.length < 2) return <p>Valitse vähintään kaksi hanketta <Link href="/hankkeet#kaikki">hankelistasta</Link> merkitsemällä Vertaa.</p>;

  // Rivit: yhteiset perustiedot + kaikkien hankkeiden tieto-otsikot (järjestys ensimmäisen esiintymän mukaan).
  const otsikot = [...new Set(hh.flatMap((h) => h.tiedot.map((t) => t.otsikko)))];
  const solu = (h: H, o: string) => {
    const t = h.tiedot.filter((x) => x.otsikko === o);
    if (!t.length) return <span className="muted">–</span>;
    return t.map((x, i) => (
      <div key={i}>{x.arvo}{x.tila === "arvio" ? <span className="tag">arvio</span> : null}{x.lahde ? <a className="src" href={x.lahde} target="_blank" rel="noopener nofollow">{lahde(x.lahde)}</a> : null}</div>
    ));
  };
  return (
    <div className="vertailu-rulla">
      <table className="vertailu" style={{ ["--sarakkeita" as string]: hh.length }}>
        <thead>
          <tr><th scope="col"><span className="sr">Tieto</span></th>{hh.map((h) => <th key={h.polku} scope="col"><Link href={h.polku}>{h.nimi}</Link><div className="hmeta">{h.kunta}, {h.maakunta}</div></th>)}</tr>
        </thead>
        <tbody>
          <tr><th scope="row">Vaihe</th>{hh.map((h) => <td key={h.polku}><span className={`vaihe v-${vaiheSlug(h.vaihe)}`}>{h.vaihe}</span></td>)}</tr>
          <tr><th scope="row">Tyyppi</th>{hh.map((h) => <td key={h.polku}>{h.tyyppi || "–"}</td>)}</tr>
          <tr><th scope="row">Investointi</th>{hh.map((h) => <td key={h.polku} className={h.investointi_meur ? "iso" : "muted"}>{euroa(h.investointi_meur)}</td>)}</tr>
          <tr><th scope="row">Tiivistelmä</th>{hh.map((h) => <td key={h.polku}>{h.tiivistelma}</td>)}</tr>
          {otsikot.map((o) => <tr key={o}><th scope="row">{o}</th>{hh.map((h) => <td key={h.polku}>{solu(h, o)}</td>)}</tr>)}
          <tr><th scope="row">Tunnistettu osaamistarve</th>{hh.map((h) => <td key={h.polku}>{h.toimialat.length ? <div className="chips">{h.toimialat.map((t) => <span key={t} className="chip">{t}</span>)}</div> : <span className="muted">Ei vielä eritelty</span>}</td>)}</tr>
          <tr><th scope="row">Uutiset</th>{hh.map((h) => <td key={h.polku}>{h.uutisia} kpl, viimeisin {pvm(h.viimeisin)} <Syke syke={h.syke} /></td>)}</tr>
          <tr><th scope="row"></th>{hh.map((h) => <td key={h.polku}><Link className="btn sm" href={`${h.polku}#ilmoittaudu`}>Ilmoita yrityksesi</Link></td>)}</tr>
        </tbody>
      </table>
    </div>
  );
}
