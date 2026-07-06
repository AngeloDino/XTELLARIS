"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { loginSchema } from "@/lib/validations";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"login" | "demo" | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const parsed = loginSchema.safeParse({
      email: form.get("email"),
      password: form.get("password"),
    });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Datos inválidos");
      return;
    }

    setLoading("login");
    const result = await signIn("credentials", { ...parsed.data, redirect: false });
    setLoading(null);

    if (result?.error) {
      setError("Correo o contraseña incorrectos.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  async function handleDemo() {
    setError(null);
    setLoading("demo");
    const result = await signIn("credentials", { demo: "true", redirect: false });
    setLoading(null);
    if (result?.error) {
      setError("No se pudo abrir el demo. Intente de nuevo.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="card flex flex-col gap-4 p-5">
        <div>
          <label htmlFor="email" className="label text-base">
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="sunegocio@correo.com"
            className="field"
          />
        </div>
        <div>
          <label htmlFor="password" className="label text-base">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Su contraseña"
            className="field"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 font-semibold text-danger">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading !== null} className="btn-primary text-lg">
          {loading === "login" ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <div className="flex items-center gap-3 text-muted">
        <span className="h-px flex-1 bg-line" />
        ¿Quiere verla primero?
        <span className="h-px flex-1 bg-line" />
      </div>

      <button
        type="button"
        onClick={handleDemo}
        disabled={loading !== null}
        className="btn-secondary text-lg"
      >
        {loading === "demo" ? "Preparando demo…" : "✨ Probar demo"}
      </button>
    </div>
  );
}
