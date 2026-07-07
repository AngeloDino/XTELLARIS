import Link from "next/link";
import type { Metadata } from "next";
import { requireSession } from "@/server/auth";
import { getDashboardData } from "@/server/services/dashboard";
import { formatCOP, formatQty } from "@/lib/format";
import {
  AlertIcon,
  CartIcon,
  ChartIcon,
  ChevronRightIcon,
  TruckIcon,
} from "@/components/Icons";

export const metadata: Metadata = { title: "Inicio — Xtellaris" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { businessId } = await requireSession();
  const data = await getDashboardData(businessId);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">¿Cómo va el negocio hoy?</h1>

      {data.lowStockCount > 0 && (
        <Link
          href="/alertas"
          className="card flex items-center gap-4 border-2 border-danger bg-danger/10"
        >
          <AlertIcon size={36} className="shrink-0 text-danger" />
          <div className="flex-1">
            <p className="text-lg font-bold text-danger">
              {data.lowStockCount === 1
                ? "1 producto con poco stock"
                : `${data.lowStockCount} productos con poco stock`}
            </p>
            <p className="text-sm text-muted">Toque aquí para ver qué debe pedir</p>
          </div>
          <ChevronRightIcon size={26} className="shrink-0 text-danger" />
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="card">
          <p className="text-sm font-semibold text-muted">Ventas de hoy</p>
          <p className="mt-1 text-2xl font-bold text-success">
            {formatCOP(data.todaySalesTotal)}
          </p>
          <p className="text-sm text-muted">
            {data.todaySalesCount === 1 ? "1 venta" : `${data.todaySalesCount} ventas`}
          </p>
        </div>
        <div className="card">
          <p className="text-sm font-semibold text-muted">Valor del inventario</p>
          <p className="mt-1 text-2xl font-bold">{formatCOP(data.inventoryCostValue)}</p>
          <p className="text-sm text-muted">
            Vendido vale {formatCOP(data.inventorySaleValue)}
          </p>
        </div>
      </div>

      <Link href="/vender" className="btn-primary py-5 text-2xl">
        <CartIcon size={28} />
        Vender ahora
      </Link>

      <section className="card">
        <h2 className="mb-3 text-lg font-bold">Lo más vendido esta semana</h2>
        {data.topWeekProducts.length === 0 ? (
          <p className="py-4 text-center text-muted">
            Todavía no hay ventas esta semana. Cuando venda, aquí verá sus productos estrella.
          </p>
        ) : (
          <ol className="flex flex-col divide-y divide-line">
            {data.topWeekProducts.map((p, i) => (
              <li key={p.productId} className="flex items-center gap-3 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/15 font-bold text-brand">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{p.name}</p>
                  <p className="text-sm text-muted">
                    {formatQty(p.quantity)} {p.unit}
                    {p.quantity !== 1 && p.unit === "unidad" ? "es" : ""} vendidas
                  </p>
                </div>
                <span className="font-bold">{formatCOP(p.total)}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/entradas" className="btn-secondary py-4">
          <TruckIcon size={22} />
          Llegó mercancía
        </Link>
        <Link href="/reportes" className="btn-secondary py-4">
          <ChartIcon size={22} />
          Ver reportes
        </Link>
      </div>
    </div>
  );
}
