// Utilidades de fecha ancladas a la zona horaria de Colombia (America/Bogota,
// UTC-5 fijo, sin horario de verano). Las fechas se guardan en UTC; estos
// helpers calculan los límites de "hoy", "esta semana", etc. según Bogotá.

const BOGOTA_OFFSET_MS = 5 * 60 * 60 * 1000; // UTC-5

/** Inicio del día actual en Bogotá, como Date UTC. */
export function startOfTodayBogota(now: Date = new Date()): Date {
  const bogota = new Date(now.getTime() - BOGOTA_OFFSET_MS);
  bogota.setUTCHours(0, 0, 0, 0);
  return new Date(bogota.getTime() + BOGOTA_OFFSET_MS);
}

/** Inicio del día N días atrás (Bogotá). */
export function startOfDaysAgoBogota(days: number, now: Date = new Date()): Date {
  const start = startOfTodayBogota(now);
  return new Date(start.getTime() - days * 24 * 60 * 60 * 1000);
}

/** Clave "YYYY-MM-DD" del día en Bogotá para agrupar ventas. */
export function bogotaDayKey(date: Date): string {
  const bogota = new Date(date.getTime() - BOGOTA_OFFSET_MS);
  return bogota.toISOString().slice(0, 10);
}

/** Etiqueta corta "lun 6 jul" para gráficas. */
export function bogotaDayLabel(date: Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "America/Bogota",
  }).format(date);
}
