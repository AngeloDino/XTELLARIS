// Formato de moneda y números para Colombia.
// Precios en COP: punto de miles, sin decimales → $12.500

const copFormatter = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 0,
});

export function formatCOP(value: number): string {
  return `$${copFormatter.format(Math.round(value))}`;
}

/** Cantidades de stock: muestra decimales solo si los hay (2,5 libras). */
export function formatQty(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeZone: "America/Bogota",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Bogota",
  }).format(new Date(date));
}

/** Convierte texto de un input a entero COP (acepta "12.500" o "12500"). */
export function parseCOP(text: string): number {
  const clean = text.replace(/[^\d]/g, "");
  return clean ? parseInt(clean, 10) : 0;
}
