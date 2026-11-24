"use client";

import { TOIMIALAT } from "@/lib/toimialat";
import { FormEvent, useId, useState } from "react";
import { track } from "@/lib/analytics";

// Lomakkeet: ilmoittautuminen (konversiopiste, sign_up) ja kunta (aluekumppanuus, generate_lead).
// Kentät: Hannun ensimmäinen versio 24.11.2026.
export type FormKind = "ilmoittautuminen" | "kunta";
export type Alue = { maakunta?: string; kunta?: string; hanke?: string };

type Status = "idle" | "sending" | "ok" | "error";


const SUBMIT: Record<FormKind, string> = {
  ilmoittautuminen: "Ilmoita yritys mukaan",
  kunta: "Lähetä yhteydenottopyyntö",
};

const THANKS: Record<FormKind, string> = {
  ilmoittautuminen: "/ilmoittaudu/kiitos",
  kunta: "/kunnille/kiitos",
};

const CONSENT: Record<FormKind, string> = {
  ilmoittautuminen: "Hyväksyn, että Suurhankkeisiin.fi tallentaa yrityksen tiedot ja ottaa minuun yhteyttä hankkeisiin liittyvissä asioissa.",
  kunta: "Hyväksyn, että Suurhankkeisiin.fi ottaa minuun yhteyttä aluekumppanuudesta.",
};

function Field({ label, name, type = "text", required, autoComplete, textarea, defaultValue }: {
  label: string; name: string; type?: string; required?: boolean; autoComplete?: string; textarea?: boolean; defaultValue?: string;
}) {
  const id = `${useId()}-${name}`;
  return (
    <label htmlFor={id} className="fl">
      <span>{label}{required ? " *" : ""}</span>
      {textarea
        ? <textarea id={id} name={name} rows={4} className="fld" maxLength={4000} required={required} />
        : <input id={id} name={name} type={type} className="fld" required={required} autoComplete={autoComplete} maxLength={200} defaultValue={defaultValue} />}
    </label>
  );
}

function Choice({ label, name, options, required }: { label: string; name: string; options: string[]; required?: boolean }) {
  const id = `${useId()}-${name}`;
  return (
    <label htmlFor={id} className="fl">
      <span>{label}{required ? " *" : ""}</span>
      <select id={id} name={name} className="fld" required={required} defaultValue="">
        <option value="" disabled>Valitse</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

export default function Form({ kind, source, alue = {} }: { kind: FormKind; source: string; alue?: Alue }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const g = (k: string) => (d.get(k) as string | null) ?? "";
    const q = new URLSearchParams(window.location.search);
    const pro = d.get("pro") === "on";
    const payload = {
      kind,
      name: g("name"),
      company: g("company"),
      role: g("role"),
      email: g("email"),
      phone: g("phone"),
      message: g("message"),
      maakunta: alue.maakunta ?? "",
      kunta: alue.kunta ?? "",
      hanke: alue.hanke ?? "",
      answers: kind === "ilmoittautuminen"
        ? { y_tunnus: g("ytunnus"), verkkosivu: g("verkkosivu"), vaihe: window.location.hash.startsWith("#ilmoittaudu-") ? window.location.hash.slice(13) : "", kotikunta: g("hometown"), toimiala: g("industry"), kalusto: g("equipment"), kapasiteetti: g("capacity"), pro: pro ? "kyllä" : "ei" }
        : { kunta_tai_organisaatio: g("org") },
      consent: d.get("consent") === "on",
      website: g("website"), // honeypot
      source,
      page: window.location.pathname,
      referrer: document.referrer,
      utm_source: q.get("utm_source") ?? "",
      utm_medium: q.get("utm_medium") ?? "",
      utm_campaign: q.get("utm_campaign") ?? "",
      utm_term: q.get("utm_term") ?? "",
      utm_content: q.get("utm_content") ?? "",
    };
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setStatus("error");
        setError(json.error || "Lähetys epäonnistui. Yritä uudelleen.");
        return;
      }
      setStatus("ok");
      const alueParams = { maakunta: payload.maakunta, kunta: payload.kunta, hanke: payload.hanke, form_source: source };
      if (kind === "ilmoittautuminen") track("sign_up", { method: "ilmoittautuminen", toimiala: g("industry"), pro, ...alueParams });
      else track("generate_lead", { lahde: "aluekumppanuus", ...alueParams });
      window.setTimeout(() => window.location.assign(THANKS[kind]), 300);
    } catch {
      setStatus("error");
      setError("Verkkovirhe. Yritä uudelleen.");
    }
  }

  if (status === "ok") return <p className="formok" role="status">Kiitos! Lähetys vastaanotettu.</p>;

  return (
    <form className="rform" onSubmit={onSubmit}>
      {kind === "ilmoittautuminen" ? (
        <>
          <Field label="Yrityksen virallinen nimi" name="company" required autoComplete="organization" />
          <div className="two">
            <Field label="Y-tunnus" name="ytunnus" />
            <Field label="Kotipaikka tai kunta" name="hometown" required defaultValue={alue.kunta} />
          </div>
          <Field label="Yrityksen verkkosivu" name="verkkosivu" autoComplete="url" />
          <p className="muted small" style={{ margin: "-6px 0 12px" }}>Kokoamme verkkosivultasi palvelusi profiiliin. Voit täydentää niitä alla.</p>
          <Choice label="Pääasiallinen toimiala" name="industry" options={TOIMIALAT} required />
          <Field label="Käytettävissä oleva kalusto ja koneet" name="equipment" textarea />
          <Field label="Työntekijäkapasiteetti hankkeeseen" name="capacity" />
          <Field label="Yhteyshenkilö" name="name" required autoComplete="name" />
          <div className="two">
            <Field label="Sähköposti" name="email" type="email" required autoComplete="email" />
            <Field label="Puhelin" name="phone" type="tel" autoComplete="tel" />
          </div>
          <Field label="Erikoisosaaminen ja kokemus" name="message" textarea />
          <label className="chk">
            <input type="checkbox" name="pro" /> <span>Haluan yritykselleni PRO-näkyvyyden (ensimmäiset 30 päivää 0 €, sen jälkeen 99 €/kk, alv 0 %). Otamme yhteyttä ennen tilauksen alkua.</span>
          </label>
        </>
      ) : (
        <>
          <Field label="Kunta tai organisaatio" name="org" required autoComplete="organization" />
          <Field label="Nimi" name="name" required autoComplete="name" />
          <Field label="Tehtävä" name="role" autoComplete="organization-title" />
          <div className="two">
            <Field label="Sähköposti" name="email" type="email" required autoComplete="email" />
            <Field label="Puhelin" name="phone" type="tel" autoComplete="tel" />
          </div>
          <Field label="Viesti" name="message" textarea />
        </>
      )}
      <label className="chk">
        <input type="checkbox" name="consent" required /> <span>{CONSENT[kind]} Tietojen käsittely: <a href="/tietosuoja">tietosuojaseloste</a>. *</span>
      </label>
      <div className="hp" aria-hidden="true">
        <label>Älä täytä tätä kenttää<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <button className="btn" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Lähetetään…" : SUBMIT[kind]}
      </button>
      {status === "error" && <p className="ferr" role="alert">{error}</p>}
    </form>
  );
}
