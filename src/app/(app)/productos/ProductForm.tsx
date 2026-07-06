"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CategoryDTO, ProductDTO, SupplierDTO, ActionResult } from "@/lib/types";
import { productSchema } from "@/lib/validations";
import {
  createProductAction,
  deleteProductAction,
  updateProductAction,
} from "@/app/actions/products";
import { MoneyInput } from "@/components/MoneyInput";

/**
 * Comprime la foto en el navegador a máx. 256px JPEG y la devuelve como
 * data-URL, para guardarla en la base de datos sin necesitar almacenamiento
 * de archivos externo.
 */
async function compressImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const max = 256;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas no disponible");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.8);
}

interface Props {
  product?: ProductDTO;
  categories: CategoryDTO[];
  suppliers: Pick<SupplierDTO, "id" | "name">[];
  units: string[];
}

export function ProductForm({ product, categories, suppliers, units }: Props) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const [purchasePrice, setPurchasePrice] = useState(product?.purchasePrice ?? 0);
  const [salePrice, setSalePrice] = useState(product?.salePrice ?? 0);
  const [showNewCategory, setShowNewCategory] = useState(false);

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setImageUrl(await compressImage(file));
    } catch {
      setError("No se pudo procesar la foto.");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const parsed = productSchema.safeParse({
      name: form.get("name"),
      categoryId: showNewCategory ? "" : form.get("categoryId"),
      newCategory: showNewCategory ? form.get("newCategory") : "",
      barcode: form.get("barcode"),
      purchasePrice,
      salePrice,
      stock: form.get("stock"),
      minStock: form.get("minStock"),
      unit: form.get("unit"),
      supplierId: form.get("supplierId"),
      imageUrl,
    });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Revise los datos");
      return;
    }
    if (parsed.data.salePrice < parsed.data.purchasePrice) {
      setError("Ojo: el precio de venta es menor que el de compra. Corríjalo si fue un error.");
    }

    setSaving(true);
    const result: ActionResult = isEdit
      ? await updateProductAction(product!.id, parsed.data)
      : await createProductAction(parsed.data);
    setSaving(false);

    if (!result.ok) {
      setError(result.message ?? "No se pudo guardar");
      return;
    }
    router.push("/productos");
    router.refresh();
  }

  async function handleDelete() {
    if (!product) return;
    if (!confirm(`¿Eliminar "${product.name}"? Dejará de aparecer en la lista, pero sus ventas pasadas se conservan.`)) {
      return;
    }
    setSaving(true);
    const result = await deleteProductAction(product.id);
    setSaving(false);
    if (!result.ok) {
      setError(result.message ?? "No se pudo eliminar");
      return;
    }
    router.push("/productos");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">
        {isEdit ? "Editar producto" : "Nuevo producto"}
      </h1>

      <div className="card flex flex-col gap-4">
        <div>
          <label htmlFor="name" className="label">Nombre del producto *</label>
          <input
            id="name"
            name="name"
            required
            defaultValue={product?.name}
            placeholder="Ej: Arroz Diana x 500 g"
            className="field"
          />
        </div>

        <div>
          <label htmlFor="categoryId" className="label">Categoría</label>
          {showNewCategory ? (
            <div className="flex gap-2">
              <input
                id="newCategory"
                name="newCategory"
                placeholder="Nombre de la nueva categoría"
                className="field"
                autoFocus
              />
              <button
                type="button"
                className="btn-secondary shrink-0"
                onClick={() => setShowNewCategory(false)}
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <select
                id="categoryId"
                name="categoryId"
                defaultValue={product?.categoryId ?? ""}
                className="field"
              >
                <option value="">Sin categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button
                type="button"
                className="btn-secondary shrink-0"
                onClick={() => setShowNewCategory(true)}
              >
                + Nueva
              </button>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="barcode" className="label">Código de barras (opcional)</label>
          <input
            id="barcode"
            name="barcode"
            inputMode="numeric"
            defaultValue={product?.barcode ?? ""}
            placeholder="Ej: 7702511000123"
            className="field"
          />
        </div>
      </div>

      <div className="card flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="purchasePrice" className="label">Precio de compra *</label>
            <MoneyInput
              id="purchasePrice"
              value={purchasePrice}
              onChange={setPurchasePrice}
            />
          </div>
          <div>
            <label htmlFor="salePrice" className="label">Precio de venta *</label>
            <MoneyInput id="salePrice" value={salePrice} onChange={setSalePrice} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="stock" className="label">Stock actual *</label>
            <input
              id="stock"
              name="stock"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={product?.stock ?? 0}
              className="field"
              inputMode="decimal"
            />
          </div>
          <div>
            <label htmlFor="minStock" className="label">Stock mínimo (alerta) *</label>
            <input
              id="minStock"
              name="minStock"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={product?.minStock ?? 0}
              className="field"
              inputMode="decimal"
            />
          </div>
        </div>

        <div>
          <label htmlFor="unit" className="label">Unidad de medida *</label>
          <select id="unit" name="unit" defaultValue={product?.unit ?? units[0]} className="field">
            {units.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="supplierId" className="label">Proveedor (opcional)</label>
          <select
            id="supplierId"
            name="supplierId"
            defaultValue={product?.supplierId ?? ""}
            className="field"
          >
            <option value="">Sin proveedor</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <span className="label">Foto (opcional)</span>
          <div className="flex items-center gap-3">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Foto del producto"
                width={64}
                height={64}
                className="h-16 w-16 rounded-xl object-cover"
                unoptimized
              />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-brand/10 text-2xl">
                📦
              </span>
            )}
            <label className="btn-secondary cursor-pointer">
              {imageUrl ? "Cambiar foto" : "Tomar o elegir foto"}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhoto}
                className="hidden"
              />
            </label>
            {imageUrl && (
              <button type="button" className="text-danger underline" onClick={() => setImageUrl("")}>
                Quitar
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 font-semibold text-danger">
          {error}
        </p>
      )}

      <button type="submit" disabled={saving} className="btn-primary text-lg">
        {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Guardar producto"}
      </button>

      {isEdit && (
        <button type="button" onClick={handleDelete} disabled={saving} className="btn-danger">
          Eliminar producto
        </button>
      )}
    </form>
  );
}
