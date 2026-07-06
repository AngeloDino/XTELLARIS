import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Iniciar sesión — Xtellaris" };

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-8 px-6 py-10">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <Logo size={56} withName={false} />
        <h1 className="text-4xl font-bold tracking-tight">Xtellaris</h1>
        <p className="text-lg text-muted">
          El inventario de su negocio, claro y al día.
        </p>
      </div>

      <LoginForm />

      <p className="text-center text-sm text-muted">
        ¿Aún no tiene cuenta? Escríbanos y la creamos por usted.
        <br />
        Un producto de <strong>New Tech Industries</strong>.
      </p>
    </main>
  );
}
