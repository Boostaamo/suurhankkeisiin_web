import { hankePolku, hankeRivit, kunnat } from "@/lib/alueet";
import { hankkeenTarpeet, tyypinTarpeet } from "@/lib/tarpeet";
import { hankkeenUutiset } from "@/lib/uutiset";

// Hankkeiden vertailun data (/vertailu). Syntyy buildissa; ladataan selaimeen vasta vertailusivulla.
export const dynamic = "force-static";

export function GET() {
  const rivit = new Map(hankeRivit().map((r) => [r.polku, r]));
  return Response.json(
    kunnat().flatMap((k) =>
      k.hankkeet.map((h) => {
        const polku = hankePolku(k, h);
        const uu = hankkeenUutiset(k.tunniste, h.tunniste);
        return {
          polku, nimi: h.nimi, kunta: k.kunta, maakunta: k.maakunta, tyyppi: h.tyyppi ?? "", vaihe: h.vaihe_luokka ?? "Ei tietoa",
          investointi_meur: h.investointi_meur ?? null, tiivistelma: h.tiivistelma,
          tiedot: h.tiedot.filter((t) => t.tila !== "avoin").map((t) => ({ otsikko: t.otsikko, arvo: t.arvo, tila: t.tila, lahde: t.lahde ?? null })),
          toimialat: [...new Set([...hankkeenTarpeet(k.tunniste, h.tunniste), ...(tyypinTarpeet(h.tyyppi)?.tarpeet ?? [])].map((t) => t.toimiala).filter(Boolean))],
          uutisia: uu.length, viimeisin: uu.at(-1)?.pvm ?? null, syke: rivit.get(polku)?.syke ?? [],
        };
      }),
    ),
  );
}
