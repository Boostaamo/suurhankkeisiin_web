-- Suurhankkeisiin.fi: yritysten ilmoittautumiset ja kuntien yhteydenotot.
-- Aja Suurhankkeisiin.fi:n omassa Supabase-projektissa (EU-alue): SQL Editor -> liitä -> Run.
-- Rekisterinpitäjä Kriha Invest Oy (Dimma). Säilytys 24 kk (tietosuojaseloste).

create table if not exists public.liidit (
  id bigint generated always as identity primary key,
  luotu timestamptz not null default now(),
  lahde text not null check (lahde in ('ilmoittautuminen', 'aluekumppanuus')),
  nimi text not null check (char_length(nimi) between 1 and 200),
  sahkoposti text not null default '' check (char_length(sahkoposti) <= 200),
  puhelin text not null default '' check (char_length(puhelin) <= 60),
  yritys text not null default '' check (char_length(yritys) <= 200),
  tehtava text not null default '' check (char_length(tehtava) <= 200),
  viesti text not null default '' check (char_length(viesti) <= 4000),
  vastaukset jsonb,
  -- Mittaus hanke-, kunta- ja maakuntatasolla
  maakunta text not null default '' check (char_length(maakunta) <= 100),
  kunta text not null default '' check (char_length(kunta) <= 100),
  hanke text not null default '' check (char_length(hanke) <= 100),
  suostumus boolean not null default false,
  sivu text not null default '',
  lahde_sivu text not null default '',
  viittaaja text not null default '',
  utm jsonb,
  esikatselu boolean not null default false
);

create index if not exists liidit_luotu on public.liidit (luotu);
create index if not exists liidit_lahde_luotu on public.liidit (lahde, luotu);
create index if not exists liidit_alue on public.liidit (maakunta, kunta, hanke);

-- Vain palvelinavain (service_role) pääsee tauluun. Julkinen anon-avain ei näe eikä kirjoita mitään.
alter table public.liidit enable row level security;
revoke all on public.liidit from anon, authenticated;

-- Raportointinäkymä: ilmoittautumiset tasoittain (ei henkilötietoja).
create or replace view public.ilmoittautumiset_alueittain with (security_invoker = true) as
  select date_trunc('month', luotu) as kuukausi, maakunta, kunta, hanke, lahde, count(*) as maara
  from public.liidit where not esikatselu
  group by 1, 2, 3, 4, 5;
revoke all on public.ilmoittautumiset_alueittain from anon, authenticated;

-- Säilytys 24 kk: pg_cron poistaa vanhat rivit joka yö klo 3 (UTC).
-- Ota ensin käyttöön: Database -> Extensions -> pg_cron.
create extension if not exists pg_cron;
select cron.schedule(
  'liidit-sailytys',
  '0 3 * * *',
  $$delete from public.liidit where luotu < now() - interval '24 months'$$
);
