"use client";

import { useEffect, useState, type ReactNode } from "react";
import { STORY_H, STORY_W } from "@/lib/shelf/helpers";

interface ShelfPreviewProps {
  children: ReactNode;
  scale?: number;
  heightOffset?: number;
  widthOffset?: number;
  maxScale?: number;
  fitMode?: "height" | "viewport";
  className?: string;
}

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
      className={`relative shadow-[0_20px_60px_rgba(0,0,0,0.6)] select-none ${className}`}
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
