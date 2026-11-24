// Selaimessakin käytettävät apurit (ei tiedostojärjestelmää).
export type HankeRivi = {
  nimi: string; polku: string; kunta: string; kuntaPolku: string; maakunta: string; maakunta_tunniste: string;
  tyyppi: string; vaihe: string; investointi_meur: number | null; tiivistelma: string;
};
export const vaiheSlug = (v: string) => v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z]+/g, "-");
