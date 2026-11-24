// Hankkeen tilannekuvan yhteenveto: content/yhteenvedot.json. Tekoäly kirjoittaa datakerroksen ja kytkettyjen uutisten pohjalta, ihminen hyväksyy PR:ssä.
import raw from "@/content/yhteenvedot.json";

export type Yhteenveto = { pvm: string; teksti: string[] };

export function yhteenveto(kunta: string, hanke: string): Yhteenveto | null {
  return ((raw.yhteenvedot as Record<string, Yhteenveto>)[`${kunta}/${hanke}`]) ?? null;
}
