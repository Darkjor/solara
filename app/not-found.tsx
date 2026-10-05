import Link from "next/link";
import "./globals.css";

export default function NotFound() {
  return (
    <html lang="es">
      <body className="flex min-h-dvh items-center justify-center bg-hueso p-6 text-center">
        <div>
          <p className="text-6xl text-tierra-600">404</p>
          <Link href="/" className="mt-6 inline-block text-tierra-600 underline">
            Ir al inicio
          </Link>
        </div>
      </body>
    </html>
  );
}
