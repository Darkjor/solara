/**
 * Logica pura de paridad de mensajes: compara dos arboles de traduccion
 * (`messages/es.json` vs `messages/en.json`) y detecta claves que faltan de
 * un lado o valores vacios. Sin efectos secundarios (nada de `console`,
 * `process.exit` ni codigo a nivel de modulo que se ejecute solo)
 * precisamente para que se pueda importar sin riesgo tanto desde un script
 * corrido con `tsx` (`scripts/check-messages.ts`, que le agrega el CLI:
 * imprime y sale con codigo 1) como desde un test de Vitest
 * (`i18n/messages.test.ts`, que solo hace `expect(...).toEqual([])`) — antes
 * esta logica estaba duplicada en ambos archivos porque el script SI tenia
 * el `process.exit(1)` a nivel de modulo, y un `import` directo desde el
 * test lo habria ejecutado igual, pudiendo matar el proceso de Vitest en
 * cuanto hubiera una sola clave desalineada.
 */

/** Arbol de mensajes tal como lo consume next-intl: string u objeto anidado. */
export type MessageTree = { [key: string]: string | MessageTree };

/** Type guard: distingue un namespace anidado (objeto) de un valor de texto. */
export function isMessageTree(value: string | MessageTree): value is MessageTree {
  return typeof value === "object" && value !== null;
}

/**
 * Compara dos arboles de mensajes en paralelo y junta los problemas
 * encontrados: claves que faltan de un lado, valores vacios, y namespaces
 * cuya forma no coincide (objeto en un idioma, texto en el otro).
 */
export function findMessageIssues(
  a: MessageTree,
  b: MessageTree,
  aLabel: string,
  bLabel: string,
  path: string[] = [],
): string[] {
  const issues: string[] = [];
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);

  for (const key of allKeys) {
    const keyPath = [...path, key].join(".");

    if (!(key in a)) {
      issues.push(`"${keyPath}" existe en ${bLabel} pero falta en ${aLabel}`);
      continue;
    }
    if (!(key in b)) {
      issues.push(`"${keyPath}" existe en ${aLabel} pero falta en ${bLabel}`);
      continue;
    }

    const valueA = a[key];
    const valueB = b[key];
    const isTreeA = isMessageTree(valueA);
    const isTreeB = isMessageTree(valueB);

    if (isTreeA && isTreeB) {
      issues.push(...findMessageIssues(valueA, valueB, aLabel, bLabel, [...path, key]));
      continue;
    }
    if (isTreeA !== isTreeB) {
      issues.push(`"${keyPath}" tiene forma distinta entre ${aLabel} y ${bLabel} (objeto vs. texto)`);
      continue;
    }
    if (typeof valueA === "string" && valueA.trim() === "") {
      issues.push(`"${keyPath}" esta vacio en ${aLabel}`);
    }
    if (typeof valueB === "string" && valueB.trim() === "") {
      issues.push(`"${keyPath}" esta vacio en ${bLabel}`);
    }
  }

  return issues;
}
