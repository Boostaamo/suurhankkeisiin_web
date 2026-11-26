// Tekee Suomen kuntakartan datan tiedostoon content/kartta.json (ks. docs/kartta.md).
// Käyttö: node scripts/tee-kartta.mjs <kuntarajat.geojson> <kuntakeskukset.geojson>
//  - kuntarajat: Tilastokeskuksen kuntarajat (CC BY 4.0), yksinkertaistettu, WGS84, ominaisuus "mncplty" = kunnan nimi
//  - kuntakeskukset: Maanmittauslaitoksen Maastotietokannan kunnanhallintokeskukset (CC BY 4.0), ominaisuus "teksti"
// Projektio: sinusoidaalinen, keskimeridiaani 26° E. Tulos: SVG-polut ja kuntakeskusten pisteet viewBoxiin.
import fs from "node:fs";

const [rajatPolku, keskuksetPolku] = process.argv.slice(2);
if (!rajatPolku || !keskuksetPolku) {
  console.error("Käyttö: node scripts/tee-kartta.mjs <kuntarajat.geojson> <kuntakeskukset.geojson>");
  process.exit(1);
}
const rajat = JSON.parse(fs.readFileSync(rajatPolku, "utf8"));
const keskukset = JSON.parse(fs.readFileSync(keskuksetPolku, "utf8"));

const S = 80; // pikseliä asteelle
const proj = ([lon, lat]) => [(lon - 26) * Math.cos((lat * Math.PI) / 180), lat];
const renkaat = (g) => (g.type === "Polygon" ? g.coordinates : g.type === "MultiPolygon" ? g.coordinates.flat() : []);

let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
for (const f of rajat.features) for (const r of renkaat(f.geometry)) for (const p of r) {
  const [x, y] = proj(p); minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
}
const M = 8;
const xy = (p) => { const [x, y] = proj(p); return [+((x - minX) * S + M).toFixed(1), +((maxY - y) * S + M).toFixed(1)]; };
const W = Math.ceil((maxX - minX) * S + 2 * M), H = Math.ceil((maxY - minY) * S + 2 * M);

const norm = (s) => s.normalize("NFC").trim().toUpperCase();
const pisteet = new Map();
for (const f of keskukset.features) if (f.geometry?.type === "Point" && f.properties?.teksti) pisteet.set(norm(f.properties.teksti), xy(f.geometry.coordinates));

// Lähteessä ruotsinenemmistöisillä kunnilla on ruotsinkielinen nimi; sivusto käyttää suomenkielistä.
const SUOMEKSI = { "Ingå": "Inkoo", "Jakobstad": "Pietarsaari", "Kimitoön": "Kemiönsaari", "Korsholm": "Mustasaari", "Kristinestad": "Kristiinankaupunki", "Kronoby": "Kruunupyy", "Larsmo": "Luoto", "Malax": "Maalahti", "Mariehamn": "Maarianhamina", "Nykarleby": "Uusikaarlepyy", "Närpes": "Närpiö", "Pargas": "Parainen", "Raseborg": "Raasepori", "Vörå": "Vöyri" };
const kunnat = rajat.features.map((f) => {
  const nimi = SUOMEKSI[f.properties.mncplty] ?? f.properties.mncplty;
  const rr = renkaat(f.geometry).map((r) => r.map(xy));
  const d = rr.map((r) => "M" + r.map((p) => p.join(",")).join("L") + "Z").join("");
  // Varapiste: renkaiden pisteiden keskiarvo, jos kuntakeskusta ei löydy nimellä.
  const kaikki = rr.flat();
  const keski = [+(kaikki.reduce((a, p) => a + p[0], 0) / kaikki.length).toFixed(1), +(kaikki.reduce((a, p) => a + p[1], 0) / kaikki.length).toFixed(1)];
  const xs = kaikki.map((p) => p[0]), ys = kaikki.map((p) => p[1]);
  return { nimi, d, piste: pisteet.get(norm(nimi)) ?? keski, rajaus: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)] };
}).sort((a, b) => a.nimi.localeCompare(b.nimi, "fi"));

const ilman = kunnat.filter((k) => !pisteet.has(norm(k.nimi))).map((k) => k.nimi);
fs.writeFileSync("content/kartta.json", JSON.stringify({
  _ohje: "Generoitu: node scripts/tee-kartta.mjs (docs/kartta.md). Älä muokkaa käsin.",
  lahteet: "Kuntarajat: Tilastokeskus (CC BY 4.0), yksinkertaistettu. Kuntakeskukset: Maanmittauslaitos, Maastotietokanta (CC BY 4.0).",
  leveys: W, korkeus: H, kunnat,
}));
console.log(`${kunnat.length} kuntaa, viewBox ${W}x${H}. Kuntakeskus puuttui (käytetty keskiarvopistettä): ${ilman.join(", ") || "ei yhtään"}`);
