import type { Metadata } from "next";
import Link from "next/link";
import { TYYPIT, VAIHEET, hankeRivit, kunnat, maakunnat } from "@/lib/alueet";
import { MaakuntaRuudut, Selite } from "@/components/AlueNakyma";
import HankeHaku from "@/components/HankeHaku";

export const metadata: Metadata = {
  title: "Suurhankkeet",
  description: "Suomen teollisuus-, energia- ja infrahankkeet maakunnittain ja kunnittain: vaiheet, toteuttajat ja alihankinnan mahdollisuudet.",
};

export default function Hankkeet() {
  const m = maakunnat();
  const r = hankeRivit();
  const k = kunnat();
  const rak = r.filter((x) => x.vaihe === "Rakenteilla").length;
  const uusin = k.map((x) => x.paivitetty).sort().at(-1) ?? "";
  const [y, mo, d] = uusin.split("-").map(Number);
  return (
    <>
      <section className="hero sm"><div className="wrap">
        <div className="eyebrow">Suurhankkeet</div>
        <h1>Suurhankkeet alueittain</h1>
        <p className="lead">Kaikki seuratut hankkeet yhdessä näkymässä. Suodata maakunnan, hanketyypin ja vaiheen mukaan, ja ilmoita yrityksesi mukaan alueesi hankkeisiin.</p>
        <div className="stats">
          <div className="stat"><b>{r.length}</b><span>hanketta</span></div>
          <div className="stat"><b>{rak}</b><span>rakenteilla</span></div>
          <div className="stat"><b>{k.length}</b><span>kuntaa</span></div>
          <div className="stat"><b>{m.length}</b><span>maakuntaa</span></div>
        </div>
        <p className="muted small" style={{ marginTop: 16 }}>Tiedot julkisista lähteistä, päivitetty {d}.{mo}.{y}. Lähde näkyy jokaisen hankkeen sivulla.</p>
      </div></section>

      <section className="alt" id="maakunnat"><div className="wrap">
        <h2>Maakunnat</h2>
        <Selite />
        <MaakuntaRuudut maakunnat={m} />
      </div></section>

      <section><div className="wrap">
        <h2>Kaikki hankkeet</h2>
        <HankeHaku rivit={r} maakunnat={m.map((x) => ({ tunniste: x.tunniste, nimi: x.nimi }))} tyypit={TYYPIT} vaiheet={VAIHEET} />
        <p className="muted" style={{ marginTop: 24 }}>Uusia alueita lisätään viikoittain. Kunnat ja tilaajat: <Link href="/kunnille">aluekumppanuus</Link>.</p>
      </div></section>
    </>
  );
}
