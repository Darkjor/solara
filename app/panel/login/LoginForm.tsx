"use client";
// "use client": useActionState para mostrar el error sin recargar.

import { useActionState } from "react";
import { login, type LoginState } from "../actions";

export function LoginForm({ notice }: { notice?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const error = state.error ?? notice;
  return (
    <form action={action} className="grid gap-4">
      <label className="grid gap-1.5 text-sm">
        Correo
        <input name="email" type="email" autoComplete="email" required className="rounded-lg border border-arena bg-white px-3.5 py-2.5 text-base outline-none focus:border-caoba" />
      </label>
      <label className="grid gap-1.5 text-sm">
        Contraseña
        <input name="password" type="password" autoComplete="current-password" required className="rounded-lg border border-arena bg-white px-3.5 py-2.5 text-base outline-none focus:border-caoba" />
      </label>
      <button disabled={pending} className="mt-2 rounded-lg bg-caoba px-4 py-3 font-medium text-white hover:bg-caoba-deep disabled:opacity-70">
        {pending ? "Entrando…" : "Entrar"}
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </form>
  );
}
