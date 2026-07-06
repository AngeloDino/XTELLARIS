import { prisma } from "../db";
import type { SupplierDTO } from "@/lib/types";
import type { SupplierInput } from "@/lib/validations";

export async function listSuppliers(businessId: string): Promise<SupplierDTO[]> {
  const suppliers = await prisma.supplier.findMany({
    where: { businessId },
    orderBy: { name: "asc" },
    include: {
      products: {
        where: { active: true },
        select: { name: true },
        orderBy: { name: "asc" },
      },
    },
  });
  return suppliers.map((s) => ({
    id: s.id,
    name: s.name,
    phone: s.phone,
    notes: s.notes,
    productCount: s.products.length,
    productNames: s.products.map((p) => p.name),
  }));
}

export async function createSupplier(businessId: string, input: SupplierInput): Promise<void> {
  await prisma.supplier.create({
    data: {
      businessId,
      name: input.name,
      phone: input.phone || null,
      notes: input.notes || null,
    },
  });
}

export async function updateSupplier(
  businessId: string,
  id: string,
  input: SupplierInput
): Promise<boolean> {
  const result = await prisma.supplier.updateMany({
    where: { id, businessId },
    data: {
      name: input.name,
      phone: input.phone || null,
      notes: input.notes || null,
    },
  });
  return result.count > 0;
}

export async function deleteSupplier(businessId: string, id: string): Promise<boolean> {
  // Los productos asociados quedan sin proveedor (onDelete: SetNull).
  const result = await prisma.supplier.deleteMany({ where: { id, businessId } });
  return result.count > 0;
}
