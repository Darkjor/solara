// Fuente única de los datos del desarrollo. Todo lo que es un DATO (precio,
// m², teléfono, conteo de lotes) vive aquí; los textos viven en
// `messages/{es,en}.json`. Para actualizar precios se edita solo este archivo.
//
// Origen (carpeta del cliente, Solara.docx, brochure y lista de precios 2026):
//   - Precio de lista 2026: $4,450 MXN/m² (lotes unifamiliares).
//   - 235 lotes; superficies 180 a 255 m² (rango oficial publicado).
//   - Tiempos: mapa de ubicación del cliente.
// No agregar cifras que no estén en esos documentos.

export const site = {
  name: "SOLARA Lotes de Inversión",
  shortName: "SOLARA",
  developer: "Mexo Company",
  domain: "solaramahahual.com",
  city: "Mahahual",
  state: "Quintana Roo",

  /** WhatsApp comercial, formato internacional sin "+" ni espacios. */
  whatsapp: "529987059776",
  whatsappDisplay: "+52 998 705 9776",

  /** Brochure del cliente (Drive). El pack legal NO se enlaza: se conoce con el asesor. */
  brochureUrl: "https://drive.google.com/drive/folders/11sexM-kNMakIcevL7mPh1t5Ej55Y6buS",
} as const;

export const pricePerM2 = 4450;
export const lotMin = 180;
export const lotMax = 255;
export const lotCount = 235;
export const priceFrom = lotMin * pricePerM2; // 801,000
export const priceMax = lotMax * pricePerM2; // 1,134,750

export type TimeKey = "airfield" | "beach" | "lighthouse" | "beachEscape" | "nativeChoice" | "divina" | "dock" | "hotelZone";

/**
 * Tiempos del mapa del cliente (minutos) y posición aproximada del hotspot
 * sobre `mapa-ubicacion.webp` (x%, y%). Afinar las posiciones si se cambia el mapa.
 */
export const times: { key: TimeKey; min: number; x: number; y: number }[] = [
  { key: "airfield", min: 2, x: 82, y: 36 },
  { key: "beach", min: 5, x: 81, y: 76 },
  { key: "lighthouse", min: 5, x: 22, y: 40 },
  { key: "beachEscape", min: 5, x: 34, y: 50 },
  { key: "nativeChoice", min: 6, x: 53, y: 53 },
  { key: "divina", min: 9, x: 10, y: 8 },
  { key: "dock", min: 10, x: 55, y: 69 },
  { key: "hotelZone", min: 13, x: 9, y: 34 },
];

/** Grupos de la lista de tiempos (por cercanía). */
export const timeGroups: TimeKey[][] = [
  ["airfield", "beach", "lighthouse"],
  ["beachEscape", "nativeChoice", "divina"],
  ["dock", "hotelZone"],
];
