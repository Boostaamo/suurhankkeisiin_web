import type { Metadata } from "next";
import Link from "next/link";
import { kuntaPolku, maakunnat } from "@/lib/alueet";

export const metadata: Metadata = {
  title: "Suurhankkeet",
  description: "Suomen teollisuus- ja infrahankkeet maakunnittain ja kunnittain: vaiheet, työvoimatarpeet ja alihankinnan mahdollisuudet.",
};

export default function Hankkeet() {
  const m = maakunnat();
  return (
    <>
      <section className="hero sm"><div className="wrap">
        <div className="eyebrow">Suurhankkeet</div>
        <h1>Suurhankkeet alueittain</h1>
        <p className="lead">Valitse alue ja tutustu hankkeisiin, niiden vaiheisiin ja paikallisten yritysten mahdollisuuksiin.</p>
      </div></section>
      <section><div className="wrap">
        {m.map((x) => (
          <div key={x.tunniste} className="block">
            <h2><Link href={`/hankkeet/${x.tunniste}`}>{x.nimi}</Link></h2>
            <div className="cards">
              {x.kunnat.map((k) => (
                <Link key={k.tunniste} href={kuntaPolku(k)} className="card link">
                  {k.pilotti ? <span className="pill">Pilottialue</span> : null}
                  <h3>{k.kunta}</h3>
                  <p>{k.hankkeet.map((h) => h.nimi).join(" · ")}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
        <p className="muted">Uusia alueita lisätään. Kunnat ja tilaajat: <Link href="/kunnille">aluekumppanuus</Link>.</p>
      </div></section>
    </>
  );
}
