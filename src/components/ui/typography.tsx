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
      className={`font-sans text-xs font-medium uppercase tracking-eyebrow text-ink-faint ${className}`}
    >
      {children}
    </div>
  );
}

type DisplaySize = "lg" | "xl";
const displaySize: Record<DisplaySize, string> = {
  lg: "text-display",
  xl: "text-display-lg",
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
      className={`m-0 font-serif italic font-medium leading-display tracking-tighter text-ink ${displaySize[size]} ${className}`}
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
      className={`inline-flex items-baseline font-serif italic font-semibold tracking-tight text-ink select-none ${className}`}
    >
      <span>Shelved</span>
      <span className="ml-0.5 text-gold">.</span>
    </div>
  );
}

export function Hairline({ className = "" }: { className?: string }) {
  return <div className={`h-px bg-rule ${className}`} />;
}
