import type { CSSProperties, ReactNode } from "react";

export function Eyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`font-sans text-[12px] font-medium uppercase tracking-[0.4em] text-ink-faint ${className}`}
    >
      {children}
    </div>
  );
}

type DisplaySize = "lg" | "xl" | "xxl";
const displaySize: Record<DisplaySize, string> = {
  lg: "text-[64px]",
  xl: "text-[88px]",
  xxl: "text-[128px]",
};

export function Display({
  children,
  size = "xl",
  className = "",
  style,
}: {
  children: ReactNode;
  size?: DisplaySize;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <h1
      style={style}
      className={`font-serif italic font-medium leading-[0.95] tracking-[-0.03em] text-ink m-0 ${displaySize[size]} ${className}`}
    >
      {children}
    </h1>
  );
}

export function Wordmark({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      style={{ fontSize: size }}
      className={`font-serif italic font-semibold tracking-[-0.01em] text-ink inline-flex items-baseline ${className}`}
    >
      <span>Shelved</span>
      <span className="text-gold ml-[2px]">.</span>
    </div>
  );
}

export function Hairline({ className = "" }: { className?: string }) {
  return <div className={`h-px bg-rule ${className}`} />;
}
