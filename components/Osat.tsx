// Sisältösivujen interaktiiviset osat. Merkitään Markdown-sivulle omalle rivilleen osioiden väliin: <!--osa:nimi-->
// Osat: tunnusluvut (luvut + tällä viikolla -nauha), kartta (kartta + hankeputki), osuvuus (Sopiiko yritykseni?), kuumat (eniten uutisoidut).
import Link from "next/link";
import { hankeRivit, kunnat, maakunnat, pvm } from "@/lib/alueet";
import { aktiivinen, vaiheSlug } from "@/lib/vaihe";
import { KARTTA_LAHDE, kartta, kuntienMaakunnat } from "@/lib/kartta";
import { tunnusluvut } from "@/lib/tunnusluvut";
import { uutiset } from "@/lib/uutiset";
import { hankkeenTarpeet, tyypinTarpeet } from "@/lib/tarpeet";
import { TOIMIALAT } from "@/lib/toimialat";
import Kartta from "@/components/Kartta";
import Hankeputki from "@/components/Hankeputki";
import Laskuri from "@/components/Laskuri";
import Osuvuus, { type OsuvuusRivi } from "@/components/Osuvuus";
import { Selite } from "@/components/AlueNakyma";
import Syke from "@/components/Syke";

export const OSAT = ["tunnusluvut", "kartta", "osuvuus", "kuumat"] as const;

// Uutisen linkki: hankesivulle, jos uutinen on kytketty hankkeeseen, muuten alkuperäiseen uutiseen.
function uutisenKohde(u: { url: string; hankkeet?: string[] }) {
  const a = u.hankkeet?.[0];
  if (a) {
    const [kt, ht] = a.split("/");
    const k = kunnat().find((x) => x.tunniste === kt);
    if (k && k.hankkeet.some((h) => h.tunniste === ht)) return { href: `/hankkeet/${k.maakunta_tunniste}/${kt}/${ht}`, ulkoinen: false };
  }
  return { href: u.url, ulkoinen: true };
}

export function Nauha() {
  const raja = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
  const kaikki = uutiset(undefined, 40);
  const viikko = kaikki.filter((u) => u.pvm >= raja);
  const lista = (viikko.length >= 5 ? viikko : kaikki.slice(0, 10)).slice(0, 14);
  if (!lista.length) return null;
  const alkiot = (piilo: boolean) =>
    lista.map((u) => {
      const k = uutisenKohde(u);
      return (
        <li key={(piilo ? "b" : "a") + u.url} aria-hidden={piilo || undefined}>
          <span className="nauha-pvm">{pvm(u.pvm)}</span>
          {u.kunta ? <span className="nauha-kunta">{u.kunta}</span> : null}
          <a href={k.href} tabIndex={piilo ? -1 : undefined} {...(k.ulkoinen ? { target: "_blank", rel: "noopener nofollow" } : {})} data-track="click_nauha">{u.otsikko}</a>
        </li>
      );
    });
  return (
    <div className="nauha" aria-label={viikko.length >= 5 ? "Tällä viikolla" : "Uusimmat uutiset"}>
      <div className="nauha-otsikko"><span className="live" aria-hidden="true" />{viikko.length >= 5 ? "Tällä viikolla" : "Uusimmat"}</div>
      <div className="nauha-ikkuna"><ul className="nauha-rata" style={{ animationDuration: `${lista.length * 6}s` }}>{alkiot(false)}{alkiot(true)}</ul></div>
    </div>
  );
}

function Tunnusluvut() {
  const t = tunnusluvut();
  return (
    <section className="hero tunnus"><div className="wrap">
      <div className="stats iso">
        <div className="stat"><b><Laskuri arvo={t.hankkeita} /></b><span>aktiivista suurhanketta</span></div>
        <div className="stat"><b><Laskuri arvo={t.rakenteilla} /></b><span>rakenteilla nyt</span></div>
        <div className="stat"><b><Laskuri arvo={t.investoinnitMrd} desimaalit={1} /> mrd €</b><span>ilmoitettuja investointeja ({t.summallisia} hankkeesta, joilla summa on julkinen)</span></div>
        <div className="stat"><b><Laskuri arvo={t.kuntia} /></b><span>kuntaa, {t.maakuntia} maakuntaa</span></div>
      </div>
      <Nauha />
    </div></section>
  );
}

function KarttaOsa() {
  const r = hankeRivit().filter((x) => aktiivinen(x.vaihe));
  return (
    <section className="alt"><div className="wrap">
      <h2>Suurhankkeet kartalla</h2>
      <div className="karttaosio">
        <div>
          <Kartta pohja={kartta()} rivit={r} maakunnat={kuntienMaakunnat()} />
          <p className="muted small karttalahde">{KARTTA_LAHDE}</p>
        </div>
        <div>
          <Selite />
          <p className="muted small">Jokainen piste on hanke. Pisteen väri kertoo vaiheen ja koko ilmoitetun investoinnin. Vie hiiri pisteen päälle tai klikkaa kuntaa, niin näet maakunnan hankkeet.</p>
          <h3 style={{ marginTop: 24 }}>Hankeputki</h3>
          <Hankeputki rivit={r} />
          <div className="cta"><Link className="btn o" href="/hankkeet">Kaikki hankkeet ja suodattimet</Link></div>
        </div>
      </div>
    </div></section>
  );
}

function OsuvuusOsa() {
  const rivit: OsuvuusRivi[] = kunnat().flatMap((k) =>
    k.hankkeet.filter((h) => aktiivinen(h.vaihe_luokka)).map((h) => ({
      nimi: h.nimi, polku: `/hankkeet/${k.maakunta_tunniste}/${k.tunniste}/${h.tunniste}`, kunta: k.kunta, maakunta: k.maakunta,
      maakunta_tunniste: k.maakunta_tunniste, vaihe: h.vaihe_luokka ?? "Ei tietoa", tyyppi: h.tyyppi ?? "",
      toimialat: [...new Set([...hankkeenTarpeet(k.tunniste, h.tunniste), ...(tyypinTarpeet(h.tyyppi)?.tarpeet ?? [])].map((t) => t.toimiala).filter((x): x is string => !!x))],
    })),
  );
  return (
    <section id="sopiiko"><div className="wrap">
      <div className="panel osuvuus-paneeli">
        <h2>Sopiiko yritykseni?</h2>
        <Osuvuus rivit={rivit} toimialat={TOIMIALAT} maakunnat={maakunnat().map((m) => ({ tunniste: m.tunniste, nimi: m.nimi }))} />
      </div>
    </div></section>
  );
}

function Kuumat() {
  const raja = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  const maara = new Map<string, number>();
  for (const u of uutiset(undefined, 10000)) if (u.pvm >= raja) for (const a of u.hankkeet ?? []) maara.set(a, (maara.get(a) ?? 0) + 1);
  const r = hankeRivit().filter((x) => maara.get(`${x.kunta_tunniste}/${x.tunniste}`)).sort((a, b) => maara.get(`${b.kunta_tunniste}/${b.tunniste}`)! - maara.get(`${a.kunta_tunniste}/${a.tunniste}`)!).slice(0, 6);
  if (!r.length) return null;
  return (
    <section className="alt"><div className="wrap">
      <h2>Eniten uutisoidut hankkeet</h2>
      <p className="muted">Hankkeet, joista on kerätty eniten uutisia viimeisen 30 päivän aikana. Käyrä näyttää uutisten määrän 12 kuukaudelta.</p>
      <ol className="kuumat">
        {r.map((x, i) => (
          <li key={x.polku}>
            <span className="kuumat-n">{i + 1}</span>
            <div><Link href={x.polku} className="hnimi">{x.nimi}</Link><div className="hmeta">{x.kunta}, {x.maakunta} · <span className={`vaihe v-${vaiheSlug(x.vaihe)}`}>{x.vaihe}</span></div></div>
            <div className="kuumat-s"><Syke syke={x.syke} leveys={96} korkeus={28} /><span>{maara.get(`${x.kunta_tunniste}/${x.tunniste}`)} uutista / 30 pv</span></div>
          </li>
        ))}
      </ol>
    </div></section>
  );
}

export default function Osa({ nimi }: { nimi: string }) {
  if (nimi === "tunnusluvut") return <Tunnusluvut />;
  if (nimi === "kartta") return <KarttaOsa />;
  if (nimi === "osuvuus") return <OsuvuusOsa />;
  if (nimi === "kuumat") return <Kuumat />;
  return null;
}
