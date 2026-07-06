import { Prisma } from "@prisma/client";
import { prisma } from "../db";
import type { SaleDTO } from "@/lib/types";
import type { SaleInput } from "@/lib/validations";
import { startOfDaysAgoBogota } from "@/lib/dates";

export class SaleError extends Error {}

/**
 * Registra una venta: valida existencias, descuenta stock y guarda la venta
 * con precios y costos congelados al momento de la operación.
 * Todo dentro de una transacción para que el stock nunca quede inconsistente.
 */
export async function createSale(
  businessId: string,
  userId: string,
  input: SaleInput
): Promise<SaleDTO> {
  return prisma.$transaction(async (tx) => {
    const productIds = input.items.map((i) => i.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds }, businessId, active: true },
    });
    const byId = new Map(products.map((p) => [p.id, p]));

    let total = 0;
    const itemsData: Prisma.SaleItemCreateWithoutSaleInput[] = [];

    for (const item of input.items) {
      const product = byId.get(item.productId);
      if (!product) throw new SaleError("Un producto de la venta ya no existe.");

      const qty = new Prisma.Decimal(item.quantity);
      if (product.stock.lt(qty)) {
        throw new SaleError(
          `Stock insuficiente de "${product.name}": quedan ${product.stock.toString()} ${product.unit}.`
        );
      }

      const subtotal = Math.round(product.salePrice * item.quantity);
      total += subtotal;
      itemsData.push({
        product: { connect: { id: product.id } },
        quantity: qty,
        unitPrice: product.salePrice,
        unitCost: product.purchasePrice,
        subtotal,
      });

      // Descuento condicionado al stock disponible: si otra venta simultánea
      // ya lo consumió, count === 0 y la transacción se revierte.
      const updated = await tx.product.updateMany({
        where: { id: product.id, businessId, stock: { gte: qty } },
        data: { stock: { decrement: qty } },
      });
      if (updated.count === 0) {
        throw new SaleError(`Stock insuficiente de "${product.name}".`);
      }
    }

    if (input.paidWith != null && input.paidWith < total) {
      throw new SaleError("El valor pagado es menor que el total.");
    }
    const change = input.paidWith != null ? input.paidWith - total : null;

    const sale = await tx.sale.create({
      data: {
        businessId,
        userId,
        total,
        paidWith: input.paidWith ?? null,
        change,
        items: { create: itemsData },
      },
      include: {
        items: { include: { product: { select: { name: true, unit: true } } } },
        user: { select: { name: true } },
      },
    });

    return {
      id: sale.id,
      total: sale.total,
      paidWith: sale.paidWith,
      change: sale.change,
      createdAt: sale.createdAt.toISOString(),
      userName: sale.user?.name ?? null,
      items: sale.items.map((i) => ({
        productId: i.productId,
        productName: i.product.name,
        quantity: i.quantity.toNumber(),
        unit: i.product.unit,
        unitPrice: i.unitPrice,
        subtotal: i.subtotal,
      })),
    };
  });
}

export async function listRecentSales(businessId: string, limit = 20): Promise<SaleDTO[]> {
  const sales = await prisma.sale.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      items: { include: { product: { select: { name: true, unit: true } } } },
      user: { select: { name: true } },
    },
  });
  return sales.map((sale) => ({
    id: sale.id,
    total: sale.total,
    paidWith: sale.paidWith,
    change: sale.change,
    createdAt: sale.createdAt.toISOString(),
    userName: sale.user?.name ?? null,
    items: sale.items.map((i) => ({
      productId: i.productId,
      productName: i.product.name,
      quantity: i.quantity.toNumber(),
      unit: i.product.unit,
      unitPrice: i.unitPrice,
      subtotal: i.subtotal,
    })),
  }));
}

/** Top de productos más vendidos en los últimos 7 días. */
export async function topProductsOfWeek(businessId: string, limit = 5) {
  const since = startOfDaysAgoBogota(6);
  const items = await prisma.saleItem.findMany({
    where: { sale: { businessId, createdAt: { gte: since } } },
    include: { product: { select: { name: true, unit: true } } },
  });

  const grouped = new Map<string, { productId: string; name: string; unit: string; quantity: number; total: number }>();
  for (const item of items) {
    const entry = grouped.get(item.productId) ?? {
      productId: item.productId,
      name: item.product.name,
      unit: item.product.unit,
      quantity: 0,
      total: 0,
    };
    entry.quantity += item.quantity.toNumber();
    entry.total += item.subtotal;
    grouped.set(item.productId, entry);
  }

  return [...grouped.values()].sort((a, b) => b.total - a.total).slice(0, limit);
}
