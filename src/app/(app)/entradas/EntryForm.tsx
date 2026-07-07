"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProductDTO } from "@/lib/types";
import { formatCOP, formatQty } from "@/lib/format";
import { createEntryAction } from "@/app/actions/entries";
import { MoneyInput } from "@/components/MoneyInput";
import { PlusIcon, SearchIcon } from "@/components/Icons";

interface EntryItem {
  product: ProductDTO;
  quantity: number;
  unitCost: number;
}

function normalize(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function EntryForm({
  products,
  suppliers,
}: {
  products: ProductDTO[];
  suppliers: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [items, setItems] = useState<EntryItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return [];
    return products
      .filter((p) => normalize(p.name).includes(q) || (p.barcode ?? "").includes(q))
      .slice(0, 6);
  }, [products, query]);

  const totalCost = items.reduce(
    (sum, i) => sum + Math.round(i.unitCost * i.quantity),
    0
  );

  function addItem(product: ProductDTO) {
    setMessage(null);
    setItems((prev) =>
      prev.some((i) => i.product.id === product.id)
        ? prev
        : [...prev, { product, quantity: 1, unitCost: product.purchasePrice }]
    );
    setQuery("");
  }

  function updateItem(productId: string, patch: Partial<Pick<EntryItem, "quantity" | "unitCost">>) {
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, ...patch } : i))
    );
  }

  async function handleSubmit() {
    setMessage(null);
    if (items.some((i) => i.quantity <= 0)) {
      setMessage({ ok: false, text: "Todas las cantidades deben ser mayores a 0." });
      return;
    }
    setSaving(true);
    const result = await createEntryAction({
      supplierId,
      items: items.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
        unitCost: i.unitCost,
      })),
    });
    setSaving(false);

    if (!result.ok) {
      setMessage({ ok: false, text: result.message ?? "No se pudo guardar." });
      return;
    }
    setItems([]);
    setSupplierId("");
    setMessage({ ok: true, text: "✅ Entrada registrada. El stock ya está actualizado." });
    router.refresh();
  }

  return (
    <section className="flex flex-col gap-3">
      <h1 className="text-2xl font-bold">Llegó mercancía</h1>
      <p className="text-muted">
        Registre lo que compró y el stock se suma automáticamente.
      </p>

      <div>
        <label htmlFor="supplier" className="label">Proveedor (opcional)</label>
        <select
          id="supplier"
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
          className="field"
        >
          <option value="">Sin proveedor</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="relative">
        <SearchIcon
          size={20}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busque el producto que llegó…"
          className="field pl-12"
          autoComplete="off"
        />
        {results.length > 0 && (
          <ul className="absolute left-0 right-0 top-full z-10 mt-1 max-h-72 overflow-y-auto rounded-2xl border border-line bg-bg shadow-xl">
            {results.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => addItem(p)}
                  className="flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left last:border-0 active:bg-surface"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{p.name}</p>
                    <p className="text-sm text-muted">
                      Hay {formatQty(p.stock)} {p.unit} · último costo {formatCOP(p.purchasePrice)}
                    </p>
                  </div>
                  <PlusIcon size={22} className="shrink-0 text-brand" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {items.length > 0 && (
        <div className="flex flex-col gap-2">
          {items.map(({ product, quantity, unitCost }) => (
            <div key={product.id} className="card flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <p className="min-w-0 flex-1 truncate font-bold">{product.name}</p>
                <button
                  type="button"
                  onClick={() => setItems((prev) => prev.filter((i) => i.product.id !== product.id))}
                  className="text-danger underline"
                >
                  Quitar
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Cantidad ({product.unit})</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={quantity}
                    onChange={(e) =>
                      updateItem(product.id, { quantity: Number(e.target.value) || 0 })
                    }
                    className="field"
                  />
                </div>
                <div>
                  <label className="label">Costo por {product.unit}</label>
                  <MoneyInput
                    value={unitCost}
                    onChange={(v) => updateItem(product.id, { unitCost: v })}
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="card flex items-baseline justify-between border-2 border-brand/50">
            <span className="text-lg font-semibold text-muted">Total de la compra</span>
            <span className="text-3xl font-bold">{formatCOP(totalCost)}</span>
          </div>
        </div>
      )}

      {message && (
        <p
          role="alert"
          className={`rounded-xl px-4 py-3 font-semibold ${
            message.ok ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
          }`}
        >
          {message.text}
        </p>
      )}

      {items.length > 0 && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="btn-primary text-lg"
        >
          {saving ? "Guardando…" : "Registrar entrada"}
        </button>
      )}
    </section>
  );
}
