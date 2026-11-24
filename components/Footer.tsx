import Link from "next/link";
import { site } from "@/lib/site";
import ConsentReopen from "@/components/ConsentReopen";

// Ekosysteemilinkit: boostaamo-core/verkkosivut/ekosysteemi/ekosysteemi.json -> content/site.json (ecosystem).
// Suurhankkeisiin.fi on Dimman palvelu (Hannu 24.11.2026).
export default function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="wm">Suurhankkeisiin<span>.fi</span></div>
        <p className="small" style={{ marginTop: 8 }}>{site.tagline}</p>
        <div className="fcols">
          <div>
            <div className="eyebrow">Sivusto</div>
            <ul>
              {site.siteLinks.map((l) => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}
              {process.env.NEXT_PUBLIC_GA_ID ? <li><ConsentReopen /></li> : null}
            </ul>
          </div>
          <div>
            <div className="eyebrow">Yhteys</div>
            <ul>
              <li><a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a></li>
              <li><a href={`tel:${site.contactPhone.replace(/\s/g, "")}`}>{site.contactPhone}</a></li>
            </ul>
          </div>
          <div>
            <div className="eyebrow">Boostaamo-yhtiöt</div>
            <ul>
              {site.ecosystem.map((c) =>
                c.href.includes("täydennä")
                  ? <li key={c.label}>{c.label}</li>
                  : <li key={c.label}><a href={c.href} rel="noopener" data-track="click_yhtio" data-yhtio={c.label}>{c.label}</a></li>,
              )}
            </ul>
          </div>
        </div>
        <p className="small" style={{ marginTop: 32 }}>
          Palvelun tarjoaa <a href={site.provider.href} rel="noopener">{site.provider.label}</a> · <span className="dot" />{site.badge} · Rekisterinpitäjä: {site.legalEntity}.
        </p>
      </div>
    </footer>
  );
}
