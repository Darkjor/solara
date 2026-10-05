"use client";
// "use client": estado del envío, validación en cliente (mismo zod que el
// servidor), UTM/referrer y respaldo a WhatsApp cuando Supabase no está
// configurado (el lead nunca se pierde).

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { Link, useRouter } from "@/i18n/navigation";
import { sendLead } from "@/lib/leads";
import { validateLead, type LeadField } from "@/lib/lead-schema";
import { SUPABASE_CONFIGURED, whatsappLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/WhatsAppFloat";

/** Marca en localStorage: esta persona ya dejó sus datos (la lee ExitIntent). */
export const LEAD_SENT_KEY = "solara-lead-enviado";
export const LEAD_PENDING_KEY = "solara-lead-pendiente";
/** Evento con el que la calculadora pasa la superficie al formulario. */
export const SURFACE_EVENT = "solara:surface";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign"] as const;
type Status = "idle" | "sending" | "success" | "error" | "network";
type Variant = "quote" | "broker" | "exit";

export function LeadForm({ variant, id, className = "" }: { variant: Variant; id?: string; className?: string }) {
  const tq = useTranslations("quote");
  const tb = useTranslations("brokers");
  const te = useTranslations("exit");
  const tw = useTranslations("whatsapp");
  const locale = useLocale();
  const router = useRouter();
  const uid = useId();
  const form = useRef<HTMLFormElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Partial<Record<LeadField, string>>>({});
  const [surface, setSurface] = useState<string>("");
  const hidden = useRef<Record<string, HTMLInputElement | null>>({});

  const isBroker = variant === "broker";
  const isExit = variant === "exit";
  const tipo = isBroker ? "broker" : isExit ? "contacto" : "cotizacion";

  useEffect(() => {
    if (hidden.current.ts) hidden.current.ts.value = String(Date.now());
    const params = new URLSearchParams(window.location.search);
    for (const key of UTM_KEYS) {
      let value = params.get(key);
      try {
        if (value) sessionStorage.setItem(key, value);
        else value = sessionStorage.getItem(key);
      } catch {}
      if (value && hidden.current[key]) hidden.current[key]!.value = value;
    }
    if (hidden.current.referrer && document.referrer && !document.referrer.includes(window.location.host)) {
      hidden.current.referrer.value = document.referrer;
    }
  }, []);

  // La calculadora manda la superficie elegida.
  useEffect(() => {
    if (variant !== "quote") return;
    const on = (e: Event) => setSurface(String((e as CustomEvent<number>).detail ?? ""));
    window.addEventListener(SURFACE_EVENT, on);
    return () => window.removeEventListener(SURFACE_EVENT, on);
  }, [variant]);

  const errText = (f: LeadField) => {
    const code = errors[f];
    if (!code) return undefined;
    return tq(f === "nombre" ? "errName" : f === "telefono" ? "errPhone" : f === "email" ? "errEmail" : "errPrivacy");
  };

  function waText(fd: FormData) {
    const get = (k: string) => String(fd.get(k) ?? "").trim();
    const name = get("nombre");
    if (isBroker) {
      return [tq("waBroker"), `${name}`, get("empresa") && tq("waCompany", { company: get("empresa") }), tq("waPhone", { phone: get("telefono") }), get("email") && tq("waEmail", { email: get("email") })]
        .filter(Boolean)
        .join("\n");
    }
    const whenKeys: Record<string, string> = { "este-mes": "when1", "3-meses": "when2", "6-meses": "when3", explorando: "when4" };
    const when = whenKeys[get("interes")];
    return [
      tq("waLead", { name }),
      tq("waPhone", { phone: get("telefono") }),
      get("email") && tq("waEmail", { email: get("email") }),
      when && tq("waWhen", { when: tq(when as "when1") }),
      get("superficie") && tq("waSurface", { m2: get("superficie") }),
    ]
      .filter(Boolean)
      .join("\n");
  }

  function done() {
    setStatus("success");
    try {
      localStorage.setItem(LEAD_SENT_KEY, "1");
      sessionStorage.setItem(LEAD_PENDING_KEY, "1");
    } catch {}
    window.setTimeout(() => router.push({ pathname: "/gracias", query: { tipo: isBroker ? "broker" : "cotizacion" } }), 1200);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const fd = new FormData(e.currentTarget);
    const result = validateLead(fd);
    if (!result.ok) {
      setErrors(result.errors);
      setStatus("idle");
      // Foco al primer campo inválido.
      const first = (["nombre", "telefono", "email", "privacidad"] as LeadField[]).find((f) => result.errors[f]);
      requestAnimationFrame(() => form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus());
      return;
    }
    setErrors({});
    setStatus("sending");

    // Sin Supabase: WhatsApp con los datos. Se abre aquí, dentro del gesto del
    // clic, para que el navegador no bloquee la ventana.
    if (!SUPABASE_CONFIGURED) {
      window.open(whatsappLink(waText(fd)), "_blank", "noopener");
      done();
      return;
    }
    try {
      const res = await sendLead(fd);
      if (res.status === "success") return done();
      if (res.status === "unconfigured") {
        window.open(whatsappLink(waText(fd)), "_blank", "noopener");
        return done();
      }
      if (res.status === "invalid") {
        setErrors(res.errors);
        setStatus("idle");
        return;
      }
      setStatus("error");
    } catch {
      setStatus(typeof navigator !== "undefined" && !navigator.onLine ? "network" : "error");
    }
  }

  useEffect(() => {
    if (status === "success") heading.current?.focus();
  }, [status]);

  const shell = `rounded-lg bg-white p-6 text-tinta-900 shadow-[var(--e2)] sm:p-8 ${className}`;

  if (status === "success") {
    return (
      <div id={id} className={shell} role="status" aria-live="polite">
        <CheckCircle weight="regular" size={44} className="text-selva-700" aria-hidden />
        <h3 ref={heading} tabIndex={-1} className="display t-h3 mt-3 outline-none">
          {isBroker ? tb("successTitle") : isExit ? te("success") : tq("successTitle")}
        </h3>
        <p className="mt-2 text-tinta-900/80">{isBroker ? tb("success") : isExit ? "" : tq("successText")}</p>
      </div>
    );
  }

  const L = isBroker
    ? { name: tb("nameLabel"), namePh: tb("namePh"), phone: tb("phoneLabel"), phonePh: tb("phonePh"), email: tb("emailLabel"), emailPh: tb("emailPh"), submit: tb("submit") }
    : { name: tq("nameLabel"), namePh: tq("namePh"), phone: tq("phoneLabel"), phonePh: tq("phonePh"), email: tq("emailLabel"), emailPh: tq("emailPh"), submit: tq("submit") };
  const hasErrors = Object.keys(errors).length > 0;
  const sending = status === "sending";
  const waHref = whatsappLink(tw("general"));

  return (
    <form
      ref={form}
      id={id}
      onSubmit={onSubmit}
      noValidate
      className={shell}
      aria-labelledby={`${uid}-title`}
      aria-busy={sending}
    >
      {!isExit && (
        <h2 id={`${uid}-title`} className="display t-h3 mb-1">
          {isBroker ? tb("formTitle") : tq("title")}
        </h2>
      )}
      {isExit && <span id={`${uid}-title`} className="sr-only">{te("title")}</span>}

      <input type="hidden" name="tipo" value={tipo} />
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="ts" ref={(el) => void (hidden.current.ts = el)} />
      {isExit && <input type="hidden" name="mensaje" value="Popup de salida" />}
      {UTM_KEYS.map((k) => (
        <input key={k} type="hidden" name={k} ref={(el) => void (hidden.current[k] = el)} />
      ))}
      <input type="hidden" name="referrer" ref={(el) => void (hidden.current.referrer = el)} />
      {surface && <input type="hidden" name="superficie" value={surface} />}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {hasErrors && (
        <p role="alert" className="mt-3 flex items-start gap-2 text-[0.9375rem] font-semibold text-error-700">
          <WarningCircle size={20} className="mt-0.5 shrink-0" aria-hidden />
          {tq("errorSummary")}
        </p>
      )}

      <div className="mt-4 grid gap-4">
        <Field uid={uid} name="nombre" label={L.name} error={errText("nombre")}>
          <input id={`${uid}-nombre`} name="nombre" autoComplete="name" placeholder={L.namePh} readOnly={sending} className="field" aria-invalid={!!errors.nombre} aria-describedby={errors.nombre ? `${uid}-nombre-err` : undefined} />
        </Field>

        {isBroker && (
          <Field uid={uid} name="empresa" label={tb("companyLabel")}>
            <input id={`${uid}-empresa`} name="empresa" autoComplete="organization" placeholder={tb("companyPh")} readOnly={sending} className="field" />
          </Field>
        )}

        <Field uid={uid} name="telefono" label={L.phone} help={isBroker ? undefined : tq("phoneHelp")} error={errText("telefono")}>
          <input id={`${uid}-telefono`} name="telefono" type="tel" inputMode="tel" autoComplete="tel" placeholder={L.phonePh} readOnly={sending} className="field" aria-invalid={!!errors.telefono} aria-describedby={[errors.telefono ? `${uid}-telefono-err` : "", !isBroker ? `${uid}-telefono-help` : ""].filter(Boolean).join(" ") || undefined} />
        </Field>

        {!isExit && (
          <Field uid={uid} name="email" label={L.email} error={errText("email")}>
            <input id={`${uid}-email`} name="email" type="email" autoComplete="email" placeholder={L.emailPh} readOnly={sending} className="field" aria-invalid={!!errors.email} aria-describedby={errors.email ? `${uid}-email-err` : undefined} />
          </Field>
        )}

        {isBroker && (
          <>
            <Field uid={uid} name="ciudad" label={tb("cityLabel")}>
              <input id={`${uid}-ciudad`} name="ciudad" autoComplete="country-name" placeholder={tb("cityPh")} readOnly={sending} className="field" />
            </Field>
            <Field uid={uid} name="mensaje" label={tb("messageLabel")}>
              <textarea id={`${uid}-mensaje`} name="mensaje" rows={3} maxLength={1500} placeholder={tb("messagePh")} readOnly={sending} className="field resize-none" />
            </Field>
          </>
        )}

        {variant === "quote" && (
          <>
            <Field uid={uid} name="interes" label={`${tq("whenLabel")} ${tq("whenOptional")}`}>
              <select id={`${uid}-interes`} name="interes" defaultValue="" className="field">
                <option value="">{tq("whenPick")}</option>
                <option value="este-mes">{tq("when1")}</option>
                <option value="3-meses">{tq("when2")}</option>
                <option value="6-meses">{tq("when3")}</option>
                <option value="explorando">{tq("when4")}</option>
              </select>
            </Field>
            {surface && (
              <p className="flex items-center justify-between gap-3 rounded-lg bg-tierra-100 px-3 py-2 text-[0.9375rem] font-semibold">
                <span className="num">{tq("surface", { m2: surface })}</span>
                <button type="button" onClick={() => setSurface("")} className="link-action !font-semibold">
                  {tq("surfaceRemove")}
                </button>
              </p>
            )}
          </>
        )}
      </div>

      <div className="mt-4">
        <label className="flex cursor-pointer items-start gap-3 text-[0.9375rem] leading-snug">
          <input
            type="checkbox"
            name="privacidad"
            id={`${uid}-privacidad`}
            className="mt-0.5 size-5 shrink-0 accent-tierra-600"
            aria-invalid={!!errors.privacidad}
            aria-describedby={errors.privacidad ? `${uid}-privacidad-err` : undefined}
          />
          <span>
            {(isBroker ? tb : tq).rich("privacy", {
              link: (chunks) => (
                <Link href="/aviso-de-privacidad" className="link-action !font-normal !text-tierra-600" target="_blank">
                  {chunks}
                </Link>
              ),
            })}
          </span>
        </label>
        {errors.privacidad && (
          <p id={`${uid}-privacidad-err`} className="mt-2 flex items-start gap-1.5 text-[0.9375rem] text-error-700">
            <WarningCircle size={18} className="mt-0.5 shrink-0" aria-hidden />
            {errText("privacidad")}
          </p>
        )}
      </div>

      {(status === "error" || status === "network") && (
        <div role="alert" className="mt-4 rounded-lg border border-error-700 bg-error-700/5 p-3 text-[0.9375rem] text-error-700">
          <p className="flex items-start gap-2 font-semibold">
            <WarningCircle size={20} className="mt-0.5 shrink-0" aria-hidden />
            {status === "network" ? tq("errNetwork") : tq("errServer")}
          </p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="link-action !text-error-700">
              <WhatsAppIcon className="size-4" />
              {tq("whatsapp")}
            </a>
          </p>
        </div>
      )}

      <button type="submit" aria-disabled={sending} className={`btn btn-primary mt-5 w-full ${sending ? "opacity-90" : ""} ${sending ? "btn-progress" : ""}`}>
        {sending ? tq("submitting") : status === "error" || status === "network" ? tq("retry") : L.submit}
      </button>

      <p className="mt-3 text-center t-small text-tinta-600">
        {variant === "quote" ? `${tq("priceNote")} ${tq("privacyShort")}` : tq("privacyShort")}
      </p>
    </form>
  );
}

function Field({ uid, name, label, help, error, children }: { uid: string; name: string; label: string; help?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <label htmlFor={`${uid}-${name}`} className="text-[0.9375rem] font-semibold">
        {label}
      </label>
      {children}
      {help && !error && (
        <p id={`${uid}-${name}-help`} className="t-small text-tinta-600">
          {help}
        </p>
      )}
      {error && (
        <p id={`${uid}-${name}-err`} className="flex items-start gap-1.5 text-[0.9375rem] text-error-700">
          <WarningCircle size={18} className="mt-0.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}
