"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { vaiheSlug } from "@/lib/vaihe";
import { track } from "@/lib/analytics";

// "Sopiiko yritykseni?": toimiala + alue -> hankkeet, joissa toimialan tarve on tunnistettu julkisista lähteistä
// (content/tarpeet.json: hankekohtaiset ja hanketyypin yleiset tarpeet). Tulos vie esitäytettyyn ilmoittautumiseen.
export type OsuvuusRivi = { nimi: string; polku: string; kunta: string; maakunta: string; maakunta_tunniste: string; vaihe: string; tyyppi: string; toimialat: string[] };
type Props = { rivit: OsuvuusRivi[]; toimialat: string[]; maakunnat: { tunniste: string; nimi: string }[] };

const JARJESTYS = ["Rakenteilla", "Investointipäätös", "Luvitus", "Suunnittelu", "Keskeytetty", "Ei tietoa"];

export default function Osuvuus({ rivit, toimialat, maakunnat }: Props) {
  const [toimiala, setToimiala] = useState("");
  const [maakunta, setMaakunta] = useState("");
  const alueella = useMemo(() => rivit.filter((r) => !maakunta || r.maakunta_tunniste === maakunta), [rivit, maakunta]);
  const osumat = useMemo(
    () => (toimiala ? alueella.filter((r) => r.toimialat.includes(toimiala)).sort((a, b) => JARJESTYS.indexOf(a.vaihe) - JARJESTYS.indexOf(b.vaihe)) : []),
    [alueella, toimiala],
  );
  const mkNimi = maakunnat.find((m) => m.tunniste === maakunta)?.nimi;
  const valitse = (t: string, m: string) => {
    if (t) track("osuvuus_tulos", { toimiala: t, maakunta: maakunnat.find((x) => x.tunniste === m)?.nimi ?? "koko Suomi", osumia: rivit.filter((r) => (!m || r.maakunta_tunniste === m) && r.toimialat.includes(t)).length });
  };
  const ilmoittaudu = `/ilmoittaudu?toimiala=${encodeURIComponent(toimiala)}${mkNimi ? `&alue=${encodeURIComponent(mkNimi)}` : ""}#lomake-0`;
  const rakenteilla = osumat.filter((r) => r.vaihe === "Rakenteilla").length;

  return (
    <div className="osuvuus">
      <div className="osuvuus-valinnat">
        <label className="fl">Yrityksesi toimiala
          <select className="fld" value={toimiala} onChange={(e) => { setToimiala(e.target.value); valitse(e.target.value, maakunta); }}>
            <option value="">Valitse toimiala</option>
            {toimialat.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label className="fl">Alue
          <select className="fld" value={maakunta} onChange={(e) => { setMaakunta(e.target.value); valitse(toimiala, e.target.value); }}>
            <option value="">Koko Suomi</option>
            {maakunnat.map((m) => <option key={m.tunniste} value={m.tunniste}>{m.nimi}</option>)}
          </select>
        </label>
      </div>
      {toimiala ? (
        <div className="osuvuus-tulos" aria-live="polite">
          <div className="osuvuus-iso">
            <b key={`${toimiala}-${maakunta}`}>{osumat.length}</b>
            <span>{osumat.length === 1 ? "hanke" : "hanketta"}, joissa tarvitaan: <strong>{toimiala.toLowerCase()}</strong>{mkNimi ? ` (${mkNimi})` : ""}{rakenteilla ? `, joista ${rakenteilla} rakenteilla` : ""}.</span>
          </div>
          {osumat.length ? (
            <ul className="osuvuus-lista">
              {osumat.slice(0, 8).map((r) => (
                <li key={r.polku}><Link href={r.polku}>{r.nimi}</Link> <span className="muted small">{r.kunta}</span> <span className={`vaihe v-${vaiheSlug(r.vaihe)}`}>{r.vaihe}</span></li>
              ))}
              {osumat.length > 8 ? <li className="muted small">ja {osumat.length - 8} muuta</li> : null}
            </ul>
          ) : null}
          <p className="muted small">
            Tarve on tunnistettu hankkeen julkisista lähteistä tai hanketyypin yleisistä tarpeista. {alueella.length - osumat.length > 0 ? `Alueella on lisäksi ${alueella.length - osumat.length} aktiivista hanketta, joiden tarpeita ei ole vielä eritelty.` : ""}
          </p>
          <div className="cta"><a className="btn" href={ilmoittaudu} onClick={() => track("osuvuus_ilmoittaudu", { toimiala, maakunta: mkNimi ?? "koko Suomi" })}>Ilmoita yrityksesi näihin hankkeisiin</a></div>
        </div>
      ) : <p className="muted small osuvuus-ohje">Valitse toimiala, niin näet heti, missä hankkeissa ja missä vaiheessa osaamistasi tarvitaan.</p>}
    </div>
  );
}
