import { darken } from "@/lib/shelf/helpers";

interface MugProps {
  x: number;
  y?: number;
  bottom?: number;
  size?: number;
  bodyColor?: string;
  steam?: boolean;
}

export function Mug({
  x,
  y,
  bottom,
  size = 80,
  bodyColor = "#e8dcc4",
  steam = true,
}: MugProps) {
  const style: React.CSSProperties = {
    position: "absolute",
    left: x,
    pointerEvents: "none",
    ...(bottom != null ? { bottom } : { top: y }),
  };
  return (
    <svg
      width={size * 1.3}
      height={size * 1.4}
      viewBox="0 0 104 112"
      style={style}
      aria-hidden="true"
    >
      {steam && (
        <>
          <path
            d="M 30 8 Q 28 18 32 25 Q 36 32 30 42"
            stroke="#b8a890"
            strokeWidth={2}
            fill="none"
            opacity={0.45}
            strokeLinecap="round"
          />
          <path
            d="M 50 6 Q 54 16 48 24 Q 44 32 52 42"
            stroke="#b8a890"
            strokeWidth={2}
            fill="none"
            opacity={0.45}
            strokeLinecap="round"
          />
        </>
      )}
      <rect x={18} y={48} width={56} height={50} rx={3} fill={bodyColor} />
      <ellipse cx={46} cy={50} rx={28} ry={4} fill={darken(bodyColor, 0.25)} />
      <ellipse cx={46} cy={49} rx={24} ry={3} fill="#3a2818" />
      <path
        d="M 74 58 Q 92 60 92 74 Q 92 86 74 88"
        stroke={bodyColor}
        strokeWidth={6}
        fill="none"
      />
      <rect x={22} y={90} width={48} height={8} fill={darken(bodyColor, 0.15)} />
    </svg>
  );
}
