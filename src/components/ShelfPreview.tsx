"use client";

import { useEffect, useRef, useState, type ReactNode, type Ref } from "react";
import { STORY_H, STORY_W } from "@/lib/shelf/helpers";

interface ShelfPreviewProps {
  children: ReactNode;
  scale?: number;
  heightOffset?: number;
  widthOffset?: number;
  maxScale?: number;
  fitMode?: "height" | "viewport" | "container";
  className?: string;
  innerRef?: Ref<HTMLDivElement>;
}

export function ShelfPreview({
  children,
  scale,
  heightOffset = 220,
  widthOffset = 40,
  maxScale = 0.5,
  fitMode = "height",
  className = "",
  innerRef,
}: ShelfPreviewProps) {
  const [auto, setAuto] = useState(scale ?? 0.4);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scale != null) return;
    const wrapper = wrapperRef.current;
    const parent = wrapper?.parentElement;

    const resize = () => {
      if (fitMode === "container" && parent) {
        const styles = getComputedStyle(parent);
        const padX =
          (parseFloat(styles.paddingLeft) || 0) +
          (parseFloat(styles.paddingRight) || 0);
        const padY =
          (parseFloat(styles.paddingTop) || 0) +
          (parseFloat(styles.paddingBottom) || 0);
        const availW = Math.max(0, parent.clientWidth - padX);
        const availH = Math.max(0, parent.clientHeight - padY);
        const wFit = availW / STORY_W;
        const hFit = availH / STORY_H;
        setAuto(Math.min(maxScale, wFit, hFit));
        return;
      }

      const hFit = (window.innerHeight - heightOffset) / STORY_H;
      if (fitMode === "viewport") {
        const wFit = (window.innerWidth - widthOffset) / STORY_W;
        setAuto(Math.min(maxScale, wFit, hFit));
      } else {
        setAuto(Math.min(maxScale, hFit));
      }
    };

    resize();

    if (fitMode === "container" && parent) {
      const ro = new ResizeObserver(resize);
      ro.observe(parent);
      return () => ro.disconnect();
    }

    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [scale, heightOffset, widthOffset, maxScale, fitMode]);

  const s = scale ?? auto;

  return (
    <div
      ref={wrapperRef}
      className={`relative shadow-[0_20px_60px_rgba(0,0,0,0.6)] select-none ${className}`}
      style={{ width: STORY_W * s, height: STORY_H * s }}
    >
      <div
        ref={innerRef}
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
