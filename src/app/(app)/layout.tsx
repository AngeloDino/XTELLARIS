import Image from "next/image";
import { requireSession } from "@/server/auth";
import { getBusiness } from "@/server/services/business";
import { getRestockSuggestions } from "@/server/services/products";
import { BottomNav } from "@/components/BottomNav";
import { Logo } from "@/components/Logo";
import { RegisterSW } from "@/components/RegisterSW";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { businessId } = await requireSession();
  const [business, restock] = await Promise.all([
    getBusiness(businessId),
    getRestockSuggestions(businessId),
  ]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col">
      <header className="no-print sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur">
        <div className="flex min-w-0 items-center gap-3">
          {business?.logoUrl ? (
            <Image
              src={business.logoUrl}
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 rounded-lg object-cover"
              unoptimized
            />
          ) : (
            <Logo size={30} withName={false} />
          )}
          <div className="min-w-0">
            <p className="truncate text-lg font-bold leading-tight">
              {business?.name ?? "Mi negocio"}
            </p>
            <p className="text-xs text-muted">Xtellaris</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {business?.isDemo && (
        <div className="no-print bg-warning/15 px-4 py-2 text-center text-sm font-semibold text-warning">
          Está en el modo demo: los datos son de prueba y se reinician al volver a entrar.
        </div>
      )}

      <main className="flex-1 px-4 pb-28 pt-4">{children}</main>

      <BottomNav lowStockCount={restock.length} />
      <RegisterSW />
    </div>
  );
}
