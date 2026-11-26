import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hankePolku, kunnat, kunta, kuntaPolku, pvm } from "@/lib/alueet";
import { aktiivinen, vaiheSlug } from "@/lib/vaihe";
import { uutiset } from "@/lib/uutiset";
import { site } from "@/lib/site";

// Kuntien sivuille upotettava näkymä (iframe). Ei ylä- eikä alatunnistetta, ei analytiikkaa (ks. .irrallinen globals.css:ssä).
export const dynamicParams = false;
export const generateStaticParams = () => kunnat().map((k) => ({ maakunta: k.maakunta_tunniste, kunta: k.tunniste }));
export const metadata: Metadata = { robots: { index: false, follow: true } };

type Props = { params: Promise<{ maakunta: string; kunta: string }> };

export default async function UpotusSivu({ params }: Props) {
  const p = await params;
  const k = kunta(p.maakunta, p.kunta);
  if (!k) notFound();
  const utm = "?utm_source=kunta&utm_medium=upotus&utm_campaign=" + k.tunniste;
  const hh = k.hankkeet.filter((h) => aktiivinen(h.vaihe_luokka));
  const uu = uutiset(k.kunta, 3);
  return (
    <div className="irrallinen upotus-nakyma">
      <div className="upotus-yla">
        <div><div className="eyebrow">Suurhankkeet</div><h1>{k.kunta}</h1></div>
        <a className="wm" href={`${site.url}${utm}`} target="_blank" rel="noopener">Suurhankkeisiin<span>.fi</span></a>
      </div>
      <ul className="hlista">
        {hh.map((h) => (
          <li key={h.tunniste}>
            <div className="hrivi-p"><a className="hnimi" href={`${hankePolku(k, h)}${utm}`} target="_blank" rel="noopener">{h.nimi}</a><div className="hmeta">{h.tyyppi}</div></div>
            <div className="hrivi-s">{h.vaihe_luokka ? <span className={`vaihe v-${vaiheSlug(h.vaihe_luokka)}`}>{h.vaihe_luokka}</span> : null}</div>
          </li>
        ))}
      </ul>
      {uu.length ? (
        <>
          <h2>Uusimmat uutiset</h2>
          <ul className="upotus-uutiset">
            {uu.map((u) => <li key={u.url}><span className="muted small">{pvm(u.pvm)} · {u.julkaisija}</span><a href={u.url} target="_blank" rel="noopener nofollow">{u.otsikko}</a></li>)}
          </ul>
        </>
      ) : null}
      <div className="cta"><a className="btn sm" href={`${kuntaPolku(k)}${utm}#ilmoittaudu`} target="_blank" rel="noopener">Ilmoita yrityksesi {k.kunta_genetiivi} hankkeisiin</a></div>
      <p className="muted small">Tiedot julkisista lähteistä, päivitetty {pvm(k.paivitetty)}. Palvelun tarjoaa Suurhankkeisiin.fi.</p>
    </div>
  );
}
