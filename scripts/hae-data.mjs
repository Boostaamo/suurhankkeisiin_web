#!/usr/bin/env node
// Datalähteen kytkin (Bistek, vaihe 1). Ajetaan ennen buildia (prebuild, predev).
//
// DATALAHDE=tiedostot (oletus): ei tee mitään, sivusto lukee content/-kansion kuten ennen.
// DATALAHDE=tietokanta: hakee julkaistut tiedot Supabasen julkisista näkymistä (julkiset_*) julkisella
// avaimella ja kirjoittaa ne kansioon .data/ samassa muodossa kuin content/. Sivupohjat eivät muutu.
// Jos haku epäonnistuu tai data on tyhjä, build pysähtyy (ei julkaista tyhjää sivustoa).
//
// Taustajärjestelmä: repo Boostaamo/suurhankkisiin_data. Ei riippuvuuksia (REST kuten lib/liidit.ts).
import fs from "node:fs";
import path from "node:path";

const NAKYMAT = ["julkiset_kunnat", "julkiset_hankkeet", "julkiset_tiedot", "julkiset_tapahtumat", "julkiset_naapurikunnat", "julkiset_uutiset"];

const ilmanTyhjia = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null && v !== undefined));
const avain = (...osat) => osat.join("/");
const jarjestys = (a, b) => (a.jarjestys ?? 0) - (b.jarjestys ?? 0);

/** Koostaa näkymien rivit sivuston tiedostomuotoon: { kunnat: Kunta[], uutiset: Uutinen[] }. */
export function koosta(r) {
  const ryhmita = (rivit, f) => {
    const m = new Map();
    for (const x of [...rivit].sort(jarjestys)) {
      const k = f(x);
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(x);
    }
    return m;
  };
  const tiedot = ryhmita(r.julkiset_tiedot, (t) => avain(t.maakunta_tunniste, t.kunta_tunniste, t.hanke_tunniste));
  const hankkeet = ryhmita(r.julkiset_hankkeet, (h) => avain(h.maakunta_tunniste, h.kunta_tunniste));
  const tapahtumat = ryhmita(r.julkiset_tapahtumat, (t) => avain(t.maakunta_tunniste, t.kunta_tunniste));
  const naapurit = ryhmita(r.julkiset_naapurikunnat, (n) => avain(n.maakunta_tunniste, n.kunta_tunniste));

  const kunnat = r.julkiset_kunnat.map((k) => {
    const ka = avain(k.maakunta_tunniste, k.tunniste);
    return ilmanTyhjia({
      tunniste: k.tunniste,
      kunta: k.kunta,
      kunta_genetiivi: k.kunta_genetiivi,
      maakunta: k.maakunta,
      maakunta_tunniste: k.maakunta_tunniste,
      seutukunta: k.seutukunta,
      pilotti: k.pilotti,
      paivitetty: k.paivitetty,
      esittely: k.esittely,
      yhteystieto: k.yhteystieto,
      hankkeet: (hankkeet.get(ka) ?? []).map((h) => ({
        ...ilmanTyhjia({
          tunniste: h.tunniste,
          nimi: h.nimi,
          tyyppi: h.tyyppi,
          vaihe_luokka: h.vaihe_luokka,
          tiivistelma: h.tiivistelma,
          tiedot: (tiedot.get(avain(ka, h.tunniste)) ?? []).map((t) =>
            ilmanTyhjia({ otsikko: t.otsikko, arvo: t.arvo, tila: t.tila, lahde: t.lahde, pvm: t.pvm, huomio: t.huomio }),
          ),
          kilpailutukset: [],
        }),
        investointi_meur: h.investointi_meur === null ? null : Number(h.investointi_meur),
      })),
      tapahtumat: (tapahtumat.get(ka) ?? []).map((t) => ilmanTyhjia({ nimi: t.nimi, pvm: t.pvm, paikka: t.paikka, jarjestaja: t.jarjestaja })),
      naapurikunnat: (naapurit.get(ka) ?? []).map((n) =>
        ilmanTyhjia({ kunta: n.kunta, maakunta: n.maakunta, nimi: n.nimi, arvo: n.arvo, tila: n.tila, lahde: n.lahde, pvm: n.pvm }),
      ),
    });
  });

  const uutiset = [...r.julkiset_uutiset]
    .sort((a, b) => String(b.pvm).localeCompare(String(a.pvm)))
    .map((u) =>
      ilmanTyhjia({
        otsikko: u.otsikko, ingressi: u.ingressi, julkaisija: u.julkaisija, url: u.url, pvm: u.pvm, kunta: u.kunta, maakunta: u.maakunta,
        hankkeet: u.hankkeet ?? undefined, lisalahteet: u.lisalahteet ?? undefined,
      }),
    );

  return { kunnat, uutiset };
}

async function hae(url, julkinenAvain, nakyma) {
  const res = await fetch(`${url}/rest/v1/${nakyma}?select=*`, {
    headers: {
      apikey: julkinenAvain,
      // Uudet sb_publishable_-avaimet eivät ole JWT:itä: Bearer vain vanhalle anon-avaimelle.
      ...(julkinenAvain.startsWith("eyJ") ? { Authorization: `Bearer ${julkinenAvain}` } : {}),
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error(`${nakyma}: tila ${res.status} ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

export function kirjoita(kohde, { kunnat, uutiset }) {
  const alueet = path.join(kohde, "alueet");
  fs.rmSync(kohde, { recursive: true, force: true });
  fs.mkdirSync(alueet, { recursive: true });
  for (const k of kunnat) fs.writeFileSync(path.join(alueet, `${k.tunniste}.json`), JSON.stringify(k, null, 2));
  fs.writeFileSync(path.join(kohde, "uutiset.json"), JSON.stringify({ uutiset }, null, 2));
}

// Siirtymäkausi (Hannu 24.11.2026): tuotanto lukee tietokantaa, mutta vaiheen 1 ajastetut tehtävät päivittävät
// vielä JSON-tiedostoja. TUONTI_JSONISTA=kylla vie content/-kansion tietokantaan ennen hakua (tuo_datakerros,
// palvelinavain), jolloin hyväksytyt JSON-PR:t näkyvät sivustolla. Poistetaan, kun automaattinen nouto korvaa tehtävät.
function lueContent() {
  const dir = path.join(process.cwd(), "content");
  const alueet = path.join(dir, "alueet");
  const kunnat = fs
    .readdirSync(alueet)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => {
      const { _ohje, ...k } = JSON.parse(fs.readFileSync(path.join(alueet, f), "utf8"));
      return k;
    });
  const uutiset = JSON.parse(fs.readFileSync(path.join(dir, "uutiset.json"), "utf8")).uutiset;
  return { kunnat, uutiset };
}

// Siirtymäkausi: jos tietokannan uutisnäkymässä ei ole kenttiä hankkeet tai lisalahteet, ne täydennetään
// content/uutiset.json-tiedostosta saman url:n perusteella, jotta hankeaikajanat ja niputetut lähteet näkyvät.
function taydennaUutiset(uutiset) {
  const tiedosto = path.join(process.cwd(), "content", "uutiset.json");
  if (!fs.existsSync(tiedosto)) return;
  const json = new Map(JSON.parse(fs.readFileSync(tiedosto, "utf8")).uutiset.map((u) => [u.url, u]));
  for (const u of uutiset) {
    const j = json.get(u.url);
    if (!j) continue;
    if (!u.hankkeet && j.hankkeet) u.hankkeet = j.hankkeet;
    if (!u.lisalahteet && j.lisalahteet) u.lisalahteet = j.lisalahteet;
  }
}

async function tuoJsonista(url) {
  const avain = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!avain) throw new Error("TUONTI_JSONISTA=kylla tarvitsee muuttujan SUPABASE_SERVICE_ROLE_KEY.");
  const syote = lueContent();
  const res = await fetch(`${url}/rest/v1/rpc/tuo_datakerros`, {
    method: "POST",
    headers: {
      apikey: avain,
      ...(avain.startsWith("eyJ") ? { Authorization: `Bearer ${avain}` } : {}),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ syote }),
  });
  if (!res.ok) throw new Error(`Tuonti JSONista epäonnistui, tila ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const tulos = await res.json();
  const hankkeita = syote.kunnat.reduce((n, k) => n + k.hankkeet.length, 0);
  if (tulos.kunnat !== syote.kunnat.length || tulos.hankkeet !== hankkeita) {
    throw new Error(`Tuonnin määrät eivät täsmää: ${JSON.stringify(tulos)}`);
  }
  console.log(`Tuonti JSONista tietokantaan: ${JSON.stringify(tulos)}`);
}

async function main() {
  if (process.env.DATALAHDE !== "tietokanta") return;
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
  const julkinenAvain =
    process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !julkinenAvain) {
    throw new Error("DATALAHDE=tietokanta tarvitsee muuttujat SUPABASE_URL ja SUPABASE_PUBLISHABLE_KEY (tai anon-avaimen).");
  }
  if (process.env.TUONTI_JSONISTA === "kylla") await tuoJsonista(url);
  const rivit = Object.fromEntries(await Promise.all(NAKYMAT.map(async (n) => [n, await hae(url, julkinenAvain, n)])));
  const data = koosta(rivit);
  if (!data.kunnat.length || !data.kunnat.some((k) => k.hankkeet.length)) {
    throw new Error("Tietokannasta ei tullut yhtään kuntaa tai hanketta. Build pysäytetään.");
  }
  taydennaUutiset(data.uutiset);
  kirjoita(path.join(process.cwd(), ".data"), data);
  const hankkeita = data.kunnat.reduce((n, k) => n + k.hankkeet.length, 0);
  console.log(`Datalähde: tietokanta. ${data.kunnat.length} kuntaa, ${hankkeita} hanketta, ${data.uutiset.length} uutista.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(`Datan haku epäonnistui: ${e.message}`);
    process.exit(1);
  });
}
