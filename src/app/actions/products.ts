"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/server/auth";
import { productSchema } from "@/lib/validations";
import type { ActionResult } from "@/lib/types";
import {
  createProduct,
  deactivateProduct,
  updateProduct,
} from "@/server/services/products";

function revalidateProductPages() {
  revalidatePath("/productos");
  revalidatePath("/vender");
  revalidatePath("/alertas");
  revalidatePath("/");
}

export async function createProductAction(raw: unknown): Promise<ActionResult> {
  const { businessId } = await requireSession();
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.errors[0]?.message ?? "Datos inválidos" };
  }
  await createProduct(businessId, parsed.data);
  revalidateProductPages();
  return { ok: true, message: "Producto guardado" };
}

export async function updateProductAction(id: string, raw: unknown): Promise<ActionResult> {
  const { businessId } = await requireSession();
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.errors[0]?.message ?? "Datos inválidos" };
  }
  const updated = await updateProduct(businessId, id, parsed.data);
  if (!updated) return { ok: false, message: "El producto no existe" };
  revalidateProductPages();
  return { ok: true, message: "Cambios guardados" };
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  const { businessId } = await requireSession();
  const ok = await deactivateProduct(businessId, id);
  if (!ok) return { ok: false, message: "El producto no existe" };
  revalidateProductPages();
  return { ok: true, message: "Producto eliminado" };
}
