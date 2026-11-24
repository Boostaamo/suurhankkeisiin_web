import { ImageResponse } from "next/og";

export const alt = "Suurhankkeisiin.fi – Suomen teollisuushankkeiden ja alihankinnan kohtauspaikka";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#0F172A", color: "#F8FAFC", display: "flex", flexDirection: "column", justifyContent: "center", padding: 96 }}>
        <div style={{ display: "flex", fontSize: 84, fontWeight: 900 }}>Suurhankkeisiin<span style={{ color: "#F59E0B" }}>.fi</span></div>
        <div style={{ fontSize: 40, marginTop: 24, color: "#CBD5E1" }}>Suomen teollisuushankkeiden ja alihankinnan kohtauspaikka</div>
      </div>
    ),
    size,
  );
}
