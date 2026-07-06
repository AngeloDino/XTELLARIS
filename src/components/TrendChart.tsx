import type { TrendPoint } from "@/lib/types";
import { formatCOP } from "@/lib/format";

/**
 * Gráfica de barras simple en SVG, sin librerías externas.
 * Muestra la tendencia de ventas por día.
 */
export function TrendChart({ points }: { points: TrendPoint[] }) {
  const width = 700;
  const height = 220;
  const padding = { top: 24, bottom: 40, left: 8, right: 8 };
  const max = Math.max(...points.map((p) => p.total), 1);
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const barGap = 6;
  const barW = innerW / points.length - barGap;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Gráfica de ventas por día"
      className="w-full"
    >
      {points.map((p, i) => {
        const h = Math.round((p.total / max) * innerH);
        const x = padding.left + i * (barW + barGap);
        const y = padding.top + innerH - h;
        const showLabel = points.length <= 8 || i % 2 === 0;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={Math.max(h, 2)}
              rx="4"
              fill="rgb(var(--c-brand))"
              opacity={p.total === 0 ? 0.25 : 0.9}
            />
            {p.total > 0 && h > 24 && barW > 34 && (
              <text
                x={x + barW / 2}
                y={y - 6}
                textAnchor="middle"
                fontSize="11"
                fill="rgb(var(--c-muted))"
              >
                {formatCOP(p.total)}
              </text>
            )}
            {showLabel && (
              <text
                x={x + barW / 2}
                y={height - 12}
                textAnchor="middle"
                fontSize="11"
                fill="rgb(var(--c-muted))"
              >
                {p.label.split(" ").slice(0, 2).join(" ")}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
