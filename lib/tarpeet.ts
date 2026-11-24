// Hankkeissa tarvittava osaaminen ja palvelut: content/tarpeet.json. Hankekohtaiset tarpeet lähteineen ja hanketyypin yleiset tarpeet.
import raw from "@/content/tarpeet.json";
import type { Tila } from "@/lib/alueet";

export type Tarve = { tarve: string; toimiala: string | null; tila?: Tila; lahde?: string; pvm?: string; vaihe?: string };
export type TyypinTarpeet = { lahde: string; pvm: string; tarpeet: Tarve[] };

export const hankkeenTarpeet = (kunta: string, hanke: string): Tarve[] =>
  ((raw.hankkeittain as Record<string, Tarve[]>)[`${kunta}/${hanke}`] ?? []).filter((t) => t.tila !== "avoin");

export const tyypinTarpeet = (tyyppi?: string): TyypinTarpeet | null =>
  (tyyppi && (raw.tyypeittain as Record<string, TyypinTarpeet>)[tyyppi]) || null;

export function kaikkiTarpeet(): { avain: string; tarve: Tarve }[] {
  return Object.entries(raw.hankkeittain as Record<string, Tarve[]>).flatMap(([avain, l]) => l.map((tarve) => ({ avain, tarve })));
}
