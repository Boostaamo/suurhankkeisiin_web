import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { kuntaPolku, maakunnat, maakunta } from "@/lib/alueet";
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
      <section><div className="wrap">
        <div className="cards">
          {m.kunnat.map((k) => (
            <Link key={k.tunniste} href={kuntaPolku(k)} className="card link">
              {k.pilotti ? <span className="pill">Pilottialue</span> : null}
              <h3>{k.kunta}</h3>
              <p>{k.esittely}</p>
              <p className="muted">{k.hankkeet.length} hanketta</p>
            </Link>
          ))}
        </div>
      </div></section>
    </>
  );
}
