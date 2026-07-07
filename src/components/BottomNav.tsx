"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  BellIcon,
  CartIcon,
  ChartIcon,
  HomeIcon,
  LogOutIcon,
  MenuIcon,
  PackageIcon,
  TruckIcon,
  UsersIcon,
} from "./Icons";

const mainItems = [
  { href: "/", label: "Inicio", Icon: HomeIcon },
  { href: "/vender", label: "Vender", Icon: CartIcon },
  { href: "/productos", label: "Productos", Icon: PackageIcon },
  { href: "/alertas", label: "Alertas", Icon: BellIcon },
] as const;

const moreItems = [
  { href: "/entradas", label: "Entradas de mercancía", Icon: TruckIcon },
  { href: "/reportes", label: "Reportes", Icon: ChartIcon },
  { href: "/proveedores", label: "Proveedores", Icon: UsersIcon },
] as const;

export function BottomNav({ lowStockCount }: { lowStockCount: number }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = moreItems.some((i) => pathname.startsWith(i.href));

  return (
    <>
      {moreOpen && (
        <div
          className="no-print fixed inset-0 z-40 bg-black/50"
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="absolute bottom-20 left-3 right-3 rounded-2xl border border-line bg-bg p-2 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {moreItems.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-4 text-lg font-semibold active:bg-surface"
              >
                <Icon size={26} className="text-brand" />
                {label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-4 text-lg font-semibold text-danger active:bg-surface"
            >
              <LogOutIcon size={26} />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}

      <nav className="no-print fixed bottom-0 left-0 right-0 z-30 border-t border-line bg-bg/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-3xl">
          {mainItems.map(({ href, label, Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-semibold transition-colors ${
                  active ? "text-brand" : "text-muted"
                }`}
              >
                <Icon size={24} strokeWidth={active ? 2.4 : 2} />
                {label}
                {href === "/alertas" && lowStockCount > 0 && (
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
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-semibold transition-colors ${
              moreActive || moreOpen ? "text-brand" : "text-muted"
            }`}
          >
            <MenuIcon size={24} />
            Más
          </button>
        </div>
      </nav>
    </>
  );
}
