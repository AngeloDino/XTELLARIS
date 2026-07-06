import Link from "next/link";
import type { Metadata } from "next";
import { requireSession } from "@/server/auth";
import { getMarginReport, getSalesReport, getSalesTrend } from "@/server/services/reports";
import type { ReportPeriod } from "@/lib/types";
import { formatCOP, formatQty } from "@/lib/format";
import { TrendChart } from "@/components/TrendChart";
import { PrintButton } from "@/components/PrintButton";

export const metadata: Metadata = { title: "Reportes — Xtellaris" };
export const dynamic = "force-dynamic";

const PERIODS: { value: ReportPeriod; label: string }[] = [
  { value: "dia", label: "Por día" },
  { value: "semana", label: "Por semana" },
  { value: "mes", label: "Por mes" },
];

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { periodo?: string };
}) {
  const { businessId } = await requireSession();
  const period: ReportPeriod = PERIODS.some((p) => p.value === searchParams.periodo)
    ? (searchParams.periodo as ReportPeriod)
    : "dia";

  const [salesReport, marginReport, trend] = await Promise.all([
    getSalesReport(businessId, period),
    getMarginReport(businessId),
    getSalesTrend(businessId, 14),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Reportes</h1>
        <PrintButton />
      </div>

      <section className="card">
        <h2 className="mb-2 text-lg font-bold">Tendencia de ventas (últimos 14 días)</h2>
        <TrendChart points={trend} />
      </section>

      <section className="flex flex-col gap-3">
        <div className="no-print flex gap-2">
          {PERIODS.map((p) => (
            <Link
              key={p.value}
              href={`/reportes?periodo=${p.value}`}
              className={`flex-1 rounded-full border-2 px-4 py-2.5 text-center font-semibold ${
                period === p.value
                  ? "border-brand bg-brand text-brand-ink"
                  : "border-line bg-surface text-muted"
              }`}
            >
              {p.label}
            </Link>
          ))}
        </div>

        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line text-sm text-muted">
                <th className="px-4 py-3 font-semibold">Periodo</th>
                <th className="px-4 py-3 text-right font-semibold">Ventas</th>
                <th className="px-4 py-3 text-right font-semibold">Total</th>
                <th className="px-4 py-3 text-right font-semibold">Ganancia</th>
              </tr>
            </thead>
            <tbody>
              {salesReport.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted">
                    Sin ventas en este periodo todavía.
                  </td>
                </tr>
              ) : (
                salesReport.map((row) => (
                  <tr key={row.key} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-semibold capitalize">{row.label}</td>
                    <td className="px-4 py-3 text-right">{row.salesCount}</td>
                    <td className="px-4 py-3 text-right font-bold">{formatCOP(row.total)}</td>
                    <td className="px-4 py-3 text-right font-bold text-success">
                      {formatCOP(row.profit)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Margen por producto (últimos 30 días)</h2>
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line text-sm text-muted">
                <th className="px-4 py-3 font-semibold">Producto</th>
                <th className="px-4 py-3 text-right font-semibold">Vendido</th>
                <th className="px-4 py-3 text-right font-semibold">Ganancia</th>
                <th className="px-4 py-3 text-right font-semibold">Margen</th>
              </tr>
            </thead>
            <tbody>
              {marginReport.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted">
                    Cuando registre ventas, aquí verá qué producto le deja más ganancia.
                  </td>
                </tr>
              ) : (
                marginReport.map((row) => (
                  <tr key={row.productId} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{row.name}</p>
                      <p className="text-sm text-muted">
                        {formatQty(row.quantitySold)} {row.unit} · {formatCOP(row.revenue)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">{formatQty(row.quantitySold)}</td>
                    <td className="px-4 py-3 text-right font-bold text-success">
                      {formatCOP(row.profit)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold">
                      {row.marginPct.toFixed(0)}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
