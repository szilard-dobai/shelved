"use client";

import { useEffect, useState, type ReactNode } from "react";
import { STORY_H, STORY_W } from "@/lib/shelf/helpers";

interface ShelfPreviewProps {
  children: ReactNode;
  /** Fixed scale. If omitted, scale is computed to fit the available height. */
  scale?: number;
  /** Reserved vertical space (header/footer/controls) when auto-scaling. */
  heightOffset?: number;
  /** Maximum scale when auto-scaling. */
  maxScale?: number;
  className?: string;
}

/**
 * Renders a 1080×1920 shelf artboard scaled to fit. The inner wrapper takes
 * full story dimensions; the outer box is scaled down so surrounding layout
 * stays honest about the rendered size.
 */
export function ShelfPreview({
  children,
  scale,
  heightOffset = 220,
  maxScale = 0.5,
  className = "",
}: ShelfPreviewProps) {
  const [auto, setAuto] = useState(scale ?? 0.4);

  useEffect(() => {
    if (scale != null) return;
    const resize = () => {
      const availH = window.innerHeight - heightOffset;
      setAuto(Math.min(maxScale, availH / STORY_H));
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [scale, heightOffset, maxScale]);

  const s = scale ?? auto;

  return (
    <div
      className={`relative shadow-[0_20px_60px_rgba(0,0,0,0.6)] ${className}`}
      style={{ width: STORY_W * s, height: STORY_H * s }}
    >
      <div
        className="absolute top-0 left-0"
        style={{
          width: STORY_W,
          height: STORY_H,
          transform: `scale(${s})`,
          transformOrigin: "0 0",
        }}
      >
        {children}
      </div>
    </div>
  );
}
