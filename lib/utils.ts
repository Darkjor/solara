// Alias que espera `components/ui/shadcn/*` (alias `utils` de `components.json`,
// Tarea 15): todos importan `cn` de "@/lib/utils", nunca del paquete "cn"
// directo, para que un futuro cambio de librería de merge de clases sea un
// solo archivo. El paquete "cn" (helper minimo tipo clsx+tailwind-merge) lo
// instaló `npx shadcn@latest init`.
export { cn } from "cn"
