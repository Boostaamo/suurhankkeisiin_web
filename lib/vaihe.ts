// Selaimessakin käytettävät apurit (ei tiedostojärjestelmää).
export type HankeRivi = {
  nimi: string; polku: string; kunta: string; kuntaPolku: string; maakunta: string; maakunta_tunniste: string;
  tyyppi: string; vaihe: string; investointi_meur: number | null; tiivistelma: string;
  // Kartta, syke ja vertailu: kunnan ja hankkeen tunnisteet, uutisia kuukausittain (12 kk, vanhin ensin) ja viimeisen 7 päivän aikana.
  kunta_tunniste: string; tunniste: string; syke: number[]; uusia: number;
};
// Toiminnassa olevat ja perutut hankkeet pysyvät rekisterissä (elinkaari- ja huoltopalvelut), mutta niitä ei näytetä aktiivisina (Hannu 25.11.2026).
export const EI_AKTIIVISET = ["Toiminnassa", "Peruttu"];
export const aktiivinen = (vaihe?: string | null) => !EI_AKTIIVISET.includes(vaihe ?? "");
export const vaiheSlug = (v: string) => v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z]+/g, "-");
