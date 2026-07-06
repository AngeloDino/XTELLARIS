import { prisma } from "../db";
import type { DashboardData } from "@/lib/types";
import { startOfTodayBogota } from "@/lib/dates";
import { topProductsOfWeek } from "./sales";

export async function getDashboardData(businessId: string): Promise<DashboardData> {
  const todayStart = startOfTodayBogota();

  const [products, todaySales, topWeekProducts] = await Promise.all([
    prisma.product.findMany({
      where: { businessId, active: true },
      select: { stock: true, minStock: true, purchasePrice: true, salePrice: true },
    }),
    prisma.sale.aggregate({
      where: { businessId, createdAt: { gte: todayStart } },
      _sum: { total: true },
      _count: true,
    }),
    topProductsOfWeek(businessId, 5),
  ]);

  let inventoryCostValue = 0;
  let inventorySaleValue = 0;
  let lowStockCount = 0;
  for (const p of products) {
    const stock = p.stock.toNumber();
    inventoryCostValue += stock * p.purchasePrice;
    inventorySaleValue += stock * p.salePrice;
    if (p.stock.lte(p.minStock)) lowStockCount++;
  }

  return {
    inventoryCostValue: Math.round(inventoryCostValue),
    inventorySaleValue: Math.round(inventorySaleValue),
    lowStockCount,
    todaySalesTotal: todaySales._sum.total ?? 0,
    todaySalesCount: todaySales._count,
    topWeekProducts,
  };
}
