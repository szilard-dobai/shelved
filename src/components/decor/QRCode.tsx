import { hashStr } from "@/lib/shelf/helpers";

interface QRCodeProps {
  size?: number;
  bg?: string;
  fg?: string;
  seed?: string;
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
  size = 110,
  bg = "#fff",
  fg = "#1a1410",
  seed = "shelved.app",
}: QRCodeProps) {
  const grid = 21;
  const cells: React.ReactElement[] = [];
  for (let i = 0; i < grid; i++) {
    for (let j = 0; j < grid; j++) {
      const corner =
        (i < 7 && j < 7) ||
        (i < 7 && j >= grid - 7) ||
        (i >= grid - 7 && j < 7);
      if (corner) continue;
      if (hashStr(`${seed}|${i}|${j}`) > 0.5) {
        cells.push(
          <rect key={`${i}-${j}`} x={j} y={i} width={1} height={1} fill={fg} />,
        );
      }
    }
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${grid} ${grid}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect width={grid} height={grid} fill={bg} />
      {cells}
      <Finder x={0} y={0} fg={fg} bg={bg} />
      <Finder x={grid - 7} y={0} fg={fg} bg={bg} />
      <Finder x={0} y={grid - 7} fg={fg} bg={bg} />
    </svg>
  );
}
