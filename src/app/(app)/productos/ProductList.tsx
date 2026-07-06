"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { CategoryDTO, ProductDTO } from "@/lib/types";
import { formatCOP, formatQty } from "@/lib/format";

/** Búsqueda sin tildes ni mayúsculas: "panela" encuentra "Panelá". */
function normalize(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function ProductList({
  products,
  categories,
}: {
  products: ProductDTO[];
  categories: CategoryDTO[];
}) {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return products.filter((p) => {
      if (categoryId && p.categoryId !== categoryId) return false;
      if (!q) return true;
      return normalize(p.name).includes(q) || (p.barcode ?? "").includes(q);
    });
  }, [products, query, categoryId]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Link href="/productos/nuevo" className="btn-primary">
          + Nuevo
        </Link>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="🔍 Buscar por nombre o código…"
        className="field"
        autoComplete="off"
      />

      {categories.length > 0 && (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <button
            type="button"
            onClick={() => setCategoryId("")}
            className={`shrink-0 rounded-full border-2 px-4 py-2 font-semibold ${
              categoryId === ""
                ? "border-brand bg-brand text-brand-ink"
                : "border-line bg-surface text-muted"
            }`}
          >
            Todas
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoryId(categoryId === c.id ? "" : c.id)}
              className={`shrink-0 rounded-full border-2 px-4 py-2 font-semibold ${
                categoryId === c.id
                  ? "border-brand bg-brand text-brand-ink"
                  : "border-line bg-surface text-muted"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card py-10 text-center text-muted">
          {products.length === 0 ? (
            <>
              <p className="text-lg font-semibold">Aún no tiene productos.</p>
              <p className="mt-1">Toque “+ Nuevo” para agregar el primero.</p>
            </>
          ) : (
            <p className="text-lg">No se encontró nada con esa búsqueda.</p>
          )}
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((p) => {
            const low = p.stock <= p.minStock;
            return (
              <li key={p.id}>
                <Link
                  href={`/productos/${p.id}`}
                  className={`card flex items-center gap-3 active:bg-line/40 ${
                    low ? "border-2 border-danger/60" : ""
                  }`}
                >
                  {p.imageUrl ? (
                    <Image
                      src={p.imageUrl}
                      alt=""
                      width={56}
                      height={56}
                      className="h-14 w-14 shrink-0 rounded-xl object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-2xl">
                      📦
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{p.name}</p>
                    <p className="text-sm text-muted">
                      {p.categoryName ?? "Sin categoría"}
                    </p>
                    <p className={`text-sm font-semibold ${low ? "text-danger" : "text-muted"}`}>
                      {low ? "⚠️ " : ""}Quedan {formatQty(p.stock)} {p.unit}
                    </p>
                  </div>
                  <span className="text-lg font-bold">{formatCOP(p.salePrice)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
