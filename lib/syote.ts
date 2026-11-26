// RSS-syötteet ja kalenteri (.ics). Syntyvät buildissa datakerroksesta: /syote[/maakunta[/kunta[/hanke]]] ja /kalenteri[/maakunta/kunta].
import { kunnat, maakunnat } from "@/lib/alueet";
import { uutiset, type Uutinen } from "@/lib/uutiset";
import { site } from "@/lib/site";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export type SyoteKohde = { otsikko: string; polku: string; suodatin: (u: Uutinen) => boolean };

export function syoteKohde(osat: string[]): SyoteKohde | null {
  const [mt, kt, ht] = osat;
  if (!mt) return { otsikko: "Kaikki suurhankkeet", polku: "/hankkeet", suodatin: () => true };
  const m = maakunnat().find((x) => x.tunniste === mt);
  if (!m) return null;
  if (!kt) {
    const kk = new Set(m.kunnat.map((k) => k.kunta));
    return { otsikko: m.nimi, polku: `/hankkeet/${m.tunniste}`, suodatin: (u) => !!u.kunta && kk.has(u.kunta) };
  }
  const k = m.kunnat.find((x) => x.tunniste === kt);
  if (!k) return null;
  if (!ht) return { otsikko: k.kunta, polku: `/hankkeet/${m.tunniste}/${k.tunniste}`, suodatin: (u) => u.kunta === k.kunta || !!u.hankkeet?.some((a) => a.startsWith(`${k.tunniste}/`)) };
  const h = k.hankkeet.find((x) => x.tunniste === ht);
  if (!h) return null;
  return { otsikko: h.nimi, polku: `/hankkeet/${m.tunniste}/${k.tunniste}/${h.tunniste}`, suodatin: (u) => !!u.hankkeet?.includes(`${k.tunniste}/${h.tunniste}`) };
}

export const syotePolut = (): string[][] => [
  [],
  ...maakunnat().map((m) => [m.tunniste]),
  ...kunnat().flatMap((k) => [[k.maakunta_tunniste, k.tunniste], ...k.hankkeet.map((h) => [k.maakunta_tunniste, k.tunniste, h.tunniste])]),
];

export function rss(k: SyoteKohde): string {
  const lista = uutiset(undefined, 100000).filter(k.suodatin).slice(0, 50);
  const items = lista.map((u) => `<item><title>${esc(u.otsikko)}</title><link>${esc(u.url)}</link><guid isPermaLink="false">${esc(u.url)}</guid><pubDate>${new Date(`${u.pvm}T08:00:00Z`).toUTCString()}</pubDate><description>${esc(`${u.ingressi} (${u.julkaisija})`)}</description>${u.kunta ? `<category>${esc(u.kunta)}</category>` : ""}</item>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${esc(`${site.name}: ${k.otsikko}`)}</title><link>${site.url}${k.polku}</link><description>${esc(`Suurhankkeiden uutiset: ${k.otsikko}. Ingressit ovat Suurhankkeisiin.fi:n, linkki vie alkuperäiseen uutiseen.`)}</description><language>fi</language>${items}</channel></rss>`;
}

// Kalenteri: kuntien tapahtumat (pvm muodossa VVVV-KK-PP) kokopäivän tapahtumina.
export function ics(osat: string[]): string | null {
  const [mt, kt] = osat;
  const lista = kunnat().filter((k) => !mt || (k.maakunta_tunniste === mt && (!kt || k.tunniste === kt)));
  if (mt && !lista.length) return null;
  const leima = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const icsEsc = (s: string) => s.replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");
  const tap = lista.flatMap((k) => k.tapahtumat.filter((t) => /^\d{4}-\d{2}-\d{2}$/.test(t.pvm)).map((t) => {
    const p = t.pvm.replace(/-/g, "");
    const seur = new Date(`${t.pvm}T12:00:00Z`); seur.setUTCDate(seur.getUTCDate() + 1);
    return ["BEGIN:VEVENT", `UID:${k.tunniste}-${p}-${t.nimi.length}@suurhankkeisiin.fi`, `DTSTAMP:${leima}`, `DTSTART;VALUE=DATE:${p}`, `DTEND;VALUE=DATE:${seur.toISOString().slice(0, 10).replace(/-/g, "")}`,
      `SUMMARY:${icsEsc(t.nimi)}`, `LOCATION:${icsEsc(t.paikka)}`, `DESCRIPTION:${icsEsc(`${t.jarjestaja ? `${t.jarjestaja}. ` : ""}${site.url}/hankkeet/${k.maakunta_tunniste}/${k.tunniste}`)}`, "END:VEVENT"].join("\r\n");
  }));
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Suurhankkeisiin.fi//Tapahtumat//FI", "CALSCALE:GREGORIAN", `X-WR-CALNAME:${icsEsc(`Suurhankkeisiin.fi${kt ? `: ${lista[0]?.kunta}` : ""}`)}`, ...tap, "END:VCALENDAR"].join("\r\n");
}
