# web-pohja: ohjeet Claudelle

Tämä on Dimman verkkosivustopohja (Next.js, App Router, TypeScript), jolla Dimma tuottaa asiakassivustot ja konsernin yhtiöiden sivustot. Projekti etenee Dimman verkkosivuprosessin mukaan (taito `dimma-verkkosivu-prosessi`, repo `dimma`). Sisältö on Markdown-tiedostoina, eikä sisällön muokkaus vaadi koodia.

## Säännöt
- Sisältö muokataan kansiossa `content/` (sivut: `content/pages/*.md`, asetukset: `content/site.json`). Älä kirjoita sisältöä koodiin.
- Tyylit ja värit ovat CSS-muuttujina tiedostossa `app/globals.css`. Vaihda design systemin arvot siellä.
- Älä lisää riippuvuuksia ilman perustetta. Pidä sivusto staattisena, kun mahdollista.
- Älä koskaan commitoi salaisuuksia tai henkilötietoja. Käytä `.env.local` (paikallinen) ja Vercelin ympäristömuuttujia. Vain `.env.example` on repossa.
- Lomakkeen liidit lähtevät reitille `app/api/lead/route.ts` ja sieltä `LEAD_WEBHOOK_URL`-osoitteeseen. Älä tallenna liidejä repoon.
- Analytiikka latautuu vain suostumuksen jälkeen. Älä lisää seurantaskriptejä ilman suostumuksen tarkistusta.
- Aja `npm run build` ennen jokaista pushia. Älä pushaa rikkinäistä koodia.
- Työskentele haarassa (`feature/...`), älä suoraan `main`-haaraan. `main` julkaistaan tuotantoon.
- Esikatselut eivät saa näkyä hakukoneissa (tämä on jo päällä: robots ja noindex).
- Tekstit: asiakassivustolla sävy ja sanasto hyväksytyn briefin mukaan; konsernin yhtiösivustolla yhtiön repon `context/tyyli.md` ja `context/sanasto.md`. Älä keksi asiakascaseja, lukuja tai referenssejä.

## Rajat
- Räätälöity taustajärjestelmä, kirjautuminen, maksut ja integraatiot tavallista lomaketta ja analytiikkaa laajemmin kuuluvat Bistekille. Pysäytä työ ja kerro, jos tarve ylittää nämä.

## Suurhankkeisiin.fi: lisäohjeet

Sivusto: Suurhankkeisiin.fi (Dimman palvelu) | Domain: suurhankkeisiin.fi (Dimman omistama) | Rekisteri: boostaamo-core/verkkosivut/sivustot.md
Tila: luonnos | Versio: v0.1 | Pvm: 2026-11-24 | Hyväksyjä: Hannu
Pohja: gfc_web (Supabase-malli). Lähtöaineisto: Hannun ensimmäinen versio (HTML) ja brief v0.2 projektin tiedostoissa `suurhankkeisiin/`.

### Lähteet
- Tekstit: Hannun ensimmäinen versio 24.11.2026 ja brief. Jos teksti puuttuu, jätä <täydennä> ja kerro, mitä tarvitaan. Älä kirjoita markkinointiviestejä itse.
- Hanketiedot: datakerros `content/alueet/<kunta>.json`, ohje `docs/datakerros.md`. Jokaisella tiedolla lähde, päiväys ja tila (todennettu, arvio, avoin). Ei tietoa ilman lähdettä.
- Linjaukset: boostaamo-core/verkkosivut/linjaukset.md. Ekosysteemilinkit: boostaamo-core/verkkosivut/ekosysteemi/ekosysteemi.json → content/site.json (Suurhankkeisiin.fi Dimman alla).

### Säännöt
- Konversiopiste: yrityksen ilmoittautuminen sivustolle (`sign_up`, method=ilmoittautuminen). Toissijainen: kuntien yhteydenotto (`generate_lead`, lahde=aluekumppanuus).
- GA4-mittaustunnus G-92TFFQSY4Q tiedostossa lib/ga.ts (julkinen tunnus; Vercelin NEXT_PUBLIC_GA_ID ohittaa).
- Mittaus hanke-, kunta- ja maakuntatasolla: sivut /hankkeet/<maakunta>/<kunta>/<hanke>, tapahtumaparametrit `maakunta`, `kunta`, `hanke` (GA4-mukautetut ulottuvuudet) ja samat sarakkeet Supabasessa.
- Pilottialue: Muhos (Hannu 24.11.2026).
- Hinnat julkaistaan (Perusnäkyvyys 0 €, PRO 99 €/kk alv 0 %, Aluekumppanuus pyynnöstä); tarkennetaan tarvittaessa tuotepäällikön kanssa.
- Rekisterinpitäjä Kriha Invest Oy (Dimma). Tietosuojaosoite hannu@boostaamo.fi, liidit 24 kk, GA 14 kk.
- Alalaidassa "Palvelun tarjoaa Dimma", "A Boostaamo Company" ja ekosysteemilinkit.
- Ulkoasu: ensimmäisen version slate + amber (#0F172A, #F59E0B), Inter. Tekstilogo "Suurhankkeisiin.fi".
- Liidit: Supabase (EU), oma projekti (supabase/migrations). Ei Upstashia.
- Ei keksittyjä hankkeita, yrityksiä, henkilöitä, lukuja, caseja tai lupauksia. Ensimmäisen version esimerkkidataa ei käytetä.
- Yritysten nimiä ei julkaista sivustolla ilman niiden lupaa.
- Ei salaisuuksia, .env-tiedostoja, liidejä, henkilötietoja eikä asiakasdataa repoon.
- Domainiin, DNS:ään ja Vercelin tuotantoasetuksiin ei kosketa ilman Hannun erillistä lupaa. Älä yhdistä main-haaraan: Hannu hyväksyy ja julkaisee.
- Vaihe 2 (Bistek): yritysprofiilit ja kirjautuminen, PRO-maksut, kilpailutusten hallinta, automaattinen RSS-/tekoälyuutisvirta palvelimella. Pysäytä ja ehdota Bistekiä.
