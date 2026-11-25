import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hanke, kunnat, kuntaPolku, pvm } from "@/lib/alueet";
import { vaiheSlug } from "@/lib/vaihe";
import Seuranta from "@/components/Seuranta";
import Tiedot from "@/components/Tiedot";
import Form from "@/components/Form";
import { hankkeenUutiset } from "@/lib/uutiset";
import { yhteenveto } from "@/lib/yhteenveto";
import { aikajana as vaiheAikajana } from "@/lib/aikajana";
import Aikajana from "@/components/Aikajana";

export const dynamicParams = false;
export const generateStaticParams = () =>
  kunnat().flatMap((k) => k.hankkeet.map((h) => ({ maakunta: k.maakunta_tunniste, kunta: k.tunniste, hanke: h.tunniste })));

type Props = { params: Promise<{ maakunta: string; kunta: string; hanke: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params;
  const x = hanke(p.maakunta, p.kunta, p.hanke);
  return x ? { title: `${x.hanke.nimi} (${x.kunta.kunta})`, description: x.hanke.tiivistelma } : {};
}

export default async function HankeSivu({ params }: Props) {
  const p = await params;
  const x = hanke(p.maakunta, p.kunta, p.hanke);
  if (!x) notFound();
  const { kunta: k, hanke: h } = x;
  const yv = yhteenveto(k.tunniste, h.tunniste);
  const aikajana = hankkeenUutiset(k.tunniste, h.tunniste);
  const jana = vaiheAikajana(k, h);
  return (
    <>
      <Seuranta taso="hanke" maakunta={k.maakunta} kunta={k.kunta} hanke={h.nimi} />
      <section className="hero sm"><div className="wrap">
        <div className="eyebrow">
          <Link href="/hankkeet">Suurhankkeet</Link> / <Link href={`/hankkeet/${k.maakunta_tunniste}`}>{k.maakunta}</Link> / <Link href={kuntaPolku(k)}>{k.kunta}</Link>
        </div>
        {h.vaihe_luokka ? <span className={`vaihe v-${vaiheSlug(h.vaihe_luokka)}`} style={{ marginRight: 6, marginBottom: 12 }}>{h.vaihe_luokka}</span> : null}
        {h.tyyppi ? <span className="vaihe" style={{ marginBottom: 12 }}>{h.tyyppi}</span> : null}
        <h1>{h.nimi}</h1>
        <p className="lead">{h.tiivistelma}</p>
        <div className="cta"><a className="btn" href="#ilmoittaudu">Ilmoita yrityksesi hankkeeseen</a></div>
      </div></section>
      <section><div className="wrap">
        <h2>Hankkeen tilannekuva</h2>
        <p className="muted small">Tiedot on koottu julkisista lähteistä {pvm(k.paivitetty)}. Arviot on merkitty. Jos huomaat virheen, <Link href="/kunnille">ota yhteyttä</Link>.</p>
        {yv ? (
          <div className="card yhteenveto">
            <div className="yv-otsikko">Yhteenveto <span className="tag">tekoälyn koostama</span></div>
            {yv.teksti.map((t, i) => <p key={i}>{t}</p>)}
            <p className="muted small">Koottu {pvm(yv.pvm)} tämän sivun lähteistä{aikajana.length ? " ja alla listatuista uutisista" : ""}. Tarkistettu ennen julkaisua.</p>
          </div>
        ) : null}
        <Tiedot tiedot={h.tiedot} />
        {aikajana.length ? (
          <>
            <h3 style={{ marginTop: 40 }}>Uutiset aikajärjestyksessä</h3>
            <ol className="aikajana">
              {aikajana.map((u) => (
                <li key={u.url}>
                  <div className="newsmeta">{pvm(u.pvm)} · {u.julkaisija}</div>
                  <a href={u.url} target="_blank" rel="noopener nofollow" data-track="click_uutinen">{u.otsikko}</a>
                  <p>{u.ingressi}</p>
                  {u.lisalahteet?.length ? (
                    <div className="lisalahteet">
                      Myös:{" "}
                      {u.lisalahteet.map((l, i) => (
                        <span key={l.url}>
                          {i ? ", " : ""}
                          <a href={l.url} target="_blank" rel="noopener nofollow" data-track="click_uutinen">{l.julkaisija} {pvm(l.pvm)}</a>
                        </span>
                      ))}
                    </div>
                  ) : null}
                </li>
              ))}
            </ol>
          </>
        ) : null}
      </div></section>
      <section className="tarpeet-osio" id="tarpeet"><div className="wrap">
        <h2 id="eteneminen">Hankkeen eteneminen ja tarpeet</h2>
        <p className="muted small">Vaiheet ja tapahtumat julkisista lähteistä. Jokaiseen vaiheeseen on kytketty siinä tarvittava osaaminen ja resurssit.</p>
        <Aikajana vaiheet={jana.vaiheet} lahteistetty={jana.lahteistetty} tyyppi={h.tyyppi} />
      </div></section>
      <section className="alt" id="ilmoittaudu"><div className="wrap grid2">
        <div>
          <h2>Ilmoita yrityksesi mukaan</h2>
          <p>Kerro kalustosi, tiimisi ja palvelusi. Profiili kootaan hankkeen tilaajien ja pääurakoitsijoiden tarkasteltavaksi.</p>
        </div>
        <div className="card"><Form kind="ilmoittautuminen" source={`hanke/${k.tunniste}/${h.tunniste}`} alue={{ maakunta: k.maakunta, kunta: k.kunta, hanke: h.nimi }} /></div>
      </div></section>
    </>
  );
}
