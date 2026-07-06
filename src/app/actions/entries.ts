"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/server/auth";
import { stockEntrySchema } from "@/lib/validations";
import type { ActionResult } from "@/lib/types";
import { createStockEntry, EntryError } from "@/server/services/entries";

export async function createEntryAction(raw: unknown): Promise<ActionResult> {
  const { businessId } = await requireSession();
  const parsed = stockEntrySchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.errors[0]?.message ?? "Datos inválidos" };
  }
  try {
    await createStockEntry(businessId, parsed.data);
    revalidatePath("/");
    revalidatePath("/entradas");
    revalidatePath("/productos");
    revalidatePath("/vender");
    revalidatePath("/alertas");
    return { ok: true, message: "Entrada registrada. El stock fue actualizado." };
  } catch (e) {
    if (e instanceof EntryError) return { ok: false, message: e.message };
    throw e;
  }
}
