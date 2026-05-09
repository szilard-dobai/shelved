import ReactQRCode from "react-qr-code";

interface QRCodeProps {
  value?: string;
  size?: number;
  bg?: string;
  fg?: string;
}

interface FinderProps {
  x: number;
  y: number;
  fg: string;
  bg: string;
}

function Finder({ x, y, fg, bg }: FinderProps) {
  return (
    <>
      <rect x={x} y={y} width={7} height={7} fill={fg} />
      <rect x={x + 1} y={y + 1} width={5} height={5} fill={bg} />
      <rect x={x + 2} y={y + 2} width={3} height={3} fill={fg} />
    </>
  );
}

export function QRCode({
  value,
  size = 110,
  bg = "#fff",
  fg = "#1a1410",
}: QRCodeProps) {
  if (value) {
    return (
      <ReactQRCode
        value={value}
        size={size}
        bgColor={bg}
        fgColor={fg}
        level="M"
      />
    );
  }

  const grid = 21;
  const hatchId = `qr-hatch-${bg.replace("#", "")}-${fg.replace("#", "")}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${grid} ${grid}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label="QR placeholder — appears once you publish a share link"
    >
      <defs>
        <pattern
          id={hatchId}
          width={2}
          height={2}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1={0} y1={0} x2={0} y2={2} stroke={fg} strokeWidth={0.4} />
        </pattern>
      </defs>
      <rect width={grid} height={grid} fill={bg} />
      <rect
        x={0}
        y={0}
        width={grid}
        height={grid}
        fill={`url(#${hatchId})`}
        opacity={0.35}
      />
      <Finder x={0} y={0} fg={fg} bg={bg} />
      <Finder x={grid - 7} y={0} fg={fg} bg={bg} />
      <Finder x={0} y={grid - 7} fg={fg} bg={bg} />
      <rect
        x={0.4}
        y={0.4}
        width={grid - 0.8}
        height={grid - 0.8}
        fill="none"
        stroke={fg}
        strokeWidth={0.4}
        strokeDasharray="1 1"
        opacity={0.5}
      />
      <text
        x={grid / 2 + 1.75}
        y={grid / 2 + 2.25}
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize={3}
        fontWeight={600}
        letterSpacing={0.25}
        fill={fg}
        opacity={0.75}
      >
        QR
      </text>
    </svg>
  );
}
