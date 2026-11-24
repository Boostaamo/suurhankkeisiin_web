import type { Metadata } from "next";
import Link from "next/link";
import { TOIMIALAT } from "@/lib/toimialat";

export const metadata: Metadata = {
  title: "Yritykset",
  description: "Suurhankkeiden alueen yritykset toimialoittain: urakoitsijat, kalusto, majoitus ja palvelut.",
};

// Vaihe 1: toimialat ja ilmoittautuminen. Yrityslista julkaistaan vasta yritysten luvalla ja
// hyväksytyn esikatselun mukaan; haku tietokannasta (resurssipankki) on vaihe 2 (Bistek).
export default function Yritykset() {
  return (
    <>
      <section className="hero sm"><div className="wrap">
        <div className="eyebrow">Yritykset</div>
        <h1>Alueen yritykset suurhankkeisiin</h1>
        <p className="lead">Täältä tilaajat ja urakoitsijat löytävät paikalliset tekijät toimialan ja alueen mukaan.</p>
        <div className="cta"><Link className="btn" href="/ilmoittaudu">Ilmoita yrityksesi</Link></div>
      </div></section>
      <section><div className="wrap">
        <h2>Toimialat</h2>
        <div className="chips">
          {TOIMIALAT.map((t) => <span key={t} className="chip">{t}</span>)}
        </div>
        <p className="muted" style={{ marginTop: 24 }}>Yrityslista avautuu, kun ensimmäiset yritykset ovat ilmoittautuneet ja antaneet luvan nimensä näyttämiseen. Ilmoittautuneet yritykset näkyvät tilaajille ja pääurakoitsijoille hankkeittain.</p>
      </div></section>
    </>
  );
}
