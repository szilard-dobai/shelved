interface CatProps {
  x: number;
  y?: number;
  bottom?: number;
  size?: number;
  fill?: string;
}

export function Cat({ x, y, bottom, size = 110, fill = "#2a1e18" }: CatProps) {
  const style: React.CSSProperties = {
    position: "absolute",
    left: x,
    pointerEvents: "none",
    ...(bottom != null ? { bottom } : { top: y }),
  };
  return (
    <svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 100 120"
      style={style}
      aria-hidden="true"
    >
      <path
        d="M 30 110 Q 15 110 15 85 Q 15 55 35 45 Q 50 40 65 45 Q 78 50 82 65 L 82 90 Q 85 100 88 110 Q 85 115 78 112 Q 72 110 70 105 L 70 100 Q 60 105 50 105 L 48 110 Q 45 115 38 113 Q 32 112 30 110 Z"
        fill={fill}
      />
      <path
        d="M 30 55 Q 25 35 32 25 L 38 38 Q 45 32 55 32 Q 65 32 70 38 L 76 25 Q 82 35 78 55 Q 70 65 55 65 Q 40 65 30 55 Z"
        fill={fill}
      />
      <path
        d="M 82 90 Q 95 85 95 75 Q 95 68 88 68"
        stroke={fill}
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
      />
      <circle cx={45} cy={48} r={1.5} fill="#d9b858" opacity={0.85} />
      <circle cx={62} cy={48} r={1.5} fill="#d9b858" opacity={0.85} />
      <ellipse cx={54} cy={56} rx={3} ry={1} fill="#8a7a5a" opacity={0.4} />
    </svg>
  );
}
