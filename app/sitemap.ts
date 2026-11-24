import type { MetadataRoute } from "next";
import { getPage, listSlugs } from "@/lib/content";
import { hankePolku, kunnat, kuntaPolku, maakunnat } from "@/lib/alueet";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = listSlugs()
    .map((slug) => getPage(slug))
    .filter((p): p is NonNullable<typeof p> => !!p && !p.meta.noindex)
    .map((p) => ({ url: `${site.url}${p.slug.length ? `/${p.slug.join("/")}` : ""}`, lastModified: p.meta.updated }));
  const alueet = [
    { url: `${site.url}/hankkeet` },
    { url: `${site.url}/uutiset` },
    { url: `${site.url}/yritykset` },
    ...maakunnat().map((m) => ({ url: `${site.url}/hankkeet/${m.tunniste}` })),
    ...kunnat().flatMap((k) => [
      { url: `${site.url}${kuntaPolku(k)}`, lastModified: k.paivitetty },
      ...k.hankkeet.map((h) => ({ url: `${site.url}${hankePolku(k, h)}`, lastModified: k.paivitetty })),
    ]),
  ];
  return [...pages, ...alueet];
}
