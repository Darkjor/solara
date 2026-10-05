"use server";

import { createClient } from "@/lib/supabase/server";
import { validateLead, type LeadFormState } from "@/lib/lead-schema";

/**
 * Guarda un lead en Supabase. Si faltan las variables de Supabase devuelve
 * "unconfigured" y el cliente abre WhatsApp con los datos (el lead no se pierde).
 */
export async function sendLead(formData: FormData): Promise<LeadFormState> {
  // Honeypot y envíos instantáneos (< 2 s): a un bot se le responde "éxito"
  // para que no reintente, pero no se guarda nada.
  if (String(formData.get("website") ?? "") !== "") return { status: "success" };
  const ts = Number(formData.get("ts") ?? 0);
  if (ts && Date.now() - ts < 2000) return { status: "success" };

  const result = validateLead(formData);
  if (!result.ok) {
    const values: Record<string, string> = {};
    for (const k of ["nombre", "telefono", "email", "interes", "mensaje", "empresa", "ciudad"]) {
      values[k] = String(formData.get(k) ?? "");
    }
    return { status: "invalid", errors: result.errors, values };
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { status: "unconfigured" };
  }

  const { privacidad: _consent, ...row } = result.data;
  void _consent;
  const supabase = await createClient();
  const { error } = await supabase.from("leads").insert(row);
  if (error) {
    console.error("[leads] insert falló:", error.message);
    return { status: "error" };
  }
  return { status: "success" };
}
