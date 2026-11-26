// Suomen kuntakartta: content/kartta.json (generoitu, ks. docs/kartta.md) ja hankkeiden kunnat datakerroksesta.
import raw from "@/content/kartta.json";
import { kaikkiKunnat, maakunnat } from "@/lib/alueet";

export type KarttaKunta = { nimi: string; d: string; piste: [number, number]; rajaus: [number, number, number, number] };
export type KarttaData = { leveys: number; korkeus: number; lahteet: string; kunnat: KarttaKunta[] };
export const kartta = () => raw as unknown as KarttaData;

// Kunnan nimi -> maakunnan tunniste kaikille kunnille niissä maakunnissa, joissa on hankkeita (tarkennus ja klikattavuus).
export const kuntienMaakunnat = (): Record<string, string> => {
  const nakyvat = new Set(maakunnat().map((m) => m.tunniste));
  return Object.fromEntries(kaikkiKunnat().filter((k) => nakyvat.has(k.maakunta_tunniste)).map((k) => [k.kunta, k.maakunta_tunniste]));
};

export const KARTTA_LAHDE = "Kartta: Tilastokeskus, kuntarajat; Maanmittauslaitos, Maastotietokanta (kunnanhallintokeskukset). Lisenssi CC BY 4.0. Rajoja on yksinkertaistettu.";
