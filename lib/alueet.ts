// Datakerros: content/alueet/<kunta>.json. Yksi tiedosto per kunta; maakunta- ja hankesivut syntyvät niistä.
// Tiedot kokoaa tekoäly julkisista lähteistä ja ihminen hyväksyy pull requestissa (ks. docs/datakerros.md).
import fs from "node:fs";
import path from "node:path";

export type Tila = "todennettu" | "arvio" | "avoin";
export type Tieto = { otsikko: string; arvo: string; tila: Tila; lahde?: string | null; pvm?: string | null; huomio?: string };
export type Kilpailutus = { otsikko: string; tilaaja: string; maarapaiva?: string; kuvaus?: string; lahde?: string };
export type Hanke = {
  tunniste: string; nimi: string; tiivistelma: string; tiedot: Tieto[]; kilpailutukset: Kilpailutus[];
  tyyppi?: string; vaihe_luokka?: string; investointi_meur?: number | null;
};
// Hankkeiden luokat suodattimiin. Järjestys = näyttöjärjestys.
export const VAIHEET = ["Rakenteilla", "Investointipäätös", "Luvitus", "Suunnittelu", "Keskeytetty", "Ei tietoa", "Toiminnassa", "Peruttu"];
export { EI_AKTIIVISET, aktiivinen } from "./vaihe";
export const TYYPIT = ["Datakeskus", "Energia", "Vety ja e-polttoaineet", "Teollisuus", "Kaivos", "Biojalostus ja metsä", "Infra"];
export type Tapahtuma = { nimi: string; pvm: string; paikka: string; jarjestaja?: string };
export type Naapuri = { kunta: string; maakunta: string; nimi: string; arvo: string; tila: Tila; lahde?: string; pvm?: string };
export type Kunta = {
  tunniste: string; kunta: string; kunta_genetiivi: string; maakunta: string; maakunta_tunniste: string; seutukunta?: string;
  pilotti?: boolean; paivitetty: string; esittely: string; hankkeet: Hanke[];
  tapahtumat: Tapahtuma[]; naapurikunnat: Naapuri[]; yhteystieto?: string;
};
export type Maakunta = { tunniste: string; nimi: string; kunnat: Kunta[] };

// Datalähde: DATALAHDE=tietokanta lukee kansion .data/ (scripts/hae-data.mjs hakee sen Supabasesta ennen buildia),
// muuten content/ kuten ennen.
export const DATAKANSIO = path.join(process.cwd(), process.env.DATALAHDE === "tietokanta" ? ".data" : "content");
const DIR = path.join(DATAKANSIO, "alueet");

// Kaikki Suomen kunnat ovat datakerroksessa valmiina (myös tietokannassa), jotta uutisen kunta löytyy aina.
// Sivustolla näkyvät vain kunnat, joilla on vähintään yksi hanke (Hannu 26.11.2026).
export function kaikkiKunnat(): Kunta[] {
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")) as Kunta)
    .sort((a, b) => a.kunta.localeCompare(b.kunta, "fi"));
}

export const kunnat = (): Kunta[] => kaikkiKunnat().filter((k) => k.hankkeet.length > 0);

export function maakunnat(): Maakunta[] {
  const m = new Map<string, Maakunta>();
  for (const k of kunnat()) {
    const x = m.get(k.maakunta_tunniste) ?? { tunniste: k.maakunta_tunniste, nimi: k.maakunta, kunnat: [] };
    x.kunnat.push(k);
    m.set(k.maakunta_tunniste, x);
  }
  return [...m.values()].sort((a, b) => a.nimi.localeCompare(b.nimi, "fi"));
}

export const maakunta = (t: string) => maakunnat().find((m) => m.tunniste === t) ?? null;
export const kunta = (m: string, k: string) => kunnat().find((x) => x.maakunta_tunniste === m && x.tunniste === k) ?? null;
export function hanke(m: string, k: string, h: string): { kunta: Kunta; hanke: Hanke } | null {
  const ku = kunta(m, k);
  const ha = ku?.hankkeet.find((x) => x.tunniste === h);
  return ku && ha ? { kunta: ku, hanke: ha } : null;
}

export const kuntaPolku = (k: Kunta) => `/hankkeet/${k.maakunta_tunniste}/${k.tunniste}`;
export const hankePolku = (k: Kunta, h: Hanke) => `${kuntaPolku(k)}/${h.tunniste}`;

export function pvm(iso?: string | null): string {
  if (!iso) return "";
  const [y, mo, d] = iso.split("-").map(Number);
  if (!mo) return `${y}`;
  return d ? `${d}.${mo}.${y}` : `${mo}/${y}`;
}

export function lahdeNimi(url?: string | null): string {
  if (!url) return "";
  try {
    const h = new URL(url).hostname.replace(/^www\./, "");
    return ({ "yle.fi": "Yle", "muhos.fi": "Muhoksen kunta", "mtvuutiset.fi": "MTV Uutiset", "kaleva.fi": "Kaleva", "oulunkauppakamari.fi": "Oulun kauppakamari, Suurhankeviestit", "sttinfo.fi": "STT Info", "fairedih.fi": "Finnish AI Region", "rakentaja.pro": "Rakentaja PRO", "datacenters.google": "Google", "intoseinajoki.fi": "Into Seinäjoki" } as Record<string, string>)[h] ?? h;
  } catch {
    return "";
  }
}

// Kaikki hankkeet yhtenä listana yleisnäkymää ja suodatinta varten.
import type { HankeRivi } from "./vaihe";
export type { HankeRivi };
export function hankeRivit(): HankeRivi[] {
  const s = sykkeet();
  return kunnat().flatMap((k) =>
    k.hankkeet.map((h) => ({
      nimi: h.nimi, polku: hankePolku(k, h), kunta: k.kunta, kuntaPolku: kuntaPolku(k), maakunta: k.maakunta,
      maakunta_tunniste: k.maakunta_tunniste, tyyppi: h.tyyppi ?? "Muu", vaihe: h.vaihe_luokka ?? "Ei tietoa",
      investointi_meur: h.investointi_meur ?? null, tiivistelma: h.tiivistelma,
      kunta_tunniste: k.tunniste, tunniste: h.tunniste,
      syke: s.syke.get(`${k.tunniste}/${h.tunniste}`) ?? Array(12).fill(0), uusia: s.uusia.get(`${k.tunniste}/${h.tunniste}`) ?? 0,
    })),
  );
}

// Hankkeen syke: hankkeeseen kytkettyjen uutisten määrä kuukausittain 12 kuukaudelta (vanhin ensin) ja viimeisen 7 päivän uutiset.
// Luetaan suoraan uutiset.json:sta, jotta lib/uutiset (joka tuo tämän tiedoston) ei aiheuta kehäviittausta.
export const SYKE_KUUKAUDET = (() => {
  const n = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(n.getFullYear(), n.getMonth() - 11 + i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
})();
function sykkeet() {
  const syke = new Map<string, number[]>();
  const uusia = new Map<string, number>();
  const raja = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
  const lista = (JSON.parse(fs.readFileSync(path.join(DATAKANSIO, "uutiset.json"), "utf8")) as { uutiset: { pvm: string; hankkeet?: string[] }[] }).uutiset;
  for (const u of lista) for (const a of u.hankkeet ?? []) {
    const i = SYKE_KUUKAUDET.indexOf(u.pvm.slice(0, 7));
    const r = syke.get(a) ?? Array(12).fill(0);
    if (i >= 0) r[i]++;
    syke.set(a, r);
    if (u.pvm >= raja) uusia.set(a, (uusia.get(a) ?? 0) + 1);
  }
  return { syke, uusia };
}
export const aktiivisia = (k: Kunta) => k.hankkeet.filter((h) => !["Toiminnassa", "Peruttu"].includes(h.vaihe_luokka ?? "")).length;
export const hankkeita = (n: number) => `${n} ${n === 1 ? "hanke" : "hanketta"}`;
