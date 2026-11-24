import type { Metadata } from "next";
import HakuSivu from "@/components/HakuSivu";

export const metadata: Metadata = { title: "Haku", description: "Hae hankkeita, kuntia, osaamistarpeita, uutisia ja sivuja.", robots: { index: false } };

export default function Haku() {
  return (
    <>
      <section className="hero sm"><div className="wrap">
        <div className="eyebrow">Haku</div>
        <h1>Hae sivustolta</h1>
        <p className="lead">Kirjoita hankkeen, kunnan, maakunnan, toimialan tai osaamisen nimi. Ehdotukset päivittyvät kirjoittaessa.</p>
      </div></section>
      <section><div className="wrap"><HakuSivu /></div></section>
    </>
  );
}
