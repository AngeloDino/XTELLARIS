/** Marca Xtellaris: estrella de cuatro puntas + nombre. */
export function Logo({ size = 28, withName = true }: { size?: number; withName?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="shrink-0"
      >
        <path
          d="M16 1 L19.5 12.5 L31 16 L19.5 19.5 L16 31 L12.5 19.5 L1 16 L12.5 12.5 Z"
          fill="rgb(var(--c-brand))"
        />
        <circle cx="25" cy="6" r="2" fill="rgb(var(--c-brand))" opacity="0.6" />
      </svg>
      {withName && (
        <span className="text-xl font-bold tracking-tight">
          Xtellaris
        </span>
      )}
    </span>
  );
}
