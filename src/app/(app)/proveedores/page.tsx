import type { Metadata } from "next";
import { requireSession } from "@/server/auth";
import { listSuppliers } from "@/server/services/suppliers";
import { SupplierList } from "./SupplierList";

export const metadata: Metadata = { title: "Proveedores — Xtellaris" };
export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const { businessId } = await requireSession();
  const suppliers = await listSuppliers(businessId);
  return <SupplierList suppliers={suppliers} />;
}
