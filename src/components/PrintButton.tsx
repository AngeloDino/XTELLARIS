"use client";

import { PrinterIcon } from "./Icons";

/** Imprime la página actual (o guarda como PDF desde el diálogo del sistema). */
export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="btn-secondary no-print">
      <PrinterIcon size={20} />
      Imprimir
    </button>
  );
}
