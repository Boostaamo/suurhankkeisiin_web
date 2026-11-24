"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Form, { type FormKind } from "@/components/Form";

export type FormSlot = { id: string; kind: FormKind; arg?: string };

// Sisältö renderöidään HTML:nä, ja lomakkeet liitetään sen paikkamerkkeihin Reactin portaaleilla.
// arg: "maakunta/kunta/hanke" (esim. "Pohjois-Pohjanmaa/Muhos"), jos lomake on aluekohtainen.
export default function FormPortals({ slots, source }: { slots: FormSlot[]; source: string }) {
  const [targets, setTargets] = useState<Record<string, Element>>({});

  useEffect(() => {
    const found: Record<string, Element> = {};
    for (const s of slots) {
      const el = document.getElementById(s.id);
      if (el) found[s.id] = el;
    }
    setTargets(found);
  }, [slots]);

  return (
    <>
      {slots.map((s) => {
        if (!targets[s.id]) return null;
        const [maakunta, kunta, hanke] = (s.arg ?? "").split("/");
        return createPortal(<Form kind={s.kind} source={source} alue={{ maakunta, kunta, hanke }} />, targets[s.id], s.id);
      })}
    </>
  );
}
