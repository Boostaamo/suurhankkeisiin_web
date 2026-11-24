# Supabase ja GA4: käyttöönotto (Suurhankkeisiin.fi)

Tila: luonnos | Versio: v0.1 | Pvm: 2026-11-24

Lomakkeet (yrityksen ilmoittautuminen ja kunnan yhteydenotto) tallentuvat Supabaseen. Mittaus kulkee GA4:llä vasta evästesuostumuksen jälkeen. Supabasen ja Vercelin käyttöliittymät ovat vain englanniksi, joten valikkojen nimet ovat alla englanniksi. GA4:n valikot ovat suomenkielisen version mukaiset.

## 1. Supabase-projekti (noin 10 min)

1. Kirjaudu osoitteessa supabase.com. Valitse organisaatio, jonka alla ovat konsernin muut sivustot (sama kuin GFC:llä ja kartoitus.boostaamo.fi:llä).
2. **New project**
   - Name: `suurhankkeisiin`
   - Database password: anna Supabasen luoda salasana ja tallenna se salasanojen hallintaan. Sitä ei tarvita sivustossa.
   - Region: **Central EU (Frankfurt)** tai **North EU (Stockholm)**. Kumpikin on EU:ssa, kuten tietosuojaseloste lupaa.
   - Plan: Free riittää alkuun.
3. Odota, että projekti on valmis (1–2 min).

## 2. Taulu ja säilytysaika

1. Vasemmasta valikosta **Database → Extensions**. Hae `pg_cron` ja kytke se päälle.
2. **SQL Editor → New query**. Liitä koko tiedosto `supabase/migrations/20261124_liidit.sql` repo­sta ja paina **Run**.
3. Tarkista **Table Editor**: taulu `liidit` on luotu, ja siinä on sarakkeet `maakunta`, `kunta` ja `hanke`. RLS on päällä, mikä on oikein: vain sivuston palvelinavain pääsee tauluun.

Migraatio luo myös näkymän `ilmoittautumiset_alueittain` (ilmoittautumiset kuukausittain maakunnan, kunnan ja hankkeen mukaan ilman henkilötietoja) ja yöajon, joka poistaa yli 24 kk vanhat rivit.

## 3. Avaimet talteen

**Project Settings → API Keys** (vanhemmissa projekteissa **Project Settings → API**):

- **Project URL**, esim. `https://abcd1234.supabase.co` → muuttuja `SUPABASE_URL`
- **Secret key** (`sb_secret_…`) tai vanha **service_role**-avain → muuttuja `SUPABASE_SERVICE_ROLE_KEY`

Salaista avainta ei saa laittaa repoon, sähköpostiin eikä chattiin. Se kuuluu vain Vercelin ympäristömuuttujiin. Julkista anon- tai publishable-avainta ei tarvita.

## 4. Vercel (kun projekti on luotu)

1. Vercelissä tiimi **dimmaanalytics-projects → Add New → Project → Import** `Boostaamo/suurhankkeisiin_web`. Valitse Production Branch -kohtaan toistaiseksi `claude/project-thread-341na5`, tai luodaan `main`, kun ensimmäinen versio hyväksytään.
2. **Settings → Environment Variables**. Lisää kaikkiin ympäristöihin (Production, Preview) ja merkitse salaiset **Sensitive**:
   - `NEXT_PUBLIC_SITE_URL` = `https://suurhankkeisiin.fi`
   - `SUPABASE_URL` = Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = Secret key (Sensitive)
   - `NEXT_PUBLIC_GA_ID` = GA4-mittaustunnus (kohta 5)
3. Muuttujien jälkeen **Deployments → uusin → Redeploy**, jotta arvot tulevat käyttöön.
4. Testi: lähetä esikatselussa ilmoittautuminen. Rivin pitää näkyä Supabasessa taulussa `liidit`, ja sarakkeessa `esikatselu` on `true` (esikatselurivit eivät näy raportointinäkymässä).

Domainiin (suurhankkeisiin.fi) ja DNS:ään ei kosketa ennen erillistä päätöstä julkaisusta.

## 5. GA4

1. Google Analytics → **Järjestelmänvalvoja → Luo → Kiinteistö**. Nimi `Suurhankkeisiin.fi`, aikavyöhyke Suomi, valuutta euro.
2. **Datavirrat → Verkko**, osoite `https://suurhankkeisiin.fi`. Kopioi **Mittaustunnus** (`G-…`) Vercelin muuttujaan `NEXT_PUBLIC_GA_ID`.
3. **Järjestelmänvalvoja → Datan säilyttäminen**: tapahtumadatan säilytys **14 kuukautta** (konsernin linjaus).
4. **Järjestelmänvalvoja → Muokatut määritelmät → Luo muokattu ulottuvuus**, laajuus Tapahtuma. Luo kolme:
   - Ulottuvuuden nimi `Maakunta`, tapahtumaparametri `maakunta`
   - `Kunta`, parametri `kunta`
   - `Hanke`, parametri `hanke`
   Halutessasi myös `Taso` (parametri `taso`) ja `Lähde` (parametri `lahde`).
5. **Järjestelmänvalvoja → Tapahtumat**: kun tapahtumat näkyvät (vuorokauden sisällä ensimmäisestä käynnistä), merkitse **avaintapahtumaksi** `sign_up` (yrityksen ilmoittautuminen, päämittari) ja `generate_lead` (kunnan yhteydenotto).

Sivusto lähettää tapahtumat `alue_nakyma` (maakunta-, kunta- tai hankesivun katselu), `sign_up` ja `generate_lead`, ja jokaisessa ovat parametrit `maakunta`, `kunta` ja `hanke`. Näillä saa raportin ilmoittautumisista ja käynneistä hankkeittain, kunnittain ja maakunnittain (**Tutki → Vapaamuotoinen**, ulottuvuudet Maakunta, Kunta ja Hanke).
