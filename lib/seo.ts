// Dominio público. Prioridad: variable explícita → dominio de producción que
// Vercel inyecta → localhost. `||` y no `??`: una variable definida pero vacía
// en Vercel debe caer al siguiente valor, no romper `new URL("")`.
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;

const raw = (process.env.NEXT_PUBLIC_SITE_URL || vercelHost || "http://localhost:3000").trim();

// Acepta "solaramahahual.com" sin esquema.
export const SITE_URL = (/^https?:\/\//.test(raw) ? raw : `https://${raw}`).replace(/\/$/, "");

export const ALLOW_INDEXING = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";
