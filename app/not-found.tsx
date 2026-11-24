import Link from "next/link";

export default function NotFound() {
  return (
    <section className="hero sm"><div className="wrap">
      <h1>Sivua ei löytynyt</h1>
      <p className="lead">Hakemaasi sivua ei ole olemassa tai se on siirretty.</p>
      <p><Link className="btn o" href="/">Palaa etusivulle</Link></p>
    </div></section>
  );
}
