import { prisma } from "../db";
import type { MarginReportRow, ReportPeriod, SalesReportRow, TrendPoint } from "@/lib/types";
import { bogotaDayKey, bogotaDayLabel, startOfDaysAgoBogota } from "@/lib/dates";

const PERIOD_DAYS: Record<ReportPeriod, number> = {
  dia: 13, // últimos 14 días, agrupados por día
  semana: 55, // últimas 8 semanas
  mes: 364, // últimos 12 meses
};

function groupKeyAndLabel(date: Date, period: ReportPeriod): { key: string; label: string } {
  const dayKey = bogotaDayKey(date); // YYYY-MM-DD en Bogotá
  if (period === "dia") {
    return { key: dayKey, label: bogotaDayLabel(date) };
  }
  if (period === "semana") {
    // Agrupa por lunes de la semana correspondiente.
    const d = new Date(`${dayKey}T00:00:00Z`);
    const weekday = (d.getUTCDay() + 6) % 7; // lunes = 0
    d.setUTCDate(d.getUTCDate() - weekday);
    const key = d.toISOString().slice(0, 10);
    const label = `Sem. del ${new Intl.DateTimeFormat("es-CO", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }).format(d)}`;
    return { key, label };
  }
  const key = dayKey.slice(0, 7); // YYYY-MM
  const label = new Intl.DateTimeFormat("es-CO", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${key}-15T00:00:00Z`));
  return { key, label };
}

/** Ventas agrupadas por día, semana o mes, con utilidad de cada grupo. */
export async function getSalesReport(
  businessId: string,
  period: ReportPeriod
): Promise<SalesReportRow[]> {
  const since = startOfDaysAgoBogota(PERIOD_DAYS[period]);
  const sales = await prisma.sale.findMany({
    where: { businessId, createdAt: { gte: since } },
    include: { items: { select: { subtotal: true, unitCost: true, quantity: true } } },
    orderBy: { createdAt: "asc" },
  });

  const rows = new Map<string, SalesReportRow>();
  for (const sale of sales) {
    const { key, label } = groupKeyAndLabel(sale.createdAt, period);
    const row = rows.get(key) ?? { key, label, salesCount: 0, total: 0, profit: 0 };
    row.salesCount++;
    row.total += sale.total;
    for (const item of sale.items) {
      row.profit += item.subtotal - Math.round(item.unitCost * item.quantity.toNumber());
    }
    rows.set(key, row);
  }

  return [...rows.values()].sort((a, b) => b.key.localeCompare(a.key));
}

/** Margen de ganancia por producto en los últimos 30 días. */
export async function getMarginReport(businessId: string): Promise<MarginReportRow[]> {
  const since = startOfDaysAgoBogota(29);
  const items = await prisma.saleItem.findMany({
    where: { sale: { businessId, createdAt: { gte: since } } },
    include: { product: { select: { name: true, unit: true } } },
  });

  const rows = new Map<string, MarginReportRow>();
  for (const item of items) {
    const row = rows.get(item.productId) ?? {
      productId: item.productId,
      name: item.product.name,
      unit: item.product.unit,
      quantitySold: 0,
      revenue: 0,
      cost: 0,
      profit: 0,
      marginPct: 0,
    };
    const qty = item.quantity.toNumber();
    row.quantitySold += qty;
    row.revenue += item.subtotal;
    row.cost += Math.round(item.unitCost * qty);
    rows.set(item.productId, row);
  }

  return [...rows.values()]
    .map((row) => ({
      ...row,
      profit: row.revenue - row.cost,
      marginPct: row.revenue > 0 ? ((row.revenue - row.cost) / row.revenue) * 100 : 0,
    }))
    .sort((a, b) => b.profit - a.profit);
}

/** Total vendido por día en los últimos 14 días, para la gráfica de tendencia. */
export async function getSalesTrend(businessId: string, days = 14): Promise<TrendPoint[]> {
  const since = startOfDaysAgoBogota(days - 1);
  const sales = await prisma.sale.findMany({
    where: { businessId, createdAt: { gte: since } },
    select: { total: true, createdAt: true },
  });

  const totals = new Map<string, number>();
  for (const sale of sales) {
    const key = bogotaDayKey(sale.createdAt);
    totals.set(key, (totals.get(key) ?? 0) + sale.total);
  }

  const points: TrendPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = startOfDaysAgoBogota(i);
    points.push({
      label: bogotaDayLabel(date),
      total: totals.get(bogotaDayKey(date)) ?? 0,
    });
  }
  return points;
}
