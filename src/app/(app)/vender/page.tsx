import type { Metadata } from "next";
import { requireSession } from "@/server/auth";
import { listProducts } from "@/server/services/products";
import { PosScreen } from "./PosScreen";

export const metadata: Metadata = { title: "Vender — Xtellaris" };
export const dynamic = "force-dynamic";

export default async function SellPage() {
  const { businessId } = await requireSession();
  const products = await listProducts(businessId);
  return <PosScreen products={products} />;
}
