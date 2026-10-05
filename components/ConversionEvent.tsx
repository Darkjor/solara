"use client";
// "use client": empuja el evento de conversión a dataLayer (GTM) al montar.

import { useEffect } from "react";
import { LEAD_PENDING_KEY } from "./LeadForm";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/**
 * Emite `generate_lead` una sola vez por envío. El formulario deja una marca en
 * sessionStorage justo antes de redirigir aquí; si alguien abre /gracias
 * directo (o recarga), no hay marca y no se cuenta una conversión falsa.
 */
export function ConversionEvent({ tipo }: { tipo: string }) {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(LEAD_PENDING_KEY) !== "1") return;
      sessionStorage.removeItem(LEAD_PENDING_KEY);
    } catch {
      return;
    }
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({ event: "generate_lead", tipo });
  }, [tipo]);
  return null;
}
