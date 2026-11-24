import type { Metadata } from "next";
import Link from "next/link";
import { uutisetHtml } from "@/lib/uutiset";

export const metadata: Metadata = {
  title: "Uutiset",
  description: "Suurhankkeiden uusimmat uutiset lyhyesti ja linkit alkuperäisiin juttuihin.",
};

export default function Uutiset() {
  return (
    <>
      <section className="hero sm"><div className="wrap">
        <div className="eyebrow">Uutiset</div>
        <h1>Suurhankkeiden uutiset</h1>
        <p className="lead">Lyhyet yhteenvedot suurhankkeiden uutisista. Koko juttu aukeaa alkuperäisen julkaisijan sivulta.</p>
      </div></section>
      <section><div className="wrap">
        <div dangerouslySetInnerHTML={{ __html: uutisetHtml(undefined, 100) }} />
        <p className="muted" style={{ marginTop: 24 }}>Uutisia seurataan päivittäin. <Link href="/hankkeet">Katso kaikki hankkeet</Link>.</p>
      </div></section>
    </>
  );
}
