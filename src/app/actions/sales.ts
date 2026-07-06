"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/server/auth";
import { saleSchema } from "@/lib/validations";
import type { ActionResult } from "@/lib/types";
import { createSale, SaleError } from "@/server/services/sales";

export async function createSaleAction(raw: unknown): Promise<ActionResult> {
  const { businessId, userId } = await requireSession();
  const parsed = saleSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.errors[0]?.message ?? "Datos inválidos" };
  }
  try {
    const sale = await createSale(businessId, userId, parsed.data);
    revalidatePath("/");
    revalidatePath("/vender");
    revalidatePath("/productos");
    revalidatePath("/alertas");
    revalidatePath("/reportes");
    return {
      ok: true,
      message: "Venta registrada",
      data: { total: sale.total, change: sale.change, saleId: sale.id },
    };
  } catch (e) {
    if (e instanceof SaleError) return { ok: false, message: e.message };
    throw e;
  }
}
