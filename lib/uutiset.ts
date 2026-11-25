// Uutisfeedi: content/uutiset.json (tai .data/uutiset.json, kun DATALAHDE=tietokanta). Renderöidään etusivulle merkinnän <!--uutiset--> kohdalle (tai <!--uutiset|Muhos--> kunnittain).
import fs from "node:fs";
import path from "node:path";
import { DATAKANSIO, pvm } from "@/lib/alueet";

// Samasta asiasta tehdyt uutiset niputetaan yhdeksi: ensisijainen lähde kentissä julkaisija/url/pvm, muut kentässä lisalahteet (Hannu 25.11.2026).
export type Lahde = { julkaisija: string; url: string; pvm: string };
export type Uutinen = { otsikko: string; ingressi: string; julkaisija: string; url: string; pvm: string; kunta?: string; maakunta?: string; hankkeet?: string[]; lisalahteet?: Lahde[] };

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const kaikki = (): Uutinen[] =>
  (JSON.parse(fs.readFileSync(path.join(DATAKANSIO, "uutiset.json"), "utf8")) as { uutiset: Uutinen[] }).uutiset;

export const lisalahteetHtml = (u: Uutinen) =>
  u.lisalahteet?.length
    ? `<div class="lisalahteet">Myös: ${u.lisalahteet
        .map((l) => `<a href="${esc(l.url)}" target="_blank" rel="noopener nofollow" data-track="click_uutinen">${esc(l.julkaisija)} ${esc(pvm(l.pvm))}</a>`)
        .join(", ")}</div>`
    : "";

export function uutiset(kunta?: string, max = 5): Uutinen[] {
  return kaikki()
    .filter((u) => !kunta || u.kunta === kunta)
    .sort((a, b) => b.pvm.localeCompare(a.pvm))
    .slice(0, max);
}

export function uutisetHtml(kunta?: string, max = 5): string {
  const list = uutiset(kunta, max);
  if (!list.length) return `<p class="muted">Ei uutisia vielä.</p>`;
  return `<div class="news">${list
    .map(
      (u) => `<article class="newsitem"><div class="newsmeta">${esc(pvm(u.pvm))} · ${esc(u.julkaisija)}${u.kunta ? ` · ${esc(u.kunta)}` : ""}</div>
<h3><a href="${esc(u.url)}" target="_blank" rel="noopener nofollow" data-track="click_uutinen">${esc(u.otsikko)}</a></h3>
<p>${esc(u.ingressi)}</p>
<a class="more" href="${esc(u.url)}" target="_blank" rel="noopener nofollow" data-track="click_uutinen">Lue uutinen (${esc(u.julkaisija)}) →</a>${lisalahteetHtml(u)}</article>`,
    )
    .join("")}</div>`;
}

// Hankkeeseen kytketyt uutiset vanhimmasta uusimpaan (hankesivun aikajana). Avain: <kunnan tunniste>/<hankkeen tunniste>.
export function hankkeenUutiset(kunta: string, hanke: string): Uutinen[] {
  const avain = `${kunta}/${hanke}`;
  return kaikki()
    .filter((u) => u.hankkeet?.includes(avain))
    .sort((a, b) => a.pvm.localeCompare(b.pvm));
}
