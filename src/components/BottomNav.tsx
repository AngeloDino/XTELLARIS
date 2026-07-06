"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";

const mainItems = [
  { href: "/", label: "Inicio", icon: "🏠" },
  { href: "/vender", label: "Vender", icon: "🛒" },
  { href: "/productos", label: "Productos", icon: "📦" },
  { href: "/alertas", label: "Alertas", icon: "🔔" },
] as const;

const moreItems = [
  { href: "/entradas", label: "Entradas de mercancía", icon: "🚚" },
  { href: "/reportes", label: "Reportes", icon: "📊" },
  { href: "/proveedores", label: "Proveedores", icon: "🤝" },
] as const;

export function BottomNav({ lowStockCount }: { lowStockCount: number }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = moreItems.some((i) => pathname.startsWith(i.href));

  return (
    <>
      {moreOpen && (
        <div
          className="no-print fixed inset-0 z-40 bg-black/40"
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="absolute bottom-20 left-3 right-3 rounded-2xl border border-line bg-bg p-2 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {moreItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-4 text-lg font-semibold active:bg-surface"
              >
                <span className="text-2xl">{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-4 text-lg font-semibold text-danger active:bg-surface"
            >
              <span className="text-2xl">🚪</span>
              Cerrar sesión
            </button>
          </div>
        </div>
      )}

      <nav className="no-print fixed bottom-0 left-0 right-0 z-30 border-t border-line bg-bg/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-3xl">
          {mainItems.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-semibold ${
                  active ? "text-brand" : "text-muted"
                }`}
              >
                <span className="text-2xl leading-none">{item.icon}</span>
                {item.label}
                {item.href === "/alertas" && lowStockCount > 0 && (
                  <span className="absolute right-[22%] top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[11px] font-bold text-white">
                    {lowStockCount}
                  </span>
                )}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-semibold ${
              moreActive || moreOpen ? "text-brand" : "text-muted"
            }`}
          >
            <span className="text-2xl leading-none">☰</span>
            Más
          </button>
        </div>
      </nav>
    </>
  );
}
