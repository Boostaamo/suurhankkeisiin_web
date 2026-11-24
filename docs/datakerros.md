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

## Hankkeen yhteenveto ja uutisaikajana
Hankesivun tilannekuvassa on tekoälyn koostama yhteenveto ja hankkeeseen kytketyt uutiset aikajärjestyksessä (vanhin ensin).
- Uutinen kytketään hankkeeseen `content/uutiset.json`-kentällä `hankkeet`: lista muodossa `<kunnan tunniste>/<hankkeen tunniste>`, esim. `muhos/datakeskus`. Uutinen voi koskea useaa hanketta. Jos uutinen koskee vain kuntaa yleisesti, jätä lista tyhjäksi.
- Yhteenveto on tiedostossa `content/yhteenvedot.json` samalla avaimella: `pvm` ja `teksti` (1–3 kappaletta). Kirjoita se vain hankkeen datakerroksen tiedoista ja kytketyistä uutisista. Ei uusia väitteitä, ei lainauksia; arviot sanotaan arvioina.
- Päivitä yhteenveto aina, kun hankkeeseen kytketään uusi uutinen tai sen tiedot muuttuvat. Muutos kuuluu samaan pull requestiin.
- Hanke ilman yhteenvetoa näyttää vain tiedot. Jos hankkeen tunniste muuttuu, päivitä avaimet molempiin tiedostoihin.
- Uutisten määrä: `content/uutiset.json`-tiedostossa pidetään enintään 40 uusinta hankkeisiin kytkemätöntä uutista. Hankkeeseen kytkettyjä uutisia (`hankkeet` ei tyhjä) ei poisteta, jotta hankkeiden aikajanat säilyvät kokonaisina (Hannu 24.11.2026).

## Tarvittava osaaminen ja palvelut
Hankesivulla on osio "Tarvittava osaaminen ja palvelut" (tiedosto `content/tarpeet.json`).
- `hankkeittain` (avain `<kunta>/<hanke>`): vain tarpeet, jotka lähde sanoo suoraan tästä hankkeesta (esim. urakat, kilpailutukset, työvoima-arviot, toteuttajan kumppanihaku). Kentät `tarve`, `toimiala`, `tila`, `lahde`, `pvm`.
- `tyypeittain` (avain hanketyyppi, esim. `Datakeskus`): hanketyypin yleiset tarpeet lähteestä, joka puhuu tyypistä yleisesti. Sivulla merkintä "eivät tämän hankkeen tilaajan ilmoittamia".
- `toimiala` on jokin `lib/toimialat.ts`-luokista (sama kuin ilmoittautumislomakkeessa) tai `null`.
- Viikkopäivitys täydentää tarpeita: etsi hankkeen toteuttajan, kunnan ja Hilman tiedoista urakka- ja palvelutarpeita, ja lisää muille hanketyypeille (Energia, Vety ja e-polttoaineet, Kaivos, Teollisuus, Biojalostus ja metsä, Infra) yleiset tarpeet lähteineen.

## Haku
Yläpalkin hakukenttä ehdottaa kirjoitettaessa hankkeita, kuntia, maakuntia, osaamistarpeita, uutisia ja sivuja; Enter avaa sivun `/haku?q=`. Indeksi `/hakuindeksi.json` kootaan buildissa kaikesta yllä olevasta (lib/haku.ts), joten uusi sisältö tulee hakuun automaattisesti. Analytiikka (vain suostumuksella): `search` (search_term) ja `select_content` (content_type=haku).

## Hankkeen eteneminen (vaiheaikajana)
Hankesivun osio "Hankkeen eteneminen ja tarpeet" näyttää vakiovaiheet (Suunnittelu ja kaavoitus, Luvitus ja YVA, Valmistelevat työt, Investointipäätös, Rakentaminen, Käyttö) ja niihin kytketyt tarpeet.
- Tiedosto `content/aikajanat.json`. Hankekohtaisesti (avain `<kunta>/<hanke>`) jokaiselle vaiheelle `tila` (tehty, kaynnissa, keskeytetty, tuleva) ja `tapahtumat` (pvm, teksti, lahde, tarvittaessa `arvio: true`). Ilman hankekohtaista merkintää vaihe päätellään `vaihe_luokka`-kentästä, ja sivulla kerrotaan, että vaihe on päätelty.
- Tarpeet kytketään vaiheeseen `content/tarpeet.json`-kentällä `vaihe` (sekä hankekohtaiset että hanketyypin yleiset).
- Uutisseuranta lisää tapahtuman, kun uutinen muuttaa vaihetta (YVA, lupa, kaava, keskeytys, investointipäätös, rakentamisen alku). Viikkopäivitys täydentää aikajanoja hanke kerrallaan.
- Vaiheet ovat avattavia (käynnissä ja keskeytetty auki oletuksena), ja niillä on Avaa kaikki / Sulje kaikki -painikkeet. "Tarjoa osaamistasi tähän vaiheeseen" vie ilmoittautumiseen, ja vaihe tallentuu liidin vastauksiin (`vastaukset.vaihe`). Lomakkeella kysytään yrityksen verkkosivua (`vastaukset.verkkosivu`), josta palvelut kootaan profiiliin; automaattinen sivuanalyysi palvelimella kuuluu vaiheeseen 2 (Bistek).
