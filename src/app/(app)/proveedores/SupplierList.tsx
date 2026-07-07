"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SupplierDTO } from "@/lib/types";
import { supplierSchema, toWhatsAppNumber } from "@/lib/validations";
import {
  createSupplierAction,
  deleteSupplierAction,
  updateSupplierAction,
} from "@/app/actions/suppliers";
import { MessageIcon } from "@/components/Icons";

export function SupplierList({ suppliers }: { suppliers: SupplierDTO[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<SupplierDTO | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const parsed = supplierSchema.safeParse({
      name: form.get("name"),
      phone: form.get("phone"),
      notes: form.get("notes"),
    });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Revise los datos");
      return;
    }

    setSaving(true);
    const result =
      editing === "new"
        ? await createSupplierAction(parsed.data)
        : await updateSupplierAction((editing as SupplierDTO).id, parsed.data);
    setSaving(false);

    if (!result.ok) {
      setError(result.message ?? "No se pudo guardar");
      return;
    }
    setEditing(null);
    router.refresh();
  }

  async function handleDelete(supplier: SupplierDTO) {
    if (!confirm(`¿Eliminar a "${supplier.name}"? Sus productos quedarán sin proveedor.`)) return;
    setSaving(true);
    await deleteSupplierAction(supplier.id);
    setSaving(false);
    setEditing(null);
    router.refresh();
  }

  if (editing) {
    const supplier = editing === "new" ? null : editing;
    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">
          {supplier ? "Editar proveedor" : "Nuevo proveedor"}
        </h1>

        <div className="card flex flex-col gap-4">
          <div>
            <label htmlFor="name" className="label">Nombre *</label>
            <input
              id="name"
              name="name"
              required
              defaultValue={supplier?.name}
              placeholder="Ej: Distribuidora El Surtidor"
              className="field"
            />
          </div>
          <div>
            <label htmlFor="phone" className="label">Teléfono / WhatsApp</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              defaultValue={supplier?.phone ?? ""}
              placeholder="Ej: 310 123 4567"
              className="field"
            />
          </div>
          <div>
            <label htmlFor="notes" className="label">Notas</label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={supplier?.notes ?? ""}
              placeholder="Ej: pasa los martes, pedido mínimo $100.000…"
              className="field py-3"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 font-semibold text-danger">
            {error}
          </p>
        )}

        <button type="submit" disabled={saving} className="btn-primary text-lg">
          {saving ? "Guardando…" : "Guardar"}
        </button>
        <button type="button" onClick={() => setEditing(null)} className="btn-secondary">
          Cancelar
        </button>
        {supplier && (
          <button
            type="button"
            onClick={() => handleDelete(supplier)}
            disabled={saving}
            className="btn-danger"
          >
            Eliminar proveedor
          </button>
        )}
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Proveedores</h1>
        <button type="button" onClick={() => setEditing("new")} className="btn-primary">
          + Nuevo
        </button>
      </div>

      {suppliers.length === 0 ? (
        <div className="card py-10 text-center text-muted">
          <p className="text-lg font-semibold">Aún no tiene proveedores.</p>
          <p className="mt-1">Agréguelos para pedirles por WhatsApp con un toque.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {suppliers.map((s) => {
            const wa = s.phone ? toWhatsAppNumber(s.phone) : null;
            return (
              <li key={s.id} className="card flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(s)}
                  className="text-left"
                >
                  <p className="text-lg font-bold">{s.name}</p>
                  {s.phone && <p className="text-muted">{s.phone}</p>}
                  {s.notes && <p className="text-sm text-muted">{s.notes}</p>}
                  <p className="mt-1 text-sm text-muted">
                    {s.productCount === 0
                      ? "Sin productos asociados"
                      : `${s.productCount} producto${s.productCount === 1 ? "" : "s"}: ${s.productNames
                          .slice(0, 3)
                          .join(", ")}${s.productCount > 3 ? "…" : ""}`}
                  </p>
                </button>
                {wa && (
                  <a
                    href={`https://wa.me/${wa}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn inline-flex bg-[#25D366] text-white active:opacity-85"
                  >
                    <MessageIcon size={20} />
                    Escribir por WhatsApp
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
