/**
 * Prueba de paridad de `messages/es.json` / `messages/en.json`: mismas
 * claves en ambos archivos (recursivamente) y ningun valor vacio. Sin esto,
 * un namespace agregado solo en un idioma rompe el otro en producción sin
 * que el build lo detecte (next-intl no valida esto por si solo).
 *
 * La comparacion en si vive en `i18n/messageParity.ts` (funcion pura, sin
 * efectos secundarios) — se comparte sin problema con
 * `scripts/check-messages.ts` porque ninguno de los dos consumidores le
 * agrega side effects al importarla, solo al usarla.
 */
import { describe, expect, it } from "vitest";
import esMessages from "../messages/es.json";
import enMessages from "../messages/en.json";
import { findMessageIssues } from "./messageParity";

describe("messages/es.json vs messages/en.json", () => {
  it("tienen exactamente las mismas claves y ningun valor vacio", () => {
    const issues = findMessageIssues(esMessages, enMessages, "es.json", "en.json");
    expect(issues).toEqual([]);
  });
});
