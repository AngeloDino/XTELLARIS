import { z } from "zod";

// Esquemas Zod compartidos entre cliente y servidor.
// El servidor SIEMPRE revalida: nunca se confía en la validación del cliente.

export const productSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 letras").max(120),
  categoryId: z.string().trim().optional().or(z.literal("")),
  newCategory: z.string().trim().max(60).optional().or(z.literal("")),
  barcode: z.string().trim().max(64).optional().or(z.literal("")),
  purchasePrice: z.coerce
    .number({ invalid_type_error: "Precio inválido" })
    .int("El precio no lleva decimales")
    .min(0, "El precio no puede ser negativo")
    .max(1_000_000_000),
  salePrice: z.coerce
    .number({ invalid_type_error: "Precio inválido" })
    .int("El precio no lleva decimales")
    .min(0, "El precio no puede ser negativo")
    .max(1_000_000_000),
  stock: z.coerce.number().min(0, "El stock no puede ser negativo").max(1_000_000),
  minStock: z.coerce.number().min(0, "El stock mínimo no puede ser negativo").max(1_000_000),
  unit: z.string().trim().min(1, "Elija una unidad").max(30),
  supplierId: z.string().trim().optional().or(z.literal("")),
  // Foto opcional: data-URL comprimida en el cliente (máx ~300 KB) o URL http.
  imageUrl: z
    .string()
    .max(400_000, "La foto es demasiado grande")
    .refine((v) => v === "" || v.startsWith("data:image/") || v.startsWith("http"), "Foto inválida")
    .optional()
    .or(z.literal("")),
});

export type ProductInput = z.infer<typeof productSchema>;

export const saleSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().positive("La cantidad debe ser mayor a 0").max(100_000),
      })
    )
    .min(1, "Agregue al menos un producto"),
  paidWith: z.coerce.number().int().min(0).max(1_000_000_000).optional().nullable(),
});

export type SaleInput = z.infer<typeof saleSchema>;

export const stockEntrySchema = z.object({
  supplierId: z.string().trim().optional().or(z.literal("")),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().positive("La cantidad debe ser mayor a 0").max(100_000),
        unitCost: z.coerce.number().int("El costo no lleva decimales").min(0).max(1_000_000_000),
      })
    )
    .min(1, "Agregue al menos un producto"),
});

export type StockEntryInput = z.infer<typeof stockEntrySchema>;

export const supplierSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 letras").max(120),
  phone: z
    .string()
    .trim()
    .regex(/^[\d+\s-]*$/, "El teléfono solo puede tener números")
    .max(20)
    .optional()
    .or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export type SupplierInput = z.infer<typeof supplierSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Correo inválido"),
  password: z.string().min(1, "Escriba su contraseña"),
});

/** Normaliza un teléfono colombiano a formato wa.me (57XXXXXXXXXX). */
export function toWhatsAppNumber(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("57")) return digits;
  if (digits.length === 10) return `57${digits}`;
  return digits;
}
