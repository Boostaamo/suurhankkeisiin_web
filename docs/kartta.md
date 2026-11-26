# Kartta ja interaktiiviset osat

Lisätty 26.11.2026 (Hannun hyväksymä ehdotus, kierrokset 1 ja 2).

## Pohjakartta

`content/kartta.json` on generoitu tiedosto: Suomen 308 kunnan rajat SVG-polkuina ja kunnan keskuksen piste. Älä muokkaa käsin.

Lähteet (molemmat CC BY 4.0, lähdemerkintä näkyy kartan alla):
- Kuntarajat: Tilastokeskus, kuntarajat (yksinkertaistettu WGS84-versio, saatu FinLingDiv-aineiston kautta: github.com/Eszettfors/FinLingDivMap, `public/geo/municipalities.geojson`).
- Kuntakeskukset: Maanmittauslaitos, Maastotietokanta, kunnanhallintokeskukset (github.com/tjukanovt/tjukanovt.github.io, `data2share/kunnanhallintokeskus.geojson`).

Päivitys (esim. kuntaliitokset): lataa tiedostot ja aja `node scripts/tee-kartta.mjs <kuntarajat.geojson> <kuntakeskukset.geojson>`. Ruotsinkieliset nimet muutetaan suomenkielisiksi skriptissä (`SUOMEKSI`). Hankkeen piste sijoittuu kunnan keskuksen ympärille, joten hankkeen kunnan nimen on vastattava kartan nimeä.

Maakuntaan tarkennus käyttää datakerroksen kuntia (`content/alueet`). Kun kaikki kunnat ovat datakerroksessa, tarkennus kattaa koko maakunnan.

## Osat ja sivut

| Toiminto | Missä | Tiedostot |
|---|---|---|
| Kartta | etusivu, /hankkeet, maakuntasivut, tilannehuone | components/Kartta.tsx, lib/kartta.ts |
| Hankeputki | etusivu, /hankkeet (suodattaa listan), tilannehuone | components/Hankeputki.tsx |
| Tunnusluvut ja tällä viikolla -nauha | etusivu | components/Osat.tsx, components/Laskuri.tsx, lib/tunnusluvut.ts |
| Sopiiko yritykseni? | etusivu (#sopiiko), esitäyttää ilmoittautumisen (?toimiala=&alue=) | components/Osuvuus.tsx, components/Form.tsx |
| Eniten uutisoidut, hankkeen syke | etusivu, hankelista, hankesivu | components/Syke.tsx, lib/alueet.ts (syke) |
| Vertailu | hankelistan Vertaa-valinta → /vertailu?h=… | components/Vertailu.tsx, app/vertailu.json |
| Jakokuvat ja jakopainikkeet | hanke- ja kuntasivu | app/hankkeet/[maakunta]/[kunta]/[hanke]/opengraph-image.tsx, components/Jaa.tsx |
| RSS | /syote, /syote/<maakunta>[/<kunta>[/<hanke>]] | lib/syote.ts, app/syote |
| Kalenteri (.ics) | /kalenteri, /kalenteri/<maakunta>/<kunta> | lib/syote.ts, app/kalenteri |
| Kuntawidget | /upotus/<maakunta>/<kunta>, upotuskoodi kuntasivulla | app/upotus, components/Upotus.tsx |
| Tilannehuone | /tilannehuone (ei valikossa, noindex). Nuolet vaihtavat, välilyönti tauko, f koko näyttö | app/tilannehuone, components/Tilannehuone.tsx |
| Haun pikanäppäin | Ctrl K / ⌘K tai / | components/Haku.tsx |

Etusivun osat merkitään Markdowniin omalle rivilleen osioiden väliin: `<!--osa:tunnusluvut-->`, `<!--osa:kartta-->`, `<!--osa:osuvuus-->`, `<!--osa:kuumat-->`.

/hankkeet ottaa alkuvalinnat osoitteesta: `?maakunta=<tunniste>&tyyppi=&vaihe=&q=`.

Upotus: vain `/upotus/*` saa näkyä iframessa (next.config.mjs). Upotusnäkymässä ei ole ylä- eikä alatunnistetta eikä evästebanneria, joten analytiikka ei lataudu.

## Luvut

Kaikki luvut lasketaan datakerroksesta. Investointisummat lasketaan vain hankkeista, joilla summa on lähteistetty, ja määrä kerrotaan luvun yhteydessä. Osuvuustyökalu käyttää tiedoston `content/tarpeet.json` tarpeita: hankekohtaiset ja hanketyypin yleiset. Hanketyypin yleisiä tarpeita on toistaiseksi vain datakeskuksille, joten muiden tyyppien hankkeet näkyvät työkalussa vain, jos niille on hankekohtaisia tarpeita.

## GA4-tapahtumat (vain suostumuksen jälkeen)

- `click_kartta` (kohde=hanke|kunta, maakunta, kunta, hanke)
- `click_putki` (vaihe)
- `osuvuus_tulos` (toimiala, maakunta, osumia), `osuvuus_ilmoittaudu` (toimiala, maakunta)
- `vertailu_avaus` (maara)
- `share` (method=linkedin|kopioi, item_id)
- `upotus_avaus`, `upotus_kopioi` (kunta)
- `click_nauha`, `click_rss`, `click_kalenteri` (ClickTracker)
