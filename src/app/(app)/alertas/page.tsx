import Link from "next/link";
import type { Metadata } from "next";
import { requireSession } from "@/server/auth";
import { getRestockSuggestions } from "@/server/services/products";
import { formatQty } from "@/lib/format";

export const metadata: Metadata = { title: "Alertas — Xtellaris" };
export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const { businessId } = await requireSession();
  const suggestions = await getRestockSuggestions(businessId);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Alertas de reabastecimiento</h1>

      {suggestions.length === 0 ? (
        <div className="card py-12 text-center">
          <p className="text-5xl">👍</p>
          <p className="mt-3 text-xl font-bold text-success">Todo en orden</p>
          <p className="mt-1 text-muted">
            Ningún producto está por debajo de su stock mínimo.
          </p>
        </div>
      ) : (
        <>
          <p className="text-muted">
            Estos productos están en o por debajo del mínimo. La cantidad sugerida
            los deja con inventario para varios días.
          </p>
          <ul className="flex flex-col gap-2">
            {suggestions.map(({ product, suggestedQty }) => {
              return (
                <li key={product.id} className="card border-2 border-danger/50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-lg font-bold">{product.name}</p>
                      <p className="font-semibold text-danger">
                        {product.stock <= 0
                          ? "⛔ Agotado"
                          : `⚠️ Quedan ${formatQty(product.stock)} ${product.unit}`}
                        {" · "}mínimo {formatQty(product.minStock)}
                      </p>
                      {product.supplierName && (
                        <p className="text-sm text-muted">
                          Proveedor: {product.supplierName}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 rounded-xl bg-brand/10 px-3 py-2 text-center">
                      <p className="text-xs font-semibold text-muted">Pedir</p>
                      <p className="text-xl font-bold text-brand">
                        {formatQty(suggestedQty)}
                      </p>
                      <p className="text-xs text-muted">{product.unit}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/proveedores" className="btn-secondary">
              🤝 Ver proveedores
            </Link>
            <Link href="/entradas" className="btn-primary">
              🚚 Registrar llegada
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
