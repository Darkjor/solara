import type { LeadTipo } from "@/lib/supabase/types";

export const TIPO_LABEL: Record<LeadTipo, string> = {
  cotizacion: "Cotización",
  contacto: "Contacto",
  broker: "Broker",
};

export const INTERES_LABEL: Record<string, string> = {
  "este-mes": "Decide este mes",
  "3-meses": "Decide en 3 meses",
  "6-meses": "Decide en 6 meses o más",
  explorando: "Solo explora",
  lote: "Lote",
  brochure: "Brochure",
};

export const PREFERENCIA_LABEL: Record<string, string> = {
  whatsapp: "WhatsApp",
  llamada: "Llamada",
  correo: "Correo",
};

export const PAGE_SIZE = 25;

export function isTipo(v: string | undefined): v is LeadTipo {
  return v === "cotizacion" || v === "contacto" || v === "broker";
}

/** Escapa comodines de `ilike` para que la búsqueda sea literal. */
export function likePattern(q: string) {
  return `%${q.replace(/[\\%_]/g, (c) => "\\" + c)}%`;
}

export function daysAgoISO(days: number) {
  return new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();
}

export function toCsv(rows: Record<string, unknown>[]) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const cell = (v: unknown) => {
    const s = v == null ? "" : String(v);
    // Evita inyección de fórmulas al abrir el CSV en Excel/Sheets.
    const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
    return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => cell(r[h])).join(","))].join("\r\n");
}
