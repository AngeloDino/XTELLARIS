import type { Metadata } from "next";
import { requireSession } from "@/server/auth";
import { getBusiness } from "@/server/services/business";
import { listCategories } from "@/server/services/products";
import { listSuppliers } from "@/server/services/suppliers";
import { ProductForm } from "../ProductForm";

export const metadata: Metadata = { title: "Nuevo producto — Xtellaris" };
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const { businessId } = await requireSession();
  const [business, categories, suppliers] = await Promise.all([
    getBusiness(businessId),
    listCategories(businessId),
    listSuppliers(businessId),
  ]);

  return (
    <ProductForm
      categories={categories}
      suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
      units={business?.units ?? ["unidad"]}
    />
  );
}
