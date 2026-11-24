"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { hae, type HakuKohde } from "@/lib/hakuapu";
import { track } from "@/lib/analytics";

// Hakukenttä: ehdottaa hankkeita, kuntia, osaamistarpeita, uutisia ja sivuja kirjoitettaessa. Indeksi ladataan ensimmäisellä kosketuksella.
let valimuisti: Promise<HakuKohde[]> | null = null;
const lataa = () => (valimuisti ??= fetch("/hakuindeksi.json").then((r) => r.json() as Promise<HakuKohde[]>).catch(() => { valimuisti = null; return []; }));

export default function Haku({ iso = false, alku = "" }: { iso?: boolean; alku?: string }) {
  const [q, setQ] = useState(alku);
  const [indeksi, setIndeksi] = useState<HakuKohde[] | null>(null);
  const [auki, setAuki] = useState(false);
  const [valittu, setValittu] = useState(-1);
  const router = useRouter();
  const juuri = useRef<HTMLFormElement>(null);

  useEffect(() => { if (iso || alku) lataa().then(setIndeksi); }, [iso, alku]);
  useEffect(() => {
    const sulje = (e: MouseEvent) => { if (!juuri.current?.contains(e.target as Node)) setAuki(false); };
    document.addEventListener("mousedown", sulje);
    return () => document.removeEventListener("mousedown", sulje);
  }, []);

  const ehdotukset = indeksi && q.trim() ? hae(indeksi, q, iso ? 50 : 8) : [];
  const avaa = (k: HakuKohde) => {
    track("select_content", { content_type: "haku", item_id: k.url, search_term: q.trim() });
    setAuki(false);
    if (k.ulkoinen) window.open(k.url, "_blank", "noopener");
    else router.push(k.url);
  };
  const laheta = (e: React.FormEvent) => {
    e.preventDefault();
    if (valittu >= 0 && ehdotukset[valittu]) return avaa(ehdotukset[valittu]);
    if (!q.trim()) return;
    track("search", { search_term: q.trim() });
    setAuki(false);
    router.push(`/haku?q=${encodeURIComponent(q.trim())}`);
  };
  const nappain = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setAuki(true); setValittu((v) => Math.min(v + 1, ehdotukset.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setValittu((v) => Math.max(v - 1, -1)); }
    else if (e.key === "Escape") setAuki(false);
  };

  const lista = (
    <ul className={iso ? "hakutulokset" : "hakuehdotukset"} role="listbox" id={iso ? "hakutulokset" : "hakuehdotukset"}>
      {ehdotukset.map((k, i) => (
        <li key={k.laji + k.url + k.otsikko} role="option" aria-selected={i === valittu}>
          <a href={k.url} className={i === valittu ? "on" : ""} {...(k.ulkoinen ? { target: "_blank", rel: "noopener nofollow" } : {})}
            onClick={(e) => { if (!k.ulkoinen) { e.preventDefault(); avaa(k); } else track("select_content", { content_type: "haku", item_id: k.url, search_term: q.trim() }); }}>
            <span className="laji">{k.laji}</span>
            <span className="ot">{k.otsikko}</span>
            {k.kuvaus ? <span className="kuv">{k.kuvaus}</span> : null}
          </a>
        </li>
      ))}
      {!iso && q.trim() && indeksi ? (
        <li className="kaikki"><a href={`/haku?q=${encodeURIComponent(q.trim())}`} onClick={laheta}>{ehdotukset.length ? "Näytä kaikki tulokset" : "Ei ehdotuksia. Hae koko sivustolta"} →</a></li>
      ) : null}
    </ul>
  );

  return (
    <form ref={juuri} className={iso ? "hakuiso" : "hakubox"} role="search" onSubmit={laheta}>
      <label className="sr" htmlFor={iso ? "haku-iso" : "haku"}>Hae sivustolta</label>
      <input
        id={iso ? "haku-iso" : "haku"} className="fld" type="search" value={q} autoComplete="off"
        placeholder={iso ? "Hae hanketta, kuntaa, osaamista tai uutista" : "Hae…"}
        aria-controls={iso ? "hakutulokset" : "hakuehdotukset"} aria-expanded={auki}
        onFocus={() => { lataa().then(setIndeksi); setAuki(true); }}
        onChange={(e) => { setQ(e.target.value); setValittu(-1); setAuki(true); }}
        onKeyDown={nappain}
      />
      {iso ? (
        <>
          {q.trim() && indeksi ? <p className="muted small" style={{ margin: "12px 0 0" }}>{ehdotukset.length ? `${ehdotukset.length} osumaa` : "Ei osumia. Kokeile hankkeen, kunnan tai toimialan nimeä."}</p> : null}
          {lista}
        </>
      ) : auki && q.trim() ? lista : null}
    </form>
  );
}
