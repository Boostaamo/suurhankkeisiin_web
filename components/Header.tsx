import Link from "next/link";
import { site } from "@/lib/site";
import Haku from "@/components/Haku";

export default function Header() {
  return (
    <header className="top">
      <nav className="nav wrap" aria-label="Päävalikko">
        <Link className="wm" href="/">Suurhankkeisiin<span>.fi</span></Link>
        <ul>
          {site.nav.map((item) => (
            <li key={item.href}><Link href={item.href}>{item.label}</Link></li>
          ))}
        </ul>
        <Haku />
        <Link className="btn sm" href={site.cta.href}>{site.cta.label}</Link>
      </nav>
    </header>
  );
}
