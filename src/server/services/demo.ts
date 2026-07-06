import { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  DEMO_BUSINESS_NAME,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  DEMO_PRODUCTS,
  DEMO_SUPPLIERS,
} from "../demo-data";

type Db = PrismaClient | Prisma.TransactionClient;

/**
 * Crea o restaura por completo el negocio demo: borra ventas, entradas,
 * productos, categorías y proveedores del negocio demo y los vuelve a crear
 * desde DEMO_PRODUCTS. Se ejecuta en el seed y cada vez que alguien entra
 * con el botón "Probar demo", así el demo nunca afecta ni se mezcla con
 * datos de clientes reales.
 */
export async function resetDemoBusiness(db: Db): Promise<string> {
  let business = await db.business.findFirst({ where: { isDemo: true } });

  if (!business) {
    business = await db.business.create({
      data: { name: DEMO_BUSINESS_NAME, isDemo: true },
    });
  }

  const businessId = business.id;

  await db.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { businessId },
    create: {
      email: DEMO_EMAIL,
      name: "Doña Marta",
      passwordHash: await bcrypt.hash(DEMO_PASSWORD, 10),
      role: "ADMIN",
      businessId,
    },
  });

  // Limpieza total de datos del negocio demo (los onDelete: Cascade del
  // esquema se encargan de items de venta y de entrada).
  await db.sale.deleteMany({ where: { businessId } });
  await db.stockEntry.deleteMany({ where: { businessId } });
  await db.product.deleteMany({ where: { businessId } });
  await db.category.deleteMany({ where: { businessId } });
  await db.supplier.deleteMany({ where: { businessId } });

  const supplierIds = new Map<string, string>();
  for (const s of DEMO_SUPPLIERS) {
    const created = await db.supplier.create({
      data: { ...s, businessId },
    });
    supplierIds.set(s.name, created.id);
  }

  const categoryNames = [...new Set(DEMO_PRODUCTS.map((p) => p.category))];
  const categoryIds = new Map<string, string>();
  for (const name of categoryNames) {
    const created = await db.category.create({ data: { name, businessId } });
    categoryIds.set(name, created.id);
  }

  for (const p of DEMO_PRODUCTS) {
    await db.product.create({
      data: {
        name: p.name,
        barcode: p.barcode ?? null,
        purchasePrice: p.purchasePrice,
        salePrice: p.salePrice,
        stock: new Prisma.Decimal(p.stock),
        minStock: new Prisma.Decimal(p.minStock),
        unit: p.unit,
        businessId,
        categoryId: categoryIds.get(p.category) ?? null,
        supplierId: p.supplier ? supplierIds.get(p.supplier) ?? null : null,
      },
    });
  }

  return businessId;
}
