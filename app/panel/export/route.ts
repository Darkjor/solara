import { requireAdmin } from "@/lib/auth";
import { isTipo, toCsv } from "@/lib/panel";

export async function GET(request: Request) {
  const { supabase } = await requireAdmin();
  const tipo = new URL(request.url).searchParams.get("tipo") ?? undefined;

  let query = supabase
    .from("leads")
    .select("created_at, tipo, nombre, telefono, email, contacto_preferido, interes, mensaje, locale, utm_source, utm_medium, utm_campaign, referrer")
    .order("created_at", { ascending: false })
    .limit(10000);
  if (isTipo(tipo)) query = query.eq("tipo", tipo);
  const { data, error } = await query;
  if (error) return new Response("No se pudo exportar", { status: 500 });

  const fecha = new Date().toISOString().slice(0, 10);
  // BOM para que Excel abra los acentos correctamente.
  return new Response("﻿" + toCsv(data ?? []), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="prospectos-solara-${fecha}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
