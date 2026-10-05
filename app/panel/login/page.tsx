import Image from "next/image";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: PageProps<"/panel/login">) {
  const { e } = await searchParams;
  return (
    <main className="flex min-h-dvh items-center justify-center bg-caoba px-4">
      <div className="w-full max-w-sm rounded-2xl bg-crema p-8 shadow-2xl">
        <Image src="/brand/logo-terracota.svg" alt="SOLARA Lotes de Inversión" width={1200} height={1000} className="mx-auto h-24 w-auto" priority />
        <h1 className="mt-6 mb-6 text-center text-lg font-medium">CRM de prospectos</h1>
        <LoginForm notice={e === "sin-acceso" ? "Esta cuenta no tiene acceso al CRM." : undefined} />
      </div>
    </main>
  );
}
