// DTOs planos que la capa de servicios entrega a la UI.
// Los Decimal de Prisma se convierten a number aquí para que los datos
// puedan cruzar el límite servidor → cliente sin problemas de serialización.

export interface ProductDTO {
  id: string;
  name: string;
  barcode: string | null;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  unit: string;
  imageUrl: string | null;
  categoryId: string | null;
  categoryName: string | null;
  supplierId: string | null;
  supplierName: string | null;
}

export interface CategoryDTO {
  id: string;
  name: string;
}

export interface SupplierDTO {
  id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  productCount: number;
  productNames: string[];
}

export interface SaleItemDTO {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
}

export interface SaleDTO {
  id: string;
  total: number;
  paidWith: number | null;
  change: number | null;
  createdAt: string; // ISO
  userName: string | null;
  items: SaleItemDTO[];
}

export interface StockEntryDTO {
  id: string;
  totalCost: number;
  createdAt: string; // ISO
  supplierName: string | null;
  items: { productName: string; quantity: number; unit: string; unitCost: number }[];
}

export interface DashboardData {
  inventoryCostValue: number;
  inventorySaleValue: number;
  lowStockCount: number;
  todaySalesTotal: number;
  todaySalesCount: number;
  topWeekProducts: { productId: string; name: string; unit: string; quantity: number; total: number }[];
}

export interface RestockSuggestion {
  product: ProductDTO;
  suggestedQty: number;
}

export type ReportPeriod = "dia" | "semana" | "mes";

export interface SalesReportRow {
  key: string;
  label: string;
  salesCount: number;
  total: number;
  profit: number;
}

export interface MarginReportRow {
  productId: string;
  name: string;
  unit: string;
  quantitySold: number;
  revenue: number;
  cost: number;
  profit: number;
  marginPct: number;
}

export interface TrendPoint {
  label: string;
  total: number;
}

export interface ActionResult {
  ok: boolean;
  message?: string;
  /** Datos extra que algunas acciones devuelven (ej. cambio de una venta). */
  data?: Record<string, unknown>;
}
