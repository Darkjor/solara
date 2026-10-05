import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { INTERES_LABEL, PREFERENCIA_LABEL, TIPO_LABEL } from "@/lib/panel";
import { PanelShell } from "../../PanelShell";

export const metadata = { title: "Prospecto" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function LeadPage({ params }: PageProps<"/panel/leads/[id]">) {
  const { supabase, nombre } = await requireAdmin();
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const { data: lead } = await supabase.from("leads").select("*").eq("id", id).maybeSingle();
  if (!lead) notFound();

  const digits = lead.telefono.replace(/\D/g, "");
  // Un número de 10 dígitos se asume de México para abrir WhatsApp.
  const wa = digits.length === 10 ? `52${digits}` : digits;
  const rows: [string, string | null][] = [
    ["Recibido", formatDate(lead.created_at, "es", true)],
    ["Tipo", TIPO_LABEL[lead.tipo]],
    ["Teléfono", lead.telefono],
    ["Correo", lead.email],
    ["Prefiere que lo contacten por", lead.contacto_preferido ? PREFERENCIA_LABEL[lead.contacto_preferido] : null],
    ["Interés", lead.interes ? (INTERES_LABEL[lead.interes] ?? lead.interes) : null],
    ["Idioma de la página", lead.locale === "en" ? "Inglés" : "Español"],
    ["Mensaje", lead.mensaje],
    ["Fuente (utm_source)", lead.utm_source],
    ["Medio (utm_medium)", lead.utm_medium],
    ["Campaña (utm_campaign)", lead.utm_campaign],
    ["Llegó desde", lead.referrer],
  ];

  return (
    <PanelShell nombre={nombre}>
      <Link href="/panel" className="text-sm text-caoba hover:underline">
        ← Todos los prospectos
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-2xl font-medium">{lead.nombre}</h1>
        <div className="flex gap-2">
          <a
            href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hola ${lead.nombre.split(" ")[0]}, te escribimos de SOLARA Lotes de Inversión.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-[#25d366] px-4 py-2 text-sm font-medium text-white"
          >
            WhatsApp
          </a>
          {lead.email && (
            <a href={`mailto:${lead.email}`} className="rounded-lg border border-caoba px-4 py-2 text-sm font-medium text-caoba">
              Correo
            </a>
          )}
        </div>
      </div>
      <dl className="mt-6 divide-y divide-arena/50 rounded-xl border border-arena/70 bg-white">
        {rows.map(([k, v]) => (
          <div key={k} className="grid gap-1 px-5 py-3.5 sm:grid-cols-[14rem_1fr]">
            <dt className="text-sm text-tinta-soft">{k}</dt>
            <dd className="text-sm break-words whitespace-pre-wrap">{v || "—"}</dd>
          </div>
        ))}
      </dl>
    </PanelShell>
  );
}
