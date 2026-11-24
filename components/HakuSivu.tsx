"use client";

import { useEffect, useState } from "react";
import Haku from "@/components/Haku";

// Lukee hakusanan osoitteesta (?q=) selaimessa, jotta sivu pysyy staattisena.
export default function HakuSivu() {
  const [q, setQ] = useState<string | null>(null);
  useEffect(() => setQ(new URLSearchParams(window.location.search).get("q") ?? ""), []);
  return q === null ? null : <Haku iso alku={q} key={q} />;
}
