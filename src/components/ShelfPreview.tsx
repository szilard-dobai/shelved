"use client";

import { useEffect, useState, type ReactNode } from "react";
import { STORY_H, STORY_W } from "@/lib/shelf/helpers";

interface ShelfPreviewProps {
  children: ReactNode;
  /** Fixed scale. If omitted, scale is computed from viewport. */
  scale?: number;
  /** Reserved vertical space (header/footer/controls) when auto-scaling. */
  heightOffset?: number;
  /** Reserved horizontal space (outer page padding) for viewport-fit mode. */
  widthOffset?: number;
  /** Maximum scale when auto-scaling. */
  maxScale?: number;
  /**
   * "height" (default): scale fits viewport height only — appropriate when a
   * side panel constrains width on desktop.
   * "viewport": fits both width and height — used when the preview lives in
   * a stacked single-column layout (mobile, or mobile-style export panels).
   */
  fitMode?: "height" | "viewport";
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
  widthOffset = 40,
  maxScale = 0.5,
  fitMode = "height",
  className = "",
}: ShelfPreviewProps) {
  const [auto, setAuto] = useState(scale ?? 0.4);

  useEffect(() => {
    if (scale != null) return;
    const resize = () => {
      const hFit = (window.innerHeight - heightOffset) / STORY_H;
      if (fitMode === "viewport") {
        const wFit = (window.innerWidth - widthOffset) / STORY_W;
        setAuto(Math.min(maxScale, wFit, hFit));
      } else {
        setAuto(Math.min(maxScale, hFit));
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [scale, heightOffset, widthOffset, maxScale, fitMode]);

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
