import { Prisma } from "@prisma/client";
import { prisma } from "../db";
import type { ProductDTO, CategoryDTO, RestockSuggestion } from "@/lib/types";
import type { ProductInput } from "@/lib/validations";

const productInclude = {
  category: { select: { name: true } },
  supplier: { select: { name: true } },
} satisfies Prisma.ProductInclude;

type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

function toDTO(p: ProductWithRelations): ProductDTO {
  return {
    id: p.id,
    name: p.name,
    barcode: p.barcode,
    purchasePrice: p.purchasePrice,
    salePrice: p.salePrice,
    stock: p.stock.toNumber(),
    minStock: p.minStock.toNumber(),
    unit: p.unit,
    imageUrl: p.imageUrl,
    categoryId: p.categoryId,
    categoryName: p.category?.name ?? null,
    supplierId: p.supplierId,
    supplierName: p.supplier?.name ?? null,
  };
}

export async function listProducts(businessId: string): Promise<ProductDTO[]> {
  const products = await prisma.product.findMany({
    where: { businessId, active: true },
    include: productInclude,
    orderBy: { name: "asc" },
  });
  return products.map(toDTO);
}

export async function getProduct(businessId: string, id: string): Promise<ProductDTO | null> {
  const p = await prisma.product.findFirst({
    where: { id, businessId, active: true },
    include: productInclude,
  });
  return p ? toDTO(p) : null;
}

export async function listCategories(businessId: string): Promise<CategoryDTO[]> {
  const categories = await prisma.category.findMany({
    where: { businessId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return categories;
}

/**
 * Resuelve la categoría de un producto: usa la existente (verificando que
 * pertenezca al negocio) o crea una nueva si vino newCategory.
 */
async function resolveCategoryId(businessId: string, input: ProductInput): Promise<string | null> {
  if (input.newCategory) {
    const category = await prisma.category.upsert({
      where: { businessId_name: { businessId, name: input.newCategory } },
      update: {},
      create: { businessId, name: input.newCategory },
    });
    return category.id;
  }
  if (input.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: input.categoryId, businessId },
    });
    return category?.id ?? null;
  }
  return null;
}

async function resolveSupplierId(businessId: string, supplierId?: string): Promise<string | null> {
  if (!supplierId) return null;
  const supplier = await prisma.supplier.findFirst({ where: { id: supplierId, businessId } });
  return supplier?.id ?? null;
}

export async function createProduct(businessId: string, input: ProductInput): Promise<ProductDTO> {
  const [categoryId, supplierId] = await Promise.all([
    resolveCategoryId(businessId, input),
    resolveSupplierId(businessId, input.supplierId || undefined),
  ]);
  const p = await prisma.product.create({
    data: {
      businessId,
      name: input.name,
      barcode: input.barcode || null,
      purchasePrice: input.purchasePrice,
      salePrice: input.salePrice,
      stock: new Prisma.Decimal(input.stock),
      minStock: new Prisma.Decimal(input.minStock),
      unit: input.unit,
      imageUrl: input.imageUrl || null,
      categoryId,
      supplierId,
    },
    include: productInclude,
  });
  return toDTO(p);
}

export async function updateProduct(
  businessId: string,
  id: string,
  input: ProductInput
): Promise<ProductDTO | null> {
  const existing = await prisma.product.findFirst({ where: { id, businessId } });
  if (!existing) return null;

  const [categoryId, supplierId] = await Promise.all([
    resolveCategoryId(businessId, input),
    resolveSupplierId(businessId, input.supplierId || undefined),
  ]);
  const p = await prisma.product.update({
    where: { id },
    data: {
      name: input.name,
      barcode: input.barcode || null,
      purchasePrice: input.purchasePrice,
      salePrice: input.salePrice,
      stock: new Prisma.Decimal(input.stock),
      minStock: new Prisma.Decimal(input.minStock),
      unit: input.unit,
      imageUrl: input.imageUrl || null,
      categoryId,
      supplierId,
    },
    include: productInclude,
  });
  return toDTO(p);
}

/**
 * Borrado suave: el producto deja de aparecer pero su historial de ventas
 * y entradas se conserva para los reportes.
 */
export async function deactivateProduct(businessId: string, id: string): Promise<boolean> {
  const result = await prisma.product.updateMany({
    where: { id, businessId },
    data: { active: false },
  });
  return result.count > 0;
}

/** Productos en o por debajo del stock mínimo, con cantidad sugerida. */
export async function getRestockSuggestions(businessId: string): Promise<RestockSuggestion[]> {
  const products = await prisma.product.findMany({
    where: { businessId, active: true },
    include: productInclude,
  });
  return products
    .filter((p) => p.stock.lte(p.minStock))
    .map((p) => {
      const dto = toDTO(p);
      // Sugerencia: reponer hasta el doble del mínimo (colchón de seguridad).
      const target = dto.minStock * 2;
      return { product: dto, suggestedQty: Math.max(target - dto.stock, 1) };
    })
    .sort((a, b) => a.product.stock - b.product.stock);
}
