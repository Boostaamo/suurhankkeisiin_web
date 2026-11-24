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

## Vaihe 2 (Bistek)
Automaattinen RSS-nouto ja tekoälypisteytys palvelimella, kilpailutusten hallinta tilaajille, yritysprofiilit ja PRO-maksut.

## Hankkeen yhteenveto ja uutisaikajana
Hankesivun tilannekuvassa on tekoälyn koostama yhteenveto ja hankkeeseen kytketyt uutiset aikajärjestyksessä (vanhin ensin).
- Uutinen kytketään hankkeeseen `content/uutiset.json`-kentällä `hankkeet`: lista muodossa `<kunnan tunniste>/<hankkeen tunniste>`, esim. `muhos/datakeskus`. Uutinen voi koskea useaa hanketta. Jos uutinen koskee vain kuntaa yleisesti, jätä lista tyhjäksi.
- Yhteenveto on tiedostossa `content/yhteenvedot.json` samalla avaimella: `pvm` ja `teksti` (1–3 kappaletta). Kirjoita se vain hankkeen datakerroksen tiedoista ja kytketyistä uutisista. Ei uusia väitteitä, ei lainauksia; arviot sanotaan arvioina.
- Päivitä yhteenveto aina, kun hankkeeseen kytketään uusi uutinen tai sen tiedot muuttuvat. Muutos kuuluu samaan pull requestiin.
- Hanke ilman yhteenvetoa näyttää vain tiedot. Jos hankkeen tunniste muuttuu, päivitä avaimet molempiin tiedostoihin.
