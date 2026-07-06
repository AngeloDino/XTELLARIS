"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/server/auth";
import { supplierSchema } from "@/lib/validations";
import type { ActionResult } from "@/lib/types";
import {
  createSupplier,
  deleteSupplier,
  updateSupplier,
} from "@/server/services/suppliers";

export async function createSupplierAction(raw: unknown): Promise<ActionResult> {
  const { businessId } = await requireSession();
  const parsed = supplierSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.errors[0]?.message ?? "Datos inválidos" };
  }
  await createSupplier(businessId, parsed.data);
  revalidatePath("/proveedores");
  return { ok: true, message: "Proveedor guardado" };
}

export async function updateSupplierAction(id: string, raw: unknown): Promise<ActionResult> {
  const { businessId } = await requireSession();
  const parsed = supplierSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.errors[0]?.message ?? "Datos inválidos" };
  }
  const ok = await updateSupplier(businessId, id, parsed.data);
  if (!ok) return { ok: false, message: "El proveedor no existe" };
  revalidatePath("/proveedores");
  return { ok: true, message: "Cambios guardados" };
}

export async function deleteSupplierAction(id: string): Promise<ActionResult> {
  const { businessId } = await requireSession();
  const ok = await deleteSupplier(businessId, id);
  if (!ok) return { ok: false, message: "El proveedor no existe" };
  revalidatePath("/proveedores");
  revalidatePath("/productos");
  return { ok: true, message: "Proveedor eliminado" };
}
