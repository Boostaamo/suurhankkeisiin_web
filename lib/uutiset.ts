// Uutisfeedi: content/uutiset.json. Renderöidään etusivulle merkinnän <!--uutiset--> kohdalle (tai <!--uutiset|Muhos--> kunnittain).
import raw from "@/content/uutiset.json";
import { pvm } from "@/lib/alueet";

export type Uutinen = { otsikko: string; ingressi: string; julkaisija: string; url: string; pvm: string; kunta?: string; maakunta?: string; hankkeet?: string[] };

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function uutiset(kunta?: string, max = 5): Uutinen[] {
  return (raw.uutiset as Uutinen[])
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
<a class="more" href="${esc(u.url)}" target="_blank" rel="noopener nofollow" data-track="click_uutinen">Lue uutinen (${esc(u.julkaisija)}) →</a></article>`,
    )
    .join("")}</div>`;
}

// Hankkeeseen kytketyt uutiset vanhimmasta uusimpaan (hankesivun aikajana). Avain: <kunnan tunniste>/<hankkeen tunniste>.
export function hankkeenUutiset(kunta: string, hanke: string): Uutinen[] {
  const avain = `${kunta}/${hanke}`;
  return (raw.uutiset as Uutinen[])
    .filter((u) => u.hankkeet?.includes(avain))
    .sort((a, b) => a.pvm.localeCompare(b.pvm));
}
