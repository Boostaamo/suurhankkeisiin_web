// Haun pisteytys selaimessa. Kirjainkoko ja tarkkeet (ä, ö) eivät vaikuta; jokaisen hakusanan pitää löytyä.
export type HakuKohde = { laji: string; otsikko: string; kuvaus: string; url: string; sanat: string; ulkoinen?: boolean };

export const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const LAJIPAINO: Record<string, number> = { Hanke: 6, Kunta: 7, Maakunta: 7, Osaamistarve: 3, Sivu: 2, Uutinen: 1 };

export function hae(indeksi: HakuKohde[], q: string, max = 8): HakuKohde[] {
  const sanat = norm(q).split(/\s+/).filter((s) => s.length > 1 || /\d/.test(s));
  if (!sanat.length) return [];
  const tulos: { k: HakuKohde; p: number }[] = [];
  for (const k of indeksi) {
    const o = norm(k.otsikko), muu = norm(`${k.kuvaus} ${k.sanat}`);
    let p = 0;
    for (const s of sanat) {
      if (o.startsWith(s)) p += 20;
      else if (new RegExp(`(^|[^a-z0-9])${s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(o)) p += 12;
      else if (o.includes(s)) p += 8;
      else if (muu.includes(s)) p += 3;
      else { p = -1; break; }
    }
    if (p > 0) tulos.push({ k, p: p + (LAJIPAINO[k.laji] ?? 0) });
  }
  return tulos.sort((a, b) => b.p - a.p || a.k.otsikko.localeCompare(b.k.otsikko, "fi")).slice(0, max).map((x) => x.k);
}
