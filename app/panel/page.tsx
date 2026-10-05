import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { INTERES_LABEL, PAGE_SIZE, PREFERENCIA_LABEL, TIPO_LABEL, daysAgoISO, isTipo, likePattern } from "@/lib/panel";
import type { LeadTipo } from "@/lib/supabase/types";
import { PanelShell } from "./PanelShell";

export const metadata = { title: "Prospectos" };

export default async function PanelHome({ searchParams }: PageProps<"/panel">) {
  const { supabase, nombre } = await requireAdmin();
  const sp = await searchParams;
  const tipo = typeof sp.tipo === "string" && isTipo(sp.tipo) ? sp.tipo : undefined;
  // Comas y paréntesis rompen la sintaxis del filtro `or` de PostgREST.
  const q = typeof sp.q === "string" ? sp.q.replace(/[,()]/g, " ").trim().slice(0, 80) : "";
  const page = Math.max(1, Number(sp.page) || 1);

  const hace7 = daysAgoISO(7);
  const count = (t?: LeadTipo, since?: string) => {
    let query = supabase.from("leads").select("id", { count: "exact", head: true });
    if (t) query = query.eq("tipo", t);
    if (since) query = query.gte("created_at", since);
    return query;
  };

  let list = supabase
    .from("leads")
    .select("id, created_at, tipo, nombre, telefono, email, interes, contacto_preferido, utm_source", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (tipo) list = list.eq("tipo", tipo);
  if (q) {
    const p = likePattern(q);
    list = list.or(`nombre.ilike.${p},telefono.ilike.${p},email.ilike.${p}`);
  }

  const [total, semana, cot, con, bro, res] = await Promise.all([
    count(),
    count(undefined, hace7),
    count("cotizacion"),
    count("contacto"),
    count("broker"),
    list,
  ]);

  const leads = res.data ?? [];
  const filtered = res.count ?? 0;
  const pages = Math.max(1, Math.ceil(filtered / PAGE_SIZE));
  const qs = (over: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    const merged = { tipo, q: q || undefined, page: undefined as number | undefined, ...over };
    for (const [k, v] of Object.entries(merged)) if (v !== undefined && v !== "") params.set(k, String(v));
    const s = params.toString();
    return s ? `/panel?${s}` : "/panel";
  };

  const kpis = [
    { label: "Prospectos totales", value: total.count ?? 0 },
    { label: "Últimos 7 días", value: semana.count ?? 0 },
    { label: "Cotizaciones", value: cot.count ?? 0 },
    { label: "Brokers", value: bro.count ?? 0 },
  ];

  return (
    <PanelShell nombre={nombre}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">Prospectos</h1>
          <p className="mt-1 text-sm text-tinta-soft">Personas que dejaron sus datos en la landing.</p>
        </div>
        <a href={`/panel/export${tipo ? `?tipo=${tipo}` : ""}`} className="rounded-lg border border-caoba px-4 py-2 text-sm font-medium text-caoba hover:bg-caoba hover:text-white">
          Descargar CSV
        </a>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-arena/70 bg-white p-4">
            <dt className="text-xs text-tinta-soft">{k.label}</dt>
            <dd className="mt-1 text-3xl font-light tabular-nums">{k.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex flex-wrap gap-2 text-sm" aria-label="Filtrar por tipo">
          {[
            { key: undefined, label: `Todos (${total.count ?? 0})` },
            { key: "cotizacion" as const, label: `Cotización (${cot.count ?? 0})` },
            { key: "contacto" as const, label: `Contacto (${con.count ?? 0})` },
            { key: "broker" as const, label: `Broker (${bro.count ?? 0})` },
          ].map((f) => (
            <Link
              key={f.label}
              href={qs({ tipo: f.key })}
              aria-current={tipo === f.key ? "page" : undefined}
              className={`rounded-full px-3.5 py-1.5 ${tipo === f.key ? "bg-caoba text-white" : "bg-white text-tinta-soft ring-1 ring-arena hover:text-tinta"}`}
            >
              {f.label}
            </Link>
          ))}
        </nav>
        <form action="/panel" className="flex gap-2">
          {tipo && <input type="hidden" name="tipo" value={tipo} />}
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar nombre, teléfono o correo"
            aria-label="Buscar"
            className="w-full rounded-lg border border-arena bg-white px-3 py-2 text-sm outline-none focus:border-caoba sm:w-72"
          />
          <button className="rounded-lg bg-caoba px-4 py-2 text-sm text-white">Buscar</button>
        </form>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-arena/70 bg-white">
        <table className="w-full min-w-[46rem] text-left text-sm">
          <thead className="border-b border-arena/70 bg-crema/60 text-xs text-tinta-soft">
            <tr>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Teléfono</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Interés</th>
              <th className="px-4 py-3 font-medium">Origen</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-b border-arena/40 last:border-0 hover:bg-crema/40">
                <td className="px-4 py-3 whitespace-nowrap text-tinta-soft">{formatDate(l.created_at, "es", true)}</td>
                <td className="px-4 py-3">
                  <Link href={`/panel/leads/${l.id}`} className="font-medium text-caoba hover:underline">
                    {l.nombre}
                  </Link>
                  {l.email && <div className="text-xs text-tinta-soft">{l.email}</div>}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {l.telefono}
                  {l.contacto_preferido && <div className="text-xs text-tinta-soft">Prefiere {PREFERENCIA_LABEL[l.contacto_preferido]}</div>}
                </td>
                <td className="px-4 py-3">{TIPO_LABEL[l.tipo]}</td>
                <td className="px-4 py-3">{l.interes ? (INTERES_LABEL[l.interes] ?? l.interes) : "—"}</td>
                <td className="px-4 py-3 text-tinta-soft">{l.utm_source ?? "Directo"}</td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-tinta-soft">
                  {q || tipo ? "Ningún prospecto coincide con el filtro." : "Aún no llegan prospectos. Aparecerán aquí en cuanto alguien llene un formulario."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <nav className="mt-4 flex items-center justify-between text-sm" aria-label="Paginación">
          <span className="text-tinta-soft">
            Página {page} de {pages} · {filtered} resultados
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={qs({ page: page - 1 })} className="rounded-lg bg-white px-3 py-1.5 ring-1 ring-arena">
                Anterior
              </Link>
            )}
            {page < pages && (
              <Link href={qs({ page: page + 1 })} className="rounded-lg bg-white px-3 py-1.5 ring-1 ring-arena">
                Siguiente
              </Link>
            )}
          </div>
        </nav>
      )}
    </PanelShell>
  );
}
