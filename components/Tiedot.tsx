import type { Tieto } from "@/lib/alueet";
import { lahdeNimi, pvm } from "@/lib/alueet";

// Näyttää vain todennetut tiedot ja arviot. Avoimet (tarkistamattomat) tiedot jätetään pois.
export default function Tiedot({ tiedot }: { tiedot: Tieto[] }) {
  return (
    <dl className="tiedot">
      {tiedot.filter((t) => t.tila !== "avoin").map((t) => (
        <div key={t.otsikko} className="tieto">
          <dt>{t.otsikko}</dt>
          <dd>
            {t.tila === "avoin" ? (
              <span className="muted">Tieto tarkistetaan</span>
            ) : (
              <>
                {t.arvo}
                {t.tila === "arvio" ? <span className="tag">arvio</span> : null}
              </>
            )}
            {t.lahde && t.tila !== "avoin" ? (
              <span className="src">
                Lähde: <a href={t.lahde} rel="noopener nofollow" target="_blank">{lahdeNimi(t.lahde)}</a>
                {t.pvm ? `, ${pvm(t.pvm)}` : ""}
              </span>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}
