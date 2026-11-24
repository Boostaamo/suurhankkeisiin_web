// Ilmoittautumisten ja yhteydenottojen tallennus Supabaseen (EU), Suurhankkeisiin.fi:n oma projekti (Kriha Invest Oy / Dimma). REST-rajapinta, ei erillistä kirjastoa
// (sama malli kuin muissa konsernin sivustoissa). Taulu: supabase/migrations/20261118_liidit.sql.
// Älä lokita henkilötietoja.

export type Liidi = {
  lahde: "ilmoittautuminen" | "aluekumppanuus";
  nimi: string;
  sahkoposti: string;
  puhelin: string;
  yritys: string;
  tehtava: string;
  viesti: string;
  vastaukset: Record<string, string> | null;
  maakunta: string;
  kunta: string;
  hanke: string;
  suostumus: boolean;
  sivu: string;
  lahde_sivu: string;
  viittaaja: string;
  utm: Record<string, string>;
  esikatselu: boolean;
};

function yhteys(): { url: string; avain: string } | null {
  // Vercelin Supabase-integraatio lisää SUPABASE_URL- ja SUPABASE_SERVICE_ROLE_KEY-muuttujat.
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const avain = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && avain ? { url: url.replace(/\/$/, ""), avain } : null;
}

export const tallennusKaytossa = () => yhteys() !== null;

/** Tallentaa liidin. Palauttaa false, jos tallennus epäonnistui. */
export async function tallennaLiidi(l: Liidi): Promise<boolean> {
  const y = yhteys();
  if (!y) return false;
  try {
    const res = await fetch(`${y.url}/rest/v1/liidit`, {
      method: "POST",
      headers: {
        apikey: y.avain,
        // Uudet sb_secret_-avaimet eivät ole JWT:itä: Bearer vain vanhalle service_role-avaimelle.
        ...(y.avain.startsWith("eyJ") ? { Authorization: `Bearer ${y.avain}` } : {}),
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(l),
      cache: "no-store",
    });
    if (!res.ok) {
      // Vain avainvirheissä viesti lokiin (ei sisällä liidin tietoja).
      const syy = res.status === 401 || res.status === 403 ? ` ${(await res.text()).slice(0, 200)}` : "";
      console.error(`Liidin tallennus epäonnistui, tila ${res.status}.${syy}`);
    }
    return res.ok;
  } catch {
    console.error("Liidin tallennus epäonnistui (verkkovirhe).");
    return false;
  }
}

/** Valinnainen sähköposti-ilmoitus webhookilla (LEAD_WEBHOOK_URL). Ei estä lähetystä, jos epäonnistuu. */
export async function ilmoita(l: Liidi): Promise<void> {
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) return;
  const secret = process.env.LEAD_WEBHOOK_SECRET;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(secret ? { "X-Webhook-Secret": secret } : {}) },
      body: JSON.stringify({ ...l, secret: secret || undefined, sivusto: "suurhankkeisiin.fi" }),
      cache: "no-store",
    });
  } catch {
    console.error("Liidi-ilmoitus epäonnistui (verkkovirhe).");
  }
}
