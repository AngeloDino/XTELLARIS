import type { Metadata } from "next";
import { requireSession } from "@/server/auth";
import { listProducts } from "@/server/services/products";
import { listSuppliers } from "@/server/services/suppliers";
import { listRecentEntries } from "@/server/services/entries";
import { formatCOP, formatDateTime, formatQty } from "@/lib/format";
import { EntryForm } from "./EntryForm";

export const metadata: Metadata = { title: "Entradas de mercancía — Xtellaris" };
export const dynamic = "force-dynamic";

export default async function EntriesPage() {
  const { businessId } = await requireSession();
  const [products, suppliers, entries] = await Promise.all([
    listProducts(businessId),
    listSuppliers(businessId),
    listRecentEntries(businessId),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <EntryForm
        products={products}
        suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
      />

      <section>
        <h2 className="mb-3 text-xl font-bold">Últimas entradas</h2>
        {entries.length === 0 ? (
          <p className="card py-8 text-center text-muted">
            Aquí quedará el historial cuando registre su primera entrada.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {entries.map((entry) => (
              <li key={entry.id} className="card">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-bold">
                    {entry.supplierName ?? "Sin proveedor"}
                  </p>
                  <p className="font-bold">{formatCOP(entry.totalCost)}</p>
                </div>
                <p className="text-sm text-muted">{formatDateTime(entry.createdAt)}</p>
                <ul className="mt-2 text-sm text-muted">
                  {entry.items.map((item, i) => (
                    <li key={i}>
                      • {formatQty(item.quantity)} {item.unit} de {item.productName} a{" "}
                      {formatCOP(item.unitCost)}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
