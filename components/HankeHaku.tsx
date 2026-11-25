"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { aktiivinen, vaiheSlug, type HankeRivi } from "@/lib/vaihe";

// Kaikkien hankkeiden haku ja suodatus selaimessa. Data tulee staattisesti datakerroksesta (content/alueet).
type Props = { rivit: HankeRivi[]; maakunnat: { tunniste: string; nimi: string }[]; tyypit: string[]; vaiheet: string[]; alkuMaakunta?: string };

const euroa = (m: number | null) =>
  m == null ? "" : m >= 1000 ? `noin ${(m / 1000).toLocaleString("fi-FI", { maximumFractionDigits: 1 })} mrd €` : `noin ${m.toLocaleString("fi-FI")} M€`;
const vaiheLuokka = (v: string) => `vaihe v-${vaiheSlug(v)}`;

export default function HankeHaku({ rivit: kaikki, maakunnat, tyypit, vaiheet, alkuMaakunta = "" }: Props) {
  const [myosMuut, setMyosMuut] = useState(false);
  const rivit = useMemo(() => (myosMuut ? kaikki : kaikki.filter((x) => aktiivinen(x.vaihe))), [kaikki, myosMuut]);
  const muita = kaikki.filter((x) => !aktiivinen(x.vaihe) && (!alkuMaakunta || x.maakunta_tunniste === alkuMaakunta)).length;
  const [maakunta, setMaakunta] = useState(alkuMaakunta);
  const [tyyppi, setTyyppi] = useState("");
  const [vaihe, setVaihe] = useState("");
  const [haku, setHaku] = useState("");
  const [jarjestys, setJarjestys] = useState<"alue" | "investointi">("alue");

  const tulos = useMemo(() => {
    const q = haku.trim().toLowerCase();
    const r = rivit.filter(
      (x) =>
        (!maakunta || x.maakunta_tunniste === maakunta) &&
        (!tyyppi || x.tyyppi === tyyppi) &&
        (!vaihe || x.vaihe === vaihe) &&
        (!q || `${x.nimi} ${x.kunta} ${x.tiivistelma}`.toLowerCase().includes(q)),
    );
    return jarjestys === "investointi"
      ? [...r].sort((a, b) => (b.investointi_meur ?? -1) - (a.investointi_meur ?? -1))
      : [...r].sort((a, b) => a.maakunta.localeCompare(b.maakunta, "fi") || a.kunta.localeCompare(b.kunta, "fi") || a.nimi.localeCompare(b.nimi, "fi"));
  }, [rivit, maakunta, tyyppi, vaihe, haku, jarjestys]);

  const laske = (f: (x: HankeRivi) => boolean) => rivit.filter((x) => (!maakunta || x.maakunta_tunniste === maakunta) && f(x)).length;
  const tyhjenna = () => { setMaakunta(alkuMaakunta); setTyyppi(""); setVaihe(""); setHaku(""); setMyosMuut(false); };

  return (
    <div className="haku">
      <div className="suodin" role="search">
        <label className="fl">Hae
          <input className="fld" type="search" value={haku} onChange={(e) => setHaku(e.target.value)} placeholder="Hankkeen tai kunnan nimi" />
        </label>
        {alkuMaakunta ? null : (
          <label className="fl">Maakunta
            <select className="fld" value={maakunta} onChange={(e) => setMaakunta(e.target.value)}>
              <option value="">Kaikki maakunnat</option>
              {maakunnat.map((m) => <option key={m.tunniste} value={m.tunniste}>{m.nimi}</option>)}
            </select>
          </label>
        )}
        <label className="fl">Järjestys
          <select className="fld" value={jarjestys} onChange={(e) => setJarjestys(e.target.value as "alue" | "investointi")}>
            <option value="alue">Alueittain</option>
            <option value="investointi">Suurin investointi ensin</option>
          </select>
        </label>
      </div>

      {muita ? (
        <label className="chk" style={{ marginBottom: 12 }}>
          <input type="checkbox" checked={myosMuut} onChange={(e) => { setMyosMuut(e.target.checked); if (!e.target.checked && !aktiivinen(vaihe)) setVaihe(""); }} />
          <span>Näytä myös toiminnassa olevat ja perutut hankkeet ({muita}). Ne ovat kohteita elinkaari- ja huoltopalveluille.</span>
        </label>
      ) : null}
      <div className="chips" aria-label="Hanketyyppi">
        <button type="button" className={`chip${tyyppi === "" ? " on" : ""}`} aria-pressed={tyyppi === ""} onClick={() => setTyyppi("")}>Kaikki tyypit</button>
        {tyypit.map((t) => {
          const n = laske((x) => x.tyyppi === t);
          return n ? <button key={t} type="button" className={`chip${tyyppi === t ? " on" : ""}`} aria-pressed={tyyppi === t} onClick={() => setTyyppi(tyyppi === t ? "" : t)}>{t} <span>{n}</span></button> : null;
        })}
      </div>
      <div className="chips" aria-label="Vaihe">
        <button type="button" className={`chip${vaihe === "" ? " on" : ""}`} aria-pressed={vaihe === ""} onClick={() => setVaihe("")}>Kaikki vaiheet</button>
        {vaiheet.map((v) => {
          const n = laske((x) => x.vaihe === v);
          return n ? <button key={v} type="button" className={`chip${vaihe === v ? " on" : ""}`} aria-pressed={vaihe === v} onClick={() => setVaihe(vaihe === v ? "" : v)}>{v} <span>{n}</span></button> : null;
        })}
      </div>

      <p className="muted small" aria-live="polite">
        {tulos.length} / {rivit.length} {myosMuut ? "hanketta" : "aktiivista hanketta"}
        {maakunta !== alkuMaakunta || tyyppi || vaihe || haku || myosMuut ? <> · <button type="button" className="tyhjenna" onClick={tyhjenna}>Tyhjennä valinnat</button></> : null}
      </p>

      <ul className="hlista">
        {tulos.map((x) => (
          <li key={x.polku}>
            <div className="hrivi-p">
              <Link href={x.polku} className="hnimi">{x.nimi}</Link>
              <div className="hmeta"><Link href={x.kuntaPolku}>{x.kunta}</Link>, {x.maakunta} · {x.tyyppi}</div>
            </div>
            <div className="hrivi-s">
              <span className={vaiheLuokka(x.vaihe)}>{x.vaihe}</span>
              {x.investointi_meur != null ? <span className="hraha">{euroa(x.investointi_meur)}</span> : null}
            </div>
          </li>
        ))}
      </ul>
      {tulos.length === 0 ? <p className="muted">Valinnoilla ei löytynyt hankkeita.</p> : null}
    </div>
  );
}
