import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSession } from "@/server/auth";
import { getBusiness } from "@/server/services/business";
import { getProduct, listCategories } from "@/server/services/products";
import { listSuppliers } from "@/server/services/suppliers";
import { ProductForm } from "../ProductForm";

export const metadata: Metadata = { title: "Editar producto — Xtellaris" };
export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const { businessId } = await requireSession();
  const [product, business, categories, suppliers] = await Promise.all([
    getProduct(businessId, params.id),
    getBusiness(businessId),
    listCategories(businessId),
    listSuppliers(businessId),
  ]);

  if (!product) notFound();

  return (
    <ProductForm
      product={product}
      categories={categories}
      suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
      units={business?.units ?? ["unidad"]}
    />
  );
}
