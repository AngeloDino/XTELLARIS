import { Prisma } from "@prisma/client";
import { prisma } from "../db";
import type { StockEntryDTO } from "@/lib/types";
import type { StockEntryInput } from "@/lib/validations";

export class EntryError extends Error {}

/**
 * Registra una entrada de mercancía: aumenta el stock de cada producto y
 * actualiza su precio de compra al costo más reciente (para que los
 * márgenes reflejen la realidad).
 */
export async function createStockEntry(
  businessId: string,
  input: StockEntryInput
): Promise<StockEntryDTO> {
  return prisma.$transaction(async (tx) => {
    let supplierId: string | null = null;
    if (input.supplierId) {
      const supplier = await tx.supplier.findFirst({
        where: { id: input.supplierId, businessId },
      });
      if (!supplier) throw new EntryError("El proveedor no existe.");
      supplierId = supplier.id;
    }

    const productIds = input.items.map((i) => i.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds }, businessId, active: true },
    });
    const byId = new Map(products.map((p) => [p.id, p]));

    let totalCost = 0;
    for (const item of input.items) {
      const product = byId.get(item.productId);
      if (!product) throw new EntryError("Un producto de la entrada ya no existe.");

      totalCost += Math.round(item.unitCost * item.quantity);
      await tx.product.update({
        where: { id: product.id },
        data: {
          stock: { increment: new Prisma.Decimal(item.quantity) },
          purchasePrice: item.unitCost,
        },
      });
    }

    const entry = await tx.stockEntry.create({
      data: {
        businessId,
        supplierId,
        totalCost,
        items: {
          create: input.items.map((i) => ({
            product: { connect: { id: i.productId } },
            quantity: new Prisma.Decimal(i.quantity),
            unitCost: i.unitCost,
          })),
        },
      },
      include: {
        supplier: { select: { name: true } },
        items: { include: { product: { select: { name: true, unit: true } } } },
      },
    });

    return {
      id: entry.id,
      totalCost: entry.totalCost,
      createdAt: entry.createdAt.toISOString(),
      supplierName: entry.supplier?.name ?? null,
      items: entry.items.map((i) => ({
        productName: i.product.name,
        quantity: i.quantity.toNumber(),
        unit: i.product.unit,
        unitCost: i.unitCost,
      })),
    };
  });
}

export async function listRecentEntries(businessId: string, limit = 20): Promise<StockEntryDTO[]> {
  const entries = await prisma.stockEntry.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      supplier: { select: { name: true } },
      items: { include: { product: { select: { name: true, unit: true } } } },
    },
  });
  return entries.map((entry) => ({
    id: entry.id,
    totalCost: entry.totalCost,
    createdAt: entry.createdAt.toISOString(),
    supplierName: entry.supplier?.name ?? null,
    items: entry.items.map((i) => ({
      productName: i.product.name,
      quantity: i.quantity.toNumber(),
      unit: i.product.unit,
      unitCost: i.unitCost,
    })),
  }));
}
