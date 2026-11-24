// Hankkeen etenemisen aikajana: content/aikajanat.json + vaiheisiin kytketyt tarpeet (content/tarpeet.json).
import raw from "@/content/aikajanat.json";
import type { Hanke, Kunta } from "@/lib/alueet";
import { hankkeenTarpeet, tyypinTarpeet, type Tarve } from "@/lib/tarpeet";

export type VaiheTila = "tehty" | "kaynnissa" | "keskeytetty" | "tuleva";
export type Tapahtuma = { pvm: string; teksti: string; lahde?: string; lahde_pvm?: string; arvio?: boolean };
export type AikajanaVaihe = {
  id: string; nimi: string; kuvaus: string; tila: VaiheTila; tapahtumat: Tapahtuma[];
  tarpeet: Tarve[]; yleiset: Tarve[];
};

type Data = {
  vaiheet: { id: string; nimi: string; kuvaus: string }[];
  vaihe_luokasta: Record<string, string>;
  hankkeittain: Record<string, { vaiheet: Record<string, { tila: VaiheTila; tapahtumat: Tapahtuma[] }> }>;
};
const data = raw as unknown as Data;

export const TILA_NIMI: Record<VaiheTila, string> = { tehty: "Tehty", kaynnissa: "Käynnissä", keskeytetty: "Keskeytetty", tuleva: "Tulossa" };

// Ilman hankekohtaista merkintää tila johdetaan vaihe_luokasta: aiemmat tehty, nykyinen käynnissä, myöhemmät tulossa.
export function aikajana(k: Kunta, h: Hanke): { vaiheet: AikajanaVaihe[]; lahteistetty: boolean } {
  const oma = data.hankkeittain[`${k.tunniste}/${h.tunniste}`];
  const nyky = data.vaiheet.findIndex((v) => v.id === data.vaihe_luokasta[h.vaihe_luokka ?? ""]);
  const tarpeet = hankkeenTarpeet(k.tunniste, h.tunniste);
  const yleiset = tyypinTarpeet(h.tyyppi)?.tarpeet ?? [];
  const vaiheet = data.vaiheet.map((v, i) => {
    const o = oma?.vaiheet[v.id];
    const tila: VaiheTila = o?.tila ?? (nyky < 0 ? "tuleva" : i < nyky ? "tehty" : i === nyky ? "kaynnissa" : "tuleva");
    return {
      ...v, tila,
      tapahtumat: [...(o?.tapahtumat ?? [])].sort((a, b) => a.pvm.localeCompare(b.pvm)),
      tarpeet: tarpeet.filter((t) => t.vaihe === v.id),
      yleiset: yleiset.filter((t) => t.vaihe === v.id),
    };
  });
  // Johdetussa aikajanassa "Valmistelevat työt" ja "Investointipäätös" ovat usein samassa vaiheessa; ei päätellä niistä enempää.
  return { vaiheet, lahteistetty: Boolean(oma) };
}
