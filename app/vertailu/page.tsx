import type { Metadata } from "next";
import { Suspense } from "react";
import Vertailu from "@/components/Vertailu";

export const metadata: Metadata = {
  title: "Hankkeiden vertailu",
  description: "Vertaa suurhankkeita rinnakkain: vaihe, investointi, toteuttaja, aikataulu ja tarvittava osaaminen.",
  robots: { index: false, follow: true },
};

export default function VertailuSivu() {
  return (
    <>
      <section className="hero sm"><div className="wrap">
        <div className="eyebrow"><a href="/hankkeet">Suurhankkeet</a> / Vertailu</div>
        <h1>Hankkeiden vertailu</h1>
        <p className="lead">Valitut hankkeet rinnakkain. Tiedot julkisista lähteistä, lähde näkyy jokaisen tiedon kohdalla.</p>
      </div></section>
      <section><div className="wrap"><Suspense fallback={<p className="muted">Ladataan…</p>}><Vertailu /></Suspense></div></section>
    </>
  );
}
