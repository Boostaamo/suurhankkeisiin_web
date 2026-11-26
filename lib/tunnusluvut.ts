// Etusivun ja tilannehuoneen tunnusluvut. Kaikki lasketaan datakerroksesta; summat vain lähteistetyistä investoinneista.
import { hankeRivit, kunnat, maakunnat } from "@/lib/alueet";
import { aktiivinen } from "@/lib/vaihe";
import { uutiset } from "@/lib/uutiset";

export function tunnusluvut() {
  const r = hankeRivit().filter((x) => aktiivinen(x.vaihe));
  const summalliset = r.filter((x) => x.investointi_meur != null);
  const raja30 = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  return {
    hankkeita: r.length,
    rakenteilla: r.filter((x) => x.vaihe === "Rakenteilla").length,
    kuntia: kunnat().filter((k) => k.hankkeet.some((h) => aktiivinen(h.vaihe_luokka))).length,
    maakuntia: maakunnat().length,
    investoinnitMrd: summalliset.reduce((a, x) => a + (x.investointi_meur ?? 0), 0) / 1000,
    summallisia: summalliset.length,
    uutisia30: uutiset(undefined, 10000).filter((u) => u.pvm >= raja30).length,
  };
}
