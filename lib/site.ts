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

  /** Brochure del cliente (Drive). */
  brochureUrl: "https://drive.google.com/drive/folders/11sexM-kNMakIcevL7mPh1t5Ej55Y6buS",
  /** Pack legal del cliente (Drive): escritura con reserva de dominio, boleta de inscripcion y libertad de gravamen. */
  legalPackUrl: "https://drive.google.com/drive/folders/1xvkl4llOvYITeopm2mt0mj2z9UqNgN3Y",
} as const;

/** Coordenadas de SOLARA (ficha de Google Maps del desarrollo) y la ficha para el enlace "Abrir en Google Maps". */
export const geo = {
  lat: 18.7686875,
  lng: -87.6901875,
  placeUrl: "https://maps.app.goo.gl/tkf9eni2KTrV5na97",
} as const;

/** Banda de financiamiento (BandaCifras, variante `financiamiento`): oculta hasta recibir los datos de la clienta [PENDIENTE CLIENTE]. */
export const showFinancingBand = false;

export const pricePerM2 = 4450;
export const lotMin = 180;
export const lotMax = 255;
export const lotCount = 235;
export const priceFrom = lotMin * pricePerM2; // 801,000
export const priceMax = lotMax * pricePerM2; // 1,134,750

export type TimeKey = "airfield" | "beach" | "lighthouse" | "beachEscape" | "nativeChoice" | "divina" | "dock" | "hotelZone";

/** Tiempos del mapa del cliente (minutos). */
export const times: { key: TimeKey; min: number }[] = [
  { key: "airfield", min: 2 },
  { key: "beach", min: 5 },
  { key: "lighthouse", min: 5 },
  { key: "beachEscape", min: 5 },
  { key: "nativeChoice", min: 6 },
  { key: "divina", min: 9 },
  { key: "dock", min: 10 },
  { key: "hotelZone", min: 13 },
];
