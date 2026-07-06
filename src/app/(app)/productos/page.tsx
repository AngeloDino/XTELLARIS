import type { Metadata } from "next";
import { requireSession } from "@/server/auth";
import { listCategories, listProducts } from "@/server/services/products";
import { ProductList } from "./ProductList";

export const metadata: Metadata = { title: "Productos — Xtellaris" };
export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const { businessId } = await requireSession();
  const [products, categories] = await Promise.all([
    listProducts(businessId),
    listCategories(businessId),
  ]);

  return <ProductList products={products} categories={categories} />;
}
