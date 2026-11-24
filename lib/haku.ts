// Sivuston haku: indeksi kootaan buildissa datakerroksesta, uutisista, tarpeista ja sisältösivuista (app/hakuindeksi.json).
import { kunnat, maakunnat, kuntaPolku, hankePolku, pvm } from "@/lib/alueet";
import { listSlugs, getPage } from "@/lib/content";
import { uutiset } from "@/lib/uutiset";
import { kaikkiTarpeet, hankkeenTarpeet, tyypinTarpeet } from "@/lib/tarpeet";
import { yhteenveto } from "@/lib/yhteenveto";
import type { HakuKohde } from "@/lib/hakuapu";

export function hakuindeksi(): HakuKohde[] {
  const out: HakuKohde[] = [];
  const ks = kunnat();
  for (const m of maakunnat()) {
    out.push({ laji: "Maakunta", otsikko: m.nimi, kuvaus: `${m.kunnat.reduce((s, k) => s + k.hankkeet.length, 0)} hanketta, ${m.kunnat.length} kuntaa`, url: `/hankkeet/${m.tunniste}`, sanat: m.kunnat.map((k) => k.kunta).join(" ") });
  }
  for (const k of ks) {
    out.push({ laji: "Kunta", otsikko: k.kunta, kuvaus: `${k.maakunta} · ${k.hankkeet.length} hanketta`, url: kuntaPolku(k), sanat: `${k.maakunta} ${k.seutukunta ?? ""} ${k.hankkeet.map((h) => h.nimi).join(" ")}` });
    for (const h of k.hankkeet) {
      const yv = yhteenveto(k.tunniste, h.tunniste);
      out.push({
        laji: "Hanke", otsikko: h.nimi, kuvaus: `${k.kunta} · ${h.tyyppi ?? ""}${h.vaihe_luokka ? ` · ${h.vaihe_luokka}` : ""}`, url: hankePolku(k, h),
        sanat: `${k.kunta} ${k.maakunta} ${h.tyyppi ?? ""} ${h.vaihe_luokka ?? ""} ${h.tiivistelma} ${h.tiedot.filter((t) => t.tila !== "avoin").map((t) => t.arvo).join(" ")} ${yv?.teksti.join(" ") ?? ""} ${[...hankkeenTarpeet(k.tunniste, h.tunniste), ...(tyypinTarpeet(h.tyyppi)?.tarpeet ?? [])].map((t) => `${t.tarve} ${t.toimiala ?? ""}`).join(" ")}`,
      });
    }
  }
  const hankeUrl = (avain: string) => {
    const [kt, ht] = avain.split("/");
    const k = ks.find((x) => x.tunniste === kt);
    const h = k?.hankkeet.find((x) => x.tunniste === ht);
    return k && h ? { url: `${hankePolku(k, h)}#tarpeet`, nimi: `${h.nimi}, ${k.kunta}` } : null;
  };
  for (const { avain, tarve } of kaikkiTarpeet()) {
    const h = hankeUrl(avain);
    if (h) out.push({ laji: "Osaamistarve", otsikko: tarve.tarve, kuvaus: h.nimi, url: h.url, sanat: tarve.toimiala ?? "" });
  }
  for (const u of uutiset(undefined, 1000)) {
    out.push({ laji: "Uutinen", otsikko: u.otsikko, kuvaus: `${pvm(u.pvm)} · ${u.julkaisija}`, url: u.url, sanat: `${u.ingressi} ${u.kunta ?? ""} ${u.maakunta ?? ""}`, ulkoinen: true });
  }
  for (const slug of listSlugs()) {
    const p = getPage(slug);
    if (!p || p.meta.noindex || slug.includes("kiitos")) continue;
    out.push({ laji: "Sivu", otsikko: p.meta.title, kuvaus: p.meta.description ?? "", url: `/${slug.join("/")}`, sanat: p.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 2000) });
  }
  out.push({ laji: "Sivu", otsikko: "Uutiset", kuvaus: "Suurhankkeiden uusimmat uutiset", url: "/uutiset", sanat: "uutisfeedi" });
  out.push({ laji: "Sivu", otsikko: "Yritykset", kuvaus: "Ilmoittautuneet yritykset ja toimialat", url: "/yritykset", sanat: "yritys alihankkija toimiala" });
  out.push({ laji: "Sivu", otsikko: "Kaikki hankkeet", kuvaus: "Hankkeiden yleisnäkymä ja suodatin", url: "/hankkeet", sanat: "suurhankkeet hankelista" });
  return out;
}
