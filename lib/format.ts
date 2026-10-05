export function formatMXN(value: number, locale: string) {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "es-MX", {
    style: "currency",
    currency: "MXN",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, locale: string) {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "es-MX", { maximumFractionDigits: 1 }).format(value);
}

export function formatDate(iso: string, locale: string, withTime = false) {
  const date = iso.length === 10 ? new Date(`${iso}T12:00:00`) : new Date(iso);
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-MX", {
    dateStyle: withTime ? "medium" : "long",
    ...(withTime ? { timeStyle: "short", timeZone: "America/Cancun" } : {}),
  }).format(date);
}

/** "$1.6 M" — precio abreviado para titulares. */
export function formatMXNCompact(value: number, locale: string) {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "es-MX", {
    style: "currency",
    currency: "MXN",
    currencyDisplay: "narrowSymbol",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
