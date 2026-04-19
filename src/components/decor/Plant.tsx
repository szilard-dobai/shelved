interface PlantProps {
  x: number;
  y?: number;
  bottom?: number;
  size?: number;
  potColor?: string;
  leafColor?: string;
}

export function Plant({
  x,
  y,
  bottom,
  size = 140,
  potColor = "#8b5a3a",
  leafColor = "#4a6b3a",
}: PlantProps) {
  const style: React.CSSProperties = {
    position: "absolute",
    left: x,
    pointerEvents: "none",
    ...(bottom != null ? { bottom } : { top: y }),
  };
  return (
    <svg
      width={size}
      height={size * 1.4}
      viewBox="0 0 100 140"
      style={style}
      aria-hidden="true"
    >
      <ellipse cx={50} cy={55} rx={8} ry={35} fill={leafColor} transform="rotate(-25 50 55)" />
      <ellipse cx={50} cy={55} rx={8} ry={40} fill={leafColor} />
      <ellipse cx={50} cy={55} rx={8} ry={35} fill={leafColor} transform="rotate(25 50 55)" />
      <ellipse cx={50} cy={60} rx={7} ry={28} fill={leafColor} transform="rotate(-50 50 60)" opacity={0.85} />
      <ellipse cx={50} cy={60} rx={7} ry={28} fill={leafColor} transform="rotate(50 50 60)" opacity={0.85} />
      <ellipse cx={50} cy={65} rx={6} ry={22} fill={leafColor} transform="rotate(-75 50 65)" opacity={0.7} />
      <ellipse cx={50} cy={65} rx={6} ry={22} fill={leafColor} transform="rotate(75 50 65)" opacity={0.7} />
      <path d="M 28 100 L 72 100 L 68 135 L 32 135 Z" fill={potColor} />
      <rect
        x={26}
        y={98}
        width={48}
        height={6}
        fill={potColor}
        stroke="rgba(0,0,0,0.15)"
        strokeWidth={1}
      />
    </svg>
  );
}
