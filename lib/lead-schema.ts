import { z } from "zod";

const optional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional();

export const leadSchema = z.object({
  tipo: z.enum(["cotizacion", "contacto", "broker"]),
  nombre: z.string().trim().min(2, "errNombre").max(120, "errNombre"),
  telefono: z
    .string()
    .trim()
    .max(30, "errTelefono")
    .refine((v) => v.replace(/\D/g, "").length >= 10, "errTelefono"),
  email: z
    .string()
    .trim()
    .max(160, "errEmail")
    .refine((v) => v === "" || z.email().safeParse(v).success, "errEmail")
    .transform((v) => (v === "" ? null : v)),
  /** Para cotización: "¿cuándo piensas decidir?" (este-mes, 3-meses, 6-meses, explorando). */
  interes: optional(60),
  mensaje: optional(2000),
  locale: z.enum(["es", "en"]).catch("es"),
  utm_source: optional(120),
  utm_medium: optional(120),
  utm_campaign: optional(120),
  referrer: optional(500),
  /** Consentimiento del aviso de privacidad: obligatorio, no se guarda en la tabla. */
  privacidad: z.literal("on", "errPrivacidad"),
});

export type LeadField = "nombre" | "telefono" | "email" | "privacidad";

export type LeadFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error" }
  | { status: "unconfigured" }
  | { status: "invalid"; errors: Partial<Record<LeadField, string>>; values: Record<string, string> };

/**
 * Normaliza el FormData. Los datos que no tienen columna propia (superficie de
 * interés, empresa y ciudad de brokers) se guardan al inicio del mensaje para
 * no añadir columnas solo para eso.
 */
export function readLeadForm(formData: FormData) {
  const get = (k: string) => String(formData.get(k) ?? "");
  const prefix = [
    get("superficie").trim() ? `Superficie de interés: ${get("superficie").trim()} m2.` : "",
    get("empresa").trim() ? `Empresa: ${get("empresa").trim()}.` : "",
    get("ciudad").trim() ? `Ciudad y país: ${get("ciudad").trim()}.` : "",
  ]
    .filter(Boolean)
    .join(" ");
  const mensaje = get("mensaje").trim();
  return {
    tipo: get("tipo"),
    nombre: get("nombre"),
    telefono: get("telefono"),
    email: get("email"),
    interes: get("interes"),
    mensaje: `${prefix} ${mensaje}`.trim(),
    locale: get("locale"),
    utm_source: get("utm_source"),
    utm_medium: get("utm_medium"),
    utm_campaign: get("utm_campaign"),
    referrer: get("referrer"),
    privacidad: get("privacidad"),
  };
}

/** Valida en cliente y servidor con el mismo esquema. */
export function validateLead(formData: FormData) {
  const parsed = leadSchema.safeParse(readLeadForm(formData));
  if (parsed.success) return { ok: true as const, data: parsed.data };
  const errors: Partial<Record<LeadField, string>> = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path[0];
    if ((field === "nombre" || field === "telefono" || field === "email" || field === "privacidad") && !errors[field]) {
      errors[field] = issue.message;
    }
  }
  return { ok: false as const, errors };
}
