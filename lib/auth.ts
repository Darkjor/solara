import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Primera línea de cada página del panel. Exige sesión Y que el usuario esté
 * en `admins`; RLS vuelve a filtrar en la base, esto evita mostrar un panel
 * vacío a quien no debería entrar.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/panel/login");

  const { data: admin } = await supabase.from("admins").select("nombre").eq("usuario_id", user.id).maybeSingle();
  if (!admin) {
    await supabase.auth.signOut();
    redirect("/panel/login?e=sin-acceso");
  }
  return { supabase, user, nombre: admin.nombre ?? user.email ?? "Admin" };
}
