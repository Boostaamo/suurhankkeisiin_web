# Datakerros ja tekoälykerros

Tila: luonnos | Versio: v0.1 | Pvm: 2026-11-24 | Tekijä: Claude Code

Hanke-, kunta- ja maakuntasivut syntyvät JSON-tiedostoista kansiossa `content/alueet/`. Yksi tiedosto per kunta (esim. `muhos.json`). Maakuntasivu kootaan kuntien `maakunta_tunniste`-kentästä.

Osoitteet:
- `/hankkeet` kaikki alueet
- `/hankkeet/<maakunta>` esim. `/hankkeet/pohjois-pohjanmaa`
- `/hankkeet/<maakunta>/<kunta>` esim. `/hankkeet/pohjois-pohjanmaa/muhos`
- `/hankkeet/<maakunta>/<kunta>/<hanke>` esim. `/hankkeet/pohjois-pohjanmaa/muhos/datakeskus`

## Tiedon tila
Jokaisella hankkeen tiedolla (`tiedot[]`) on `arvo`, `tila`, `lahde` (URL) ja `pvm` (lähteen päiväys).
- `todennettu`: lähde sanoo asian suoraan. Näytetään.
- `arvio`: lähteessä arvio tai vaihteluväli. Näytetään merkinnällä "arvio".
- `avoin`: tieto puuttuu tai on tarkistettava. Ei näytetä sivulla.

Älä lisää tietoa ilman lähdettä. Älä käytä ensimmäisen version esimerkkidataa.

## Tekoälykerros (vaihe 1)
1. Claude hakee julkiset tiedot (kunnan sivut, Yle, Kaleva, STT Info, viranomaiset, hankkeen toteuttajan tiedotteet).
2. Claude päivittää kunnan JSON-tiedoston: uudet tiedot, muuttuneet vaiheet, uudet lähteet ja päiväykset, `paivitetty`-kenttä.
3. Muutos tehdään pull requestina, jonka kuvauksessa on lista muutoksista lähteineen.
4. Hannu tai Dimma hyväksyy. Vasta yhdistetty muutos julkaistaan.

Uusi kunta: kopioi olemassa oleva tiedosto, vaihda tunnisteet ja täytä tiedot lähteineen.

## Datalähde: tiedostot tai tietokanta (Bistek)
Vaiheen 2 datakerros on Supabasessa (repo `Boostaamo/suurhankkisiin_data`). Ympäristömuuttuja `DATALAHDE` valitsee lähteen:
- `tiedostot` (oletus): sivusto lukee `content/alueet/` ja `content/uutiset.json` kuten yllä.
- `tietokanta`: ennen buildia `scripts/hae-data.mjs` hakee julkaistut tiedot Supabasen julkisista näkymistä (`julkiset_*`) julkisella avaimella ja kirjoittaa ne kansioon `.data/` samassa muodossa. Sivupohjat, osoitteet ja GA4 eivät muutu. Jos haku epäonnistuu tai data on tyhjä, build pysähtyy.

Tarvittavat muuttujat (Vercel): `DATALAHDE=tietokanta`, `SUPABASE_URL` (on jo) ja `SUPABASE_PUBLISHABLE_KEY` (tai `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Avoimia tietoja ei tule tietokannasta lainkaan, eikä niitä näytetty ennenkään.

Siirtymän aikana JSON-tiedostot ja vaiheen 1 PR-hyväksyntä jatkuvat. Tuotanto lukee tietokantaa (Hannu 24.11.2026), joten `TUONTI_JSONISTA=kylla` (vain Production) vie jokaisessa buildissa `content/`-kansion tietokantaan ennen hakua palvelinavaimella. JSON-tiedostot ovat siis edelleen päälähde, kunnes automaattinen nouto korvaa ajastetut tehtävät; silloin muuttuja poistetaan.

## Vaihe 2 (Bistek)
Automaattinen RSS-nouto ja tekoälypisteytys palvelimella, kilpailutusten hallinta tilaajille, yritysprofiilit ja PRO-maksut.
