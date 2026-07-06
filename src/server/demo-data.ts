// Datos del negocio demo: una tienda de barrio colombiana.
// Los usa tanto el seed (prisma/seed.ts) como el reset del demo
// (src/server/services/demo.ts), para que ambos queden siempre iguales.

export const DEMO_EMAIL = "demo@xtellaris.co";
export const DEMO_PASSWORD = "demo1234";
export const DEMO_BUSINESS_NAME = "Tienda Doña Marta (Demo)";

export interface DemoProduct {
  name: string;
  category: string;
  barcode?: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  unit: string;
  supplier?: string;
}

export const DEMO_SUPPLIERS = [
  { name: "Distribuidora El Surtidor", phone: "573101234567", notes: "Abarrotes y granos. Pedidos martes y viernes." },
  { name: "Postobón S.A.", phone: "573159876543", notes: "Gaseosas y jugos. Preventista pasa los lunes." },
  { name: "Avícola San Jorge", phone: "573204455667", notes: "Huevos por cubeta. Entrega miércoles." },
  { name: "Lácteos La Pradera", phone: "573001122334", notes: "Leche, queso y yogur. Entrega diaria." },
];

export const DEMO_PRODUCTS: DemoProduct[] = [
  // Granos y abarrotes
  { name: "Arroz Diana x 500 g", category: "Granos y abarrotes", barcode: "7702511000123", purchasePrice: 2100, salePrice: 2700, stock: 48, minStock: 20, unit: "unidad", supplier: "Distribuidora El Surtidor" },
  { name: "Arroz Diana x 1 kg", category: "Granos y abarrotes", barcode: "7702511000246", purchasePrice: 4000, salePrice: 5000, stock: 30, minStock: 12, unit: "unidad", supplier: "Distribuidora El Surtidor" },
  { name: "Frijol cargamanto", category: "Granos y abarrotes", purchasePrice: 5200, salePrice: 6800, stock: 25, minStock: 10, unit: "libra", supplier: "Distribuidora El Surtidor" },
  { name: "Lenteja", category: "Granos y abarrotes", purchasePrice: 2800, salePrice: 3600, stock: 18, minStock: 8, unit: "libra", supplier: "Distribuidora El Surtidor" },
  { name: "Panela redonda x 500 g", category: "Granos y abarrotes", purchasePrice: 2300, salePrice: 3000, stock: 40, minStock: 15, unit: "unidad", supplier: "Distribuidora El Surtidor" },
  { name: "Azúcar Manuelita x 1 kg", category: "Granos y abarrotes", barcode: "7702084001234", purchasePrice: 4200, salePrice: 5200, stock: 22, minStock: 10, unit: "unidad", supplier: "Distribuidora El Surtidor" },
  { name: "Sal Refisal x 500 g", category: "Granos y abarrotes", barcode: "7702058001111", purchasePrice: 1200, salePrice: 1700, stock: 35, minStock: 10, unit: "unidad" },
  { name: "Aceite Premier x 1 L", category: "Granos y abarrotes", barcode: "7702535001234", purchasePrice: 9500, salePrice: 12500, stock: 15, minStock: 8, unit: "unidad", supplier: "Distribuidora El Surtidor" },
  { name: "Pasta Doria espagueti x 250 g", category: "Granos y abarrotes", barcode: "7702085001234", purchasePrice: 1600, salePrice: 2200, stock: 28, minStock: 10, unit: "unidad" },
  { name: "Harina P.A.N. x 500 g", category: "Granos y abarrotes", barcode: "7702535004321", purchasePrice: 2900, salePrice: 3800, stock: 20, minStock: 8, unit: "unidad" },
  { name: "Café Sello Rojo x 250 g", category: "Granos y abarrotes", barcode: "7702032001234", purchasePrice: 6800, salePrice: 8500, stock: 12, minStock: 6, unit: "unidad" },
  { name: "Chocolate Corona x 250 g", category: "Granos y abarrotes", barcode: "7702007001234", purchasePrice: 4600, salePrice: 5800, stock: 14, minStock: 6, unit: "unidad" },

  // Bebidas
  { name: "Gaseosa Postobón Manzana 1.5 L", category: "Bebidas", barcode: "7702090001111", purchasePrice: 3400, salePrice: 4500, stock: 24, minStock: 12, unit: "unidad", supplier: "Postobón S.A." },
  { name: "Gaseosa Colombiana 400 ml", category: "Bebidas", barcode: "7702090002222", purchasePrice: 1700, salePrice: 2500, stock: 36, minStock: 18, unit: "unidad", supplier: "Postobón S.A." },
  { name: "Agua Cristal x 600 ml", category: "Bebidas", barcode: "7702090003333", purchasePrice: 1100, salePrice: 1800, stock: 30, minStock: 15, unit: "unidad", supplier: "Postobón S.A." },
  { name: "Jugo Hit caja x 200 ml", category: "Bebidas", barcode: "7702090004444", purchasePrice: 900, salePrice: 1500, stock: 40, minStock: 15, unit: "unidad", supplier: "Postobón S.A." },
  { name: "Pony Malta x 330 ml", category: "Bebidas", barcode: "7702090005555", purchasePrice: 1600, salePrice: 2300, stock: 8, minStock: 12, unit: "unidad", supplier: "Postobón S.A." },

  // Lácteos y huevos
  { name: "Leche entera Colanta x 1 L", category: "Lácteos y huevos", barcode: "7702129001234", purchasePrice: 3300, salePrice: 4200, stock: 18, minStock: 10, unit: "unidad", supplier: "Lácteos La Pradera" },
  { name: "Queso campesino", category: "Lácteos y huevos", purchasePrice: 7500, salePrice: 9500, stock: 6, minStock: 3, unit: "libra", supplier: "Lácteos La Pradera" },
  { name: "Mantequilla Rama x 250 g", category: "Lácteos y huevos", barcode: "7702001001234", purchasePrice: 3800, salePrice: 4800, stock: 10, minStock: 5, unit: "unidad", supplier: "Lácteos La Pradera" },
  { name: "Huevos rojos AA", category: "Lácteos y huevos", purchasePrice: 14500, salePrice: 18000, stock: 5, minStock: 3, unit: "cubeta", supplier: "Avícola San Jorge" },
  { name: "Huevos rojos AA sueltos", category: "Lácteos y huevos", purchasePrice: 500, salePrice: 700, stock: 60, minStock: 30, unit: "unidad", supplier: "Avícola San Jorge" },

  // Aseo
  { name: "Detergente Fab x 1 kg", category: "Aseo", barcode: "7702011001234", purchasePrice: 8200, salePrice: 10500, stock: 9, minStock: 5, unit: "unidad", supplier: "Distribuidora El Surtidor" },
  { name: "Jabón Rey x 300 g", category: "Aseo", barcode: "7702011002345", purchasePrice: 2400, salePrice: 3200, stock: 20, minStock: 8, unit: "unidad" },
  { name: "Blanqueador Clorox x 1 L", category: "Aseo", barcode: "7702011003456", purchasePrice: 3600, salePrice: 4800, stock: 11, minStock: 6, unit: "unidad" },
  { name: "Papel higiénico Scott x 4 rollos", category: "Aseo", barcode: "7702011004567", purchasePrice: 5800, salePrice: 7500, stock: 14, minStock: 6, unit: "unidad" },
  { name: "Crema dental Colgate x 75 ml", category: "Aseo", barcode: "7702011005678", purchasePrice: 3900, salePrice: 5200, stock: 4, minStock: 6, unit: "unidad" },

  // Mecato
  { name: "Papas Margarita pollo x 25 g", category: "Mecato", barcode: "7702189001234", purchasePrice: 1100, salePrice: 1700, stock: 45, minStock: 20, unit: "unidad" },
  { name: "Chocorramo", category: "Mecato", barcode: "7702189002345", purchasePrice: 1900, salePrice: 2800, stock: 25, minStock: 12, unit: "unidad" },
  { name: "Galletas Festival x 4", category: "Mecato", barcode: "7702189003456", purchasePrice: 1300, salePrice: 1900, stock: 30, minStock: 12, unit: "unidad" },
  { name: "Bocadillo veleño lonja", category: "Mecato", purchasePrice: 600, salePrice: 1000, stock: 3, minStock: 10, unit: "unidad" },
];
