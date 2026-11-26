import type { Metadata } from "next";
import { hankeRivit, pvm } from "@/lib/alueet";
import { aktiivinen } from "@/lib/vaihe";
import { KARTTA_LAHDE, kartta, kuntienMaakunnat } from "@/lib/kartta";
import { tunnusluvut } from "@/lib/tunnusluvut";
import { uutiset } from "@/lib/uutiset";
import Tilannehuone from "@/components/Tilannehuone";

// Koko näytön esitysnäkymä messuille ja tilaisuuksiin. Ei valikossa eikä hakukoneissa.
export const metadata: Metadata = { title: "Tilannehuone", robots: { index: false, follow: false } };

export default function TilannehuoneSivu() {
  const r = hankeRivit().filter((x) => aktiivinen(x.vaihe));
  const raja = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  const kuumat = [...r]
    .map((x) => ({ x, n: uutiset(undefined, 10000).filter((u) => u.pvm >= raja && u.hankkeet?.includes(`${x.kunta_tunniste}/${x.tunniste}`)).length }))
    .filter((a) => a.n)
    .sort((a, b) => b.n - a.n)
    .slice(0, 6)
    .map((a) => ({ nimi: a.x.nimi, kunta: a.x.kunta, vaihe: a.x.vaihe, n: a.n, syke: a.x.syke }));
  return (
    <Tilannehuone
      luvut={tunnusluvut()} rivit={r} pohja={kartta()} maakunnat={kuntienMaakunnat()} lahde={KARTTA_LAHDE}
      uutiset={uutiset(undefined, 7).map((u) => ({ otsikko: u.otsikko, ingressi: u.ingressi, julkaisija: u.julkaisija, pvm: pvm(u.pvm), kunta: u.kunta ?? "" }))}
      kuumat={kuumat}
    />
  );
}
