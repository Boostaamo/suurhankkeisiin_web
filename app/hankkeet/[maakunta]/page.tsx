import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TYYPIT, VAIHEET, aktiivinen, hankeRivit, hankkeita, kuntaPolku, maakunnat, maakunta } from "@/lib/alueet";
import { Palkki, Selite } from "@/components/AlueNakyma";
import HankeHaku from "@/components/HankeHaku";
import { KARTTA_LAHDE, kartta, kuntienMaakunnat } from "@/lib/kartta";
import Seuranta from "@/components/Seuranta";

export const dynamicParams = false;
export const generateStaticParams = () => maakunnat().map((m) => ({ maakunta: m.tunniste }));

type Props = { params: Promise<{ maakunta: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const m = maakunta((await params).maakunta);
  return m ? { title: `Suurhankkeet: ${m.nimi}`, description: `${m.nimi}: suurhankkeet kunnittain ja paikallisten yritysten mahdollisuudet.` } : {};
}

export default async function MaakuntaSivu({ params }: Props) {
  const m = maakunta((await params).maakunta);
  if (!m) notFound();
  return (
    <>
      <Seuranta taso="maakunta" maakunta={m.nimi} />
      <section className="hero sm"><div className="wrap">
        <div className="eyebrow"><Link href="/hankkeet">Suurhankkeet</Link> / {m.nimi}</div>
        <h1>{m.nimi}</h1>
        <p className="lead">Maakunnan suurhankkeet kunnittain. Ilmoita yrityksesi mukaan, niin tilaajat ja urakoitsijat löytävät sinut.</p>
        <div className="cta"><Link className="btn" href={`/ilmoittaudu`}>Ilmoita yrityksesi</Link></div>
      </div></section>
      <section className="alt"><div className="wrap">
        <h2>Kunnat</h2>
        <Selite />
        <div className="mk">
          {m.kunnat.map((k) => (
            <Link key={k.tunniste} href={kuntaPolku(k)} className="mkruutu">
              {k.pilotti ? <span className="pill">Pilottialue</span> : null}
              <h3>{k.kunta}</h3>
              <div className="n">{hankkeita(k.hankkeet.filter((h) => aktiivinen(h.vaihe_luokka)).length)}</div>
              <Palkki vaiheet={k.hankkeet.map((h) => h.vaihe_luokka ?? "Ei tietoa").filter((v) => aktiivinen(v))} />
              <div className="n">{[...new Set(k.hankkeet.map((h) => h.tyyppi).filter(Boolean))].join(", ")}</div>
            </Link>
          ))}
        </div>
      </div></section>
      <section><div className="wrap">
        <h2>Hankkeet: {m.nimi}</h2>
        <HankeHaku rivit={hankeRivit().filter((x) => x.maakunta_tunniste === m.tunniste)} maakunnat={[]} tyypit={TYYPIT} vaiheet={VAIHEET} alkuMaakunta={m.tunniste} pohja={kartta()} kuntaMaakunnat={kuntienMaakunnat()} karttaLahde={KARTTA_LAHDE} />
      </div></section>
    </>
  );
}
