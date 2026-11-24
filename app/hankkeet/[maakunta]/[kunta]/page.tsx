import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hankePolku, kunnat, kunta, lahdeNimi, pvm } from "@/lib/alueet";
import { vaiheSlug } from "@/lib/vaihe";
import Seuranta from "@/components/Seuranta";
import Form from "@/components/Form";
import { uutisetHtml } from "@/lib/uutiset";

export const dynamicParams = false;
export const generateStaticParams = () => kunnat().map((k) => ({ maakunta: k.maakunta_tunniste, kunta: k.tunniste }));

type Props = { params: Promise<{ maakunta: string; kunta: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params;
  const k = kunta(p.maakunta, p.kunta);
  return k ? { title: `${k.kunta}: suurhankkeet ja alihankinta`, description: k.esittely } : {};
}

export default async function KuntaSivu({ params }: Props) {
  const p = await params;
  const k = kunta(p.maakunta, p.kunta);
  if (!k) notFound();
  return (
    <>
      <Seuranta taso="kunta" maakunta={k.maakunta} kunta={k.kunta} />
      <section className="hero sm"><div className="wrap">
        <div className="eyebrow"><Link href="/hankkeet">Suurhankkeet</Link> / <Link href={`/hankkeet/${k.maakunta_tunniste}`}>{k.maakunta}</Link> / {k.kunta}</div>
        {k.pilotti ? <span className="pill">Pilottialue</span> : null}
        <h1>{k.kunta}</h1>
        <p className="lead">{k.esittely}</p>
        <div className="cta"><a className="btn" href="#ilmoittaudu">Ilmoita yrityksesi mukaan</a></div>
        <p className="muted small">Tiedot päivitetty {pvm(k.paivitetty)}. Lähteet näkyvät hankesivuilla.</p>
      </div></section>

      <section className="alt"><div className="wrap">
        <h2>Hankkeet</h2>
        <div className="cards">
          {k.hankkeet.map((h) => (
            <Link key={h.tunniste} href={hankePolku(k, h)} className="card link">
              {h.vaihe_luokka ? <span className={`vaihe v-${vaiheSlug(h.vaihe_luokka)}`}>{h.vaihe_luokka}</span> : null}
              {h.tyyppi ? <span className="vaihe">{h.tyyppi}</span> : null}
              <h3>{h.nimi}</h3>
              <p>{h.tiivistelma}</p>
              <span className="more">Hankkeen tiedot →</span>
            </Link>
          ))}
        </div>
      </div></section>

      <section><div className="wrap">
        <h2>Uusimmat uutiset</h2>
        <div dangerouslySetInnerHTML={{ __html: uutisetHtml(k.kunta) }} />
      </div></section>

      <section className="alt"><div className="wrap grid2">
        <div>
          <h2>Tapahtumat</h2>
          {k.tapahtumat.length ? (
            <ul className="list">
              {k.tapahtumat.map((t) => (
                <li key={t.nimi}><strong>{pvm(t.pvm)}</strong> {t.nimi}<span className="muted">, {t.paikka}{t.jarjestaja ? `, ${t.jarjestaja}` : ""}</span></li>
              ))}
            </ul>
          ) : <p className="muted">Tulevista tapahtumista ilmoitetaan täällä.</p>}
          <h2 style={{ marginTop: 40 }}>Kilpailutukset</h2>
          <p className="muted">Avoimia kilpailutuksia ei ole vielä julkaistu. Ilmoittautuneet yritykset kuulevat ensimmäisinä, kun hankintapaketteja avautuu.</p>
        </div>
        {k.naapurikunnat.length ? <div>
          <h2>Lähialueen hankkeet</h2>
          <ul className="list">
            {k.naapurikunnat.map((n) => (
              <li key={n.kunta}><strong>{n.kunta}</strong> ({n.maakunta}): {n.nimi}. {n.arvo}{n.tila === "arvio" ? <span className="tag">arvio</span> : null}
                {n.lahde ? <span className="src">Lähde: <a href={n.lahde} rel="noopener nofollow" target="_blank">{lahdeNimi(n.lahde)}</a>{n.pvm ? `, ${pvm(n.pvm)}` : ""}</span> : null}
              </li>
            ))}
          </ul>
        </div> : <div>
          <h2>Muut hankkeet: {k.maakunta}</h2>
          <p><Link href={`/hankkeet/${k.maakunta_tunniste}`}>Katso maakunnan kaikki hankkeet →</Link></p>
        </div>}
      </div></section>

      <section id="ilmoittaudu"><div className="wrap grid2">
        <div>
          <h2>Ilmoita yrityksesi {k.kunta_genetiivi} hankkeisiin</h2>
          <p>Kerro kalustosi, tiimisi ja palvelusi. Profiili kootaan hankkeen tilaajien ja pääurakoitsijoiden tarkasteltavaksi.</p>
          <p className="muted">Perusnäkyvyys on paikallisille toimijoille maksuton. <Link href="/hinnat">Katso hinnat</Link>.</p>
        </div>
        <div className="card"><Form kind="ilmoittautuminen" source={`kunta/${k.tunniste}`} alue={{ maakunta: k.maakunta, kunta: k.kunta }} /></div>
      </div></section>
    </>
  );
}
