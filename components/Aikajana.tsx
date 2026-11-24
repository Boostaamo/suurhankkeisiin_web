import { lahdeNimi, pvm } from "@/lib/alueet";
import { TILA_NIMI, type AikajanaVaihe } from "@/lib/aikajana";
import type { Tarve } from "@/lib/tarpeet";

// Hankkeen eteneminen vaiheittain: tila, tapahtumat lähteineen ja vaiheeseen kytketyt osaamis- ja resurssitarpeet.
function TarveRivi({ t, yleinen = false }: { t: Tarve; yleinen?: boolean }) {
  return (
    <li className={yleinen ? "yleinen" : ""}>
      <span className="tt">{t.tarve}{t.tila === "arvio" ? <span className="tag">arvio</span> : null}</span>
      {t.toimiala ? <span className="chip">{t.toimiala}</span> : null}
      {t.lahde ? <span className="src">Lähde: <a href={t.lahde} rel="noopener nofollow" target="_blank">{lahdeNimi(t.lahde)}</a>{t.pvm ? `, ${pvm(t.pvm)}` : ""}</span> : null}
    </li>
  );
}

export default function Aikajana({ vaiheet, lahteistetty, tyyppi }: { vaiheet: AikajanaVaihe[]; lahteistetty: boolean; tyyppi?: string }) {
  return (
    <>
      <ol className="vaihepalkki" aria-label="Hankkeen vaiheet">
        {vaiheet.map((v) => (
          <li key={v.id} className={`vp-${v.tila}`}><a href={`#vaihe-${v.id}`}><span className="vp-pallo" aria-hidden="true" />{v.nimi}<span className="sr"> ({TILA_NIMI[v.tila]})</span></a></li>
        ))}
      </ol>
      {!lahteistetty ? <p className="muted small">Vaihe on päätelty hankkeen tilasta. Tarkempi aikajana lähteineen lisätään datapäivityksissä.</p> : null}
      <ol className="vaihejana">
        {vaiheet.map((v) => (
          <li key={v.id} id={`vaihe-${v.id}`} className={`vj-${v.tila}`}>
            <div className="vj-otsikko">
              <h3>{v.nimi}</h3>
              <span className={`vj-tila vj-tila-${v.tila}`}>{TILA_NIMI[v.tila]}</span>
            </div>
            <p className="muted small">{v.kuvaus}</p>
            {v.tapahtumat.length ? (
              <ul className="vj-tapahtumat">
                {v.tapahtumat.map((t) => (
                  <li key={t.pvm + t.teksti}>
                    <b>{pvm(t.pvm)}</b> {t.teksti}{t.arvio ? <span className="tag">arvio</span> : null}
                    {t.lahde ? <span className="src">Lähde: <a href={t.lahde} rel="noopener nofollow" target="_blank">{lahdeNimi(t.lahde)}</a>{t.lahde_pvm ? `, ${pvm(t.lahde_pvm)}` : ""}</span> : null}
                  </li>
                ))}
              </ul>
            ) : null}
            {v.tarpeet.length || v.yleiset.length ? (
              <div className="vj-tarpeet">
                <div className="vj-tarpeet-ot">Osaamis- ja resurssitarpeet</div>
                {v.tarpeet.length ? <ul className="tarpeet">{v.tarpeet.map((t) => <TarveRivi key={t.tarve} t={t} />)}</ul> : null}
                {v.yleiset.length ? (
                  <details open={!v.tarpeet.length && v.tila !== "tehty"}>
                    <summary>Yleisesti {tyyppi ? `hanketyypissä ${tyyppi.toLowerCase()}` : ""} ({v.yleiset.length})</summary>
                    <p className="muted small" style={{ margin: "6px 0 0" }}>Hanketyypin tavalliset tarpeet, eivät tämän hankkeen tilaajan ilmoittamia.</p>
                    <ul className="tarpeet">{v.yleiset.map((t) => <TarveRivi key={t.tarve} t={t} yleinen />)}</ul>
                  </details>
                ) : null}
                {v.tila !== "tehty" ? <a className="more" href="#ilmoittaudu">Ilmoita yrityksesi tähän vaiheeseen →</a> : null}
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </>
  );
}
