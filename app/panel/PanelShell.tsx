import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { logout } from "./actions";

export function PanelShell({ nombre, children }: { nombre: string; children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="bg-caoba text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/panel" className="flex items-center gap-3">
            <Image src="/brand/iso-blanco.svg" alt="" width={371} height={367} className="size-8" />
            <span className="font-medium">CRM SOLARA</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-white/75 sm:inline">{nombre}</span>
            <form action={logout}>
              <button className="rounded-full border border-white/40 px-4 py-1.5 hover:bg-white/10">Salir</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
