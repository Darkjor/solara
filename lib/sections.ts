/** Secciones de la home en el pie (id del ancla + clave de "nav"), en el orden de la pagina. */
export const SECTIONS = [
  { id: "concepto", key: "concept" },
  { id: "lotes", key: "lots" },
  { id: "ubicacion", key: "location" },
  { id: "inversion", key: "investment" },
  { id: "disponibilidad", key: "availability" },
  { id: "aliados", key: "brokers" },
  { id: "faq", key: "faq" },
] as const;

/** Menu del encabezado: 5 enlaces (cambios de la clienta, nov 2026). Concepto y Aliados quedan solo en el pie. */
const NAV_IDS = ["lotes", "ubicacion", "inversion", "disponibilidad", "faq"];
export const NAV_SECTIONS = SECTIONS.filter((s) => NAV_IDS.includes(s.id));
