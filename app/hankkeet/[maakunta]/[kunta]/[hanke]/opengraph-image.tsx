import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";
import { hanke, kunnat } from "@/lib/alueet";

const fontti = (w: number) => fs.readFileSync(path.join(process.cwd(), `node_modules/@fontsource/inter/files/inter-latin-${w}-normal.woff`));

// Hankkeen jakokuva (LinkedIn ym.): nimi, kunta, tyyppi ja vaihe putkessa. Syntyy buildissa jokaiselle hankkeelle.
export const alt = "Suurhankkeisiin.fi: hankkeen tilannekuva";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamicParams = false;
export const generateStaticParams = () =>
  kunnat().flatMap((k) => k.hankkeet.map((h) => ({ maakunta: k.maakunta_tunniste, kunta: k.tunniste, hanke: h.tunniste })));

const PUTKI = ["Suunnittelu", "Luvitus", "Investointipäätös", "Rakenteilla"];
const VARI: Record<string, string> = { Suunnittelu: "#64748B", Luvitus: "#D97706", "Investointipäätös": "#0E7490", Rakenteilla: "#047857", Keskeytetty: "#B91C1C", Toiminnassa: "#4338CA", Peruttu: "#94A3B8" };
type P = { maakunta: string; kunta: string; hanke: string };

export default async function Image({ params }: { params: Promise<P> | P }) {
  const p = await params;
  const x = hanke(p.maakunta, p.kunta, p.hanke);
  const nimi = x?.hanke.nimi ?? "Suurhanke";
  const vaihe = x?.hanke.vaihe_luokka ?? "";
  const nyt = PUTKI.indexOf(vaihe);
  const raha = x?.hanke.investointi_meur;
  return new ImageResponse(
    (
      <div style={{ fontFamily: "Inter", width: "100%", height: "100%", background: "#0F172A", color: "#F8FAFC", display: "flex", flexDirection: "column", padding: "64px 80px" }}>
        <div style={{ display: "flex", fontSize: 34, fontWeight: 900 }}>Suurhankkeisiin<span style={{ color: "#F59E0B" }}>.fi</span></div>
        <div style={{ display: "flex", fontSize: 28, color: "#94A3B8", marginTop: 44 }}>{[x?.kunta.kunta, x?.kunta.maakunta, x?.hanke.tyyppi].filter(Boolean).join(" · ")}</div>
        <div style={{ display: "flex", fontSize: nimi.length > 60 ? 52 : 64, fontWeight: 900, lineHeight: 1.08, marginTop: 14, letterSpacing: -1 }}>{nimi}</div>
        <div style={{ display: "flex", marginTop: "auto", gap: 12, alignItems: "flex-end" }}>
          {PUTKI.map((v, i) => (
            <div key={v} style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <div style={{ display: "flex", fontSize: 24, fontWeight: i === nyt ? 900 : 400, color: i === nyt ? "#F8FAFC" : "#64748B", marginBottom: 10 }}>{v}</div>
              <div style={{ display: "flex", height: 14, borderRadius: 7, background: nyt >= 0 && i <= nyt ? VARI[vaihe] ?? "#F59E0B" : "#1E293B" }} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#CBD5E1", marginTop: 22 }}>
          <span style={{ color: nyt < 0 && vaihe ? VARI[vaihe] ?? "#CBD5E1" : "#CBD5E1", fontWeight: nyt < 0 && vaihe ? 900 : 400 }}>{nyt < 0 && vaihe ? `Vaihe: ${vaihe}` : "Tilannekuva, uutiset ja tarvittava osaaminen"}</span>
          <span style={{ color: "#F59E0B", fontWeight: 900 }}>{raha ? (raha >= 1000 ? `noin ${(raha / 1000).toLocaleString("fi-FI", { maximumFractionDigits: 1 })} mrd €` : `noin ${raha} M€`) : ""}</span>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Inter", data: fontti(400), weight: 400 }, { name: "Inter", data: fontti(900), weight: 900 }] },
  );
}
