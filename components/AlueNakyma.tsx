import Link from "next/link";
import { VAIHEET, type Maakunta } from "@/lib/alueet";
import { aktiivinen, vaiheSlug } from "@/lib/vaihe";

// Maakuntaruutu: kuntien ja hankkeiden määrä sekä vaihejakauma palkkina.
export function Palkki({ vaiheet }: { vaiheet: string[] }) {
  const n = vaiheet.length || 1;
  return (
    <div className="palkki" aria-hidden="true">
      {VAIHEET.filter((v) => aktiivinen(v)).map((v) => {
        const c = vaiheet.filter((x) => x === v).length;
        return c ? <i key={v} className={`c-${vaiheSlug(v)}`} style={{ width: `${(c / n) * 100}%` }} /> : null;
      })}
    </div>
  );
}

export function Selite() {
  return (
    <div className="selite">
      {VAIHEET.filter((v) => aktiivinen(v)).map((v) => <span key={v}><i className={`c-${vaiheSlug(v)}`} />{v}</span>)}
    </div>
  );
}

export function MaakuntaRuudut({ maakunnat }: { maakunnat: Maakunta[] }) {
  return (
    <div className="mk">
      {maakunnat.map((m) => {
        const kaikki = m.kunnat.flatMap((k) => k.hankkeet.map((h) => h.vaihe_luokka ?? "Ei tietoa"));
        const v = kaikki.filter((x) => aktiivinen(x));
        const muut = kaikki.length - v.length;
        const rak = v.filter((x) => x === "Rakenteilla").length;
        return (
          <Link key={m.tunniste} href={`/hankkeet/${m.tunniste}`} className="mkruutu">
            <h3>{m.nimi}</h3>
            <div className="n">{v.length} {v.length === 1 ? "hanke" : "hanketta"} · {m.kunnat.length} {m.kunnat.length === 1 ? "kunta" : "kuntaa"}</div>
            <Palkki vaiheet={v} />
            <div className="n">{rak ? `${rak} rakenteilla` : "Ei vielä rakenteilla"}{muut ? ` · ${muut} toiminnassa tai peruttu` : ""}</div>
          </Link>
        );
      })}
    </div>
  );
}
