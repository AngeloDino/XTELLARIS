"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProductDTO } from "@/lib/types";
import { formatCOP, formatQty } from "@/lib/format";
import { createSaleAction } from "@/app/actions/sales";
import { MoneyInput } from "@/components/MoneyInput";
import { CartIcon, CheckCircleIcon, SearchIcon } from "@/components/Icons";

interface CartItem {
  product: ProductDTO;
  quantity: number;
}

function normalize(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

const QUICK_BILLS = [2000, 5000, 10000, 20000, 50000, 100000];

export function PosScreen({ products }: { products: ProductDTO[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paidWith, setPaidWith] = useState(0);
  const [charging, setCharging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSale, setLastSale] = useState<{ total: number; change: number | null } | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return [];
    return products
      .filter((p) => normalize(p.name).includes(q) || (p.barcode ?? "").includes(q))
      .slice(0, 8);
  }, [products, query]);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + Math.round(item.product.salePrice * item.quantity), 0),
    [cart]
  );
  const change = paidWith > 0 ? paidWith - total : null;

  function addToCart(product: ProductDTO) {
    setError(null);
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setQuery("");
    searchRef.current?.focus();
  }

  function setQuantity(productId: string, quantity: number) {
    setCart((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.product.id !== productId)
        : prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    );
  }

  async function handleCharge() {
    setError(null);
    if (paidWith > 0 && paidWith < total) {
      setError("Lo que paga el cliente no alcanza para el total.");
      return;
    }
    setCharging(true);
    const result = await createSaleAction({
      items: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      paidWith: paidWith > 0 ? paidWith : null,
    });
    setCharging(false);

    if (!result.ok) {
      setError(result.message ?? "No se pudo registrar la venta.");
      return;
    }
    setLastSale({
      total: (result.data?.total as number) ?? total,
      change: (result.data?.change as number | null) ?? change,
    });
    setCart([]);
    setPaidWith(0);
    setQuery("");
    router.refresh();
  }

  // Pantalla de venta exitosa: cambio en GRANDE para entregarlo sin dudas.
  if (lastSale) {
    return (
      <div className="flex flex-col items-center gap-6 py-10 text-center">
        <CheckCircleIcon size={72} className="text-success" />
        <h1 className="text-3xl font-bold text-success">¡Venta registrada!</h1>
        <div className="card w-full max-w-sm">
          <p className="text-lg text-muted">Total cobrado</p>
          <p className="text-4xl font-bold">{formatCOP(lastSale.total)}</p>
          {lastSale.change != null && (
            <>
              <p className="mt-4 text-lg text-muted">Devuelva al cliente</p>
              <p className="text-6xl font-bold text-brand">{formatCOP(lastSale.change)}</p>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => setLastSale(null)}
          className="btn-primary w-full max-w-sm py-5 text-2xl"
        >
          Nueva venta
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-2xl font-bold">Venta rápida</h1>

      <div className="relative">
        <SearchIcon
          size={20}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          ref={searchRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Busque el producto…"
          className="field pl-12 text-lg"
          autoComplete="off"
        />
        {results.length > 0 && (
          <ul className="absolute left-0 right-0 top-full z-10 mt-1 max-h-80 overflow-y-auto rounded-2xl border border-line bg-bg shadow-xl">
            {results.map((p) => {
              const out = p.stock <= 0;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    disabled={out}
                    onClick={() => addToCart(p)}
                    className="flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left last:border-0 active:bg-surface disabled:opacity-45"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">{p.name}</p>
                      <p className={`text-sm ${out ? "font-semibold text-danger" : "text-muted"}`}>
                        {out ? "Agotado" : `Quedan ${formatQty(p.stock)} ${p.unit}`}
                      </p>
                    </div>
                    <span className="font-bold">{formatCOP(p.salePrice)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="card flex flex-col items-center py-10 text-center text-muted">
          <CartIcon size={44} className="text-muted/60" />
          <p className="mt-3 text-lg">Busque un producto y tóquelo para agregarlo.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {cart.map(({ product, quantity }) => (
            <li key={product.id} className="card flex items-center gap-2 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{product.name}</p>
                <p className="text-sm text-muted">
                  {formatCOP(product.salePrice)} × {formatQty(quantity)} {product.unit}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setQuantity(product.id, quantity - 1)}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-line text-2xl font-bold active:bg-line/50"
                  aria-label={`Quitar uno de ${product.name}`}
                >
                  −
                </button>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(product.id, Number(e.target.value) || 0)}
                  className="h-12 w-16 rounded-xl border-2 border-line bg-bg text-center text-lg font-bold"
                  aria-label={`Cantidad de ${product.name}`}
                />
                <button
                  type="button"
                  onClick={() => setQuantity(product.id, quantity + 1)}
                  disabled={quantity + 1 > product.stock}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-line text-2xl font-bold active:bg-line/50 disabled:opacity-40"
                  aria-label={`Agregar uno de ${product.name}`}
                >
                  +
                </button>
              </div>
              <p className="w-20 text-right font-bold">
                {formatCOP(product.salePrice * quantity)}
              </p>
            </li>
          ))}
        </ul>
      )}

      {cart.length > 0 && (
        <div className="card flex flex-col gap-4 border-2 border-brand/50">
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-semibold text-muted">Total</span>
            <span className="text-5xl font-bold">{formatCOP(total)}</span>
          </div>

          <div>
            <label htmlFor="paidWith" className="label text-base">¿Con cuánto paga?</label>
            <MoneyInput id="paidWith" value={paidWith} onChange={setPaidWith} placeholder="$0 (opcional)" />
            <div className="mt-2 flex flex-wrap gap-2">
              {QUICK_BILLS.filter((b) => b >= total).slice(0, 3).map((bill) => (
                <button
                  key={bill}
                  type="button"
                  onClick={() => setPaidWith(bill)}
                  className="rounded-full border-2 border-line bg-surface px-4 py-2 font-semibold active:bg-line/50"
                >
                  {formatCOP(bill)}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPaidWith(total)}
                className="rounded-full border-2 border-line bg-surface px-4 py-2 font-semibold active:bg-line/50"
              >
                Exacto
              </button>
            </div>
          </div>

          {change != null && change >= 0 && (
            <div className="flex items-baseline justify-between rounded-xl bg-brand/10 px-4 py-3">
              <span className="text-lg font-semibold">Cambio</span>
              <span className="text-4xl font-bold text-brand">{formatCOP(change)}</span>
            </div>
          )}
          {change != null && change < 0 && (
            <p className="rounded-xl bg-danger/10 px-4 py-3 font-semibold text-danger">
              Faltan {formatCOP(-change)} para completar el pago.
            </p>
          )}

          {error && (
            <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 font-semibold text-danger">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleCharge}
            disabled={charging || (paidWith > 0 && paidWith < total)}
            className="btn-primary py-5 text-2xl"
          >
            {charging ? "Registrando…" : `Cobrar ${formatCOP(total)}`}
          </button>
        </div>
      )}
    </div>
  );
}
