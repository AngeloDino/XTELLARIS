"use client";

import { useEffect, useState } from "react";
import { formatCOP, parseCOP } from "@/lib/format";

/**
 * Campo de dinero en COP: muestra el valor con punto de miles ($12.500)
 * mientras se escribe, y entrega siempre un entero limpio.
 */
export function MoneyInput({
  id,
  value,
  onChange,
  placeholder = "$0",
  autoFocus,
}: {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const [text, setText] = useState(value ? formatCOP(value) : "");

  // Sincroniza cuando el valor cambia desde afuera (ej. reset del formulario).
  useEffect(() => {
    setText(value ? formatCOP(value) : "");
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const parsed = parseCOP(e.target.value);
    setText(parsed ? formatCOP(parsed) : "");
    onChange(parsed);
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      value={text}
      onChange={handleChange}
      placeholder={placeholder}
      autoFocus={autoFocus}
      className="field"
      autoComplete="off"
    />
  );
}
