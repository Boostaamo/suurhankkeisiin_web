// Kuntien suurhankeyhteyshenkilöt: content/yhteyshenkilot.json (julkaistaan vain luvalla).
// Luetaan aina repon content-kansiosta, ei datakerroksen tietokannasta.
import fs from "node:fs";
import path from "node:path";

export type Yhteyshenkilo = { nimi: string; tehtava?: string; sahkoposti?: string; puhelin?: string; lupa: string };

export function yhteyshenkilot(kunta: string): Yhteyshenkilo[] {
  const tiedosto = path.join(process.cwd(), "content", "yhteyshenkilot.json");
  if (!fs.existsSync(tiedosto)) return [];
  const data = JSON.parse(fs.readFileSync(tiedosto, "utf8")) as Record<string, unknown>;
  const lista = data[kunta];
  return Array.isArray(lista) ? (lista as Yhteyshenkilo[]).filter((h) => h.nimi && h.lupa) : [];
}
