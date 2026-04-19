interface GlassesProps {
  x: number;
  y?: number;
  bottom?: number;
  size?: number;
  color?: string;
}

export function Glasses({
  x,
  y,
  bottom,
  size = 100,
  color = "#2a1e18",
}: GlassesProps) {
  const style: React.CSSProperties = {
    position: "absolute",
    left: x,
    pointerEvents: "none",
    ...(bottom != null ? { bottom } : { top: y }),
  };
  return (
    <svg
      width={size}
      height={size * 0.4}
      viewBox="0 0 100 40"
      style={style}
      aria-hidden="true"
    >
      <circle cx={22} cy={22} r={16} fill="none" stroke={color} strokeWidth={3} />
      <circle cx={78} cy={22} r={16} fill="none" stroke={color} strokeWidth={3} />
      <line x1={38} y1={22} x2={62} y2={22} stroke={color} strokeWidth={3} />
      <circle cx={22} cy={22} r={14} fill="#f0e8d4" opacity={0.3} />
      <circle cx={78} cy={22} r={14} fill="#f0e8d4" opacity={0.3} />
    </svg>
  );
}
