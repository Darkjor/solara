import { describe, expect, it } from "vitest";
import { leadSchema, readLeadForm, validateLead } from "./lead-schema";

function form(values: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) fd.set(k, v);
  return fd;
}
const base = { tipo: "cotizacion", nombre: "Ana Lopez", telefono: "998 705 9776", privacidad: "on", locale: "es" };

describe("leadSchema", () => {
  it("acepta un lead minimo y convierte vacios en null", () => {
    const r = leadSchema.safeParse(readLeadForm(form(base)));
    expect(r.success).toBe(true);
    expect(r.data?.email).toBeNull();
    expect(r.data?.mensaje).toBeNull();
  });

  it("rechaza telefono con menos de 10 digitos y correo invalido", () => {
    const r = validateLead(form({ ...base, telefono: "12345", email: "no-es-correo" }));
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.telefono).toBe("errTelefono");
      expect(r.errors.email).toBe("errEmail");
    }
  });

  it("exige aceptar el aviso de privacidad", () => {
    const r = validateLead(form({ ...base, privacidad: "" }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.privacidad).toBeDefined();
  });

  it("antepone empresa y ciudad del broker al mensaje", () => {
    const r = leadSchema.safeParse(readLeadForm(form({ ...base, tipo: "broker", empresa: "Casa MX", ciudad: "Cancun, Mexico", mensaje: "Hola" })));
    expect(r.data?.mensaje).toBe("Empresa: Casa MX. Ciudad y pais: Cancun, Mexico. Hola".replace("pais", "país"));
  });

  it("guarda la superficie de interes que manda la calculadora", () => {
    const r = leadSchema.safeParse(readLeadForm(form({ ...base, superficie: "215" })));
    expect(r.data?.mensaje).toBe("Superficie de interés: 215 m2.");
  });

  it("cae a 'es' con un locale desconocido", () => {
    const r = leadSchema.safeParse(readLeadForm(form({ ...base, locale: "fr" })));
    expect(r.data?.locale).toBe("es");
  });
});
