"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Display, Eyebrow, Wordmark } from "@/components/ui/typography";
import { Icon } from "@/components/ui/Icon";
import { WoodShelf } from "@/components/shelves";
import { STORY_H, STORY_W } from "@/lib/shelf/helpers";
import { useAppState } from "@/lib/app-state";
import { trackEvent } from "@/lib/tracking";

export default function LandingPage() {
  const { state } = useAppState();

  useEffect(() => {
    trackEvent("landing_view");
  }, []);

  return (
    <div className="absolute inset-0 bg-bg overflow-hidden">
      {/* Ambient shelf preview behind — heavier blur/fade on mobile so the
          small card stays the focal point. */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="origin-center scale-[0.28] opacity-35 md:scale-[0.48] md:opacity-55"
          style={{
            width: STORY_W,
            height: STORY_H,
            filter: "blur(0.5px)",
          }}
        >
          <WoodShelf
            books={state.books}
            userTitle={state.userTitle}
            sortMode="year"
          />
        </div>
      </div>

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 20%, var(--color-bg) 80%)",
        }}
      />

      {/* Top nav */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-5 md:px-12 md:py-7 z-[2]">
        <Wordmark size={22} className="md:!text-[26px]" />
        <div className="flex gap-5 md:gap-7 font-sans text-[13px] text-ink-muted tracking-[0.04em]">
          <a className="cursor-pointer hover:text-ink">Examples</a>
          <a className="cursor-pointer hover:text-ink">About</a>
        </div>
      </div>

      {/* Hero card */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-[3] p-6 md:p-12 max-w-[720px] w-[calc(100%-32px)] md:w-[calc(100%-80px)]">
        <Eyebrow className="mb-[18px] md:mb-7 text-[10px] md:text-[12px]">
          A year in books · visualised
        </Eyebrow>
        <Display
          size="xxl"
          className="mb-[22px] md:mb-8 !text-[56px] md:!text-[128px]"
        >
          Your&nbsp;bookshelf,
          <br />
          beautifully.
        </Display>
        <p className="font-serif italic text-[17px] md:text-[22px] leading-[1.45] text-ink-muted max-w-[520px] mx-auto mb-8 md:mb-12">
          Turn your reading history into a shareable shelf. Import from Goodreads,
          Storygraph, or just your memory — we&apos;ll do the rest.
        </p>
        <div className="flex flex-col md:flex-row gap-[10px] md:gap-[14px] md:justify-center md:flex-wrap">
          <Link
            href="/import"
            onClick={() => trackEvent("landing_cta_click", { cta: "start" })}
            className="contents md:inline-block"
          >
            <Button size="md" className="w-full md:!w-auto md:!px-[38px] md:!py-5 md:!text-[15px] md:!tracking-[0.28em]">
              Start your shelf
              <Icon name="arrowRight" size={16} />
            </Button>
          </Link>
          <Link
            href="/editor"
            onClick={() => trackEvent("landing_cta_click", { cta: "demo" })}
            className="contents md:inline-block"
          >
            <Button
              size="md"
              variant="secondary"
              className="w-full md:!w-auto md:!px-[38px] md:!py-5 md:!text-[15px] md:!tracking-[0.28em]"
            >
              Try the demo
            </Button>
          </Link>
        </div>
        <div className="mt-6 md:mt-10 font-sans text-[10px] md:text-xs text-ink-faint tracking-[0.16em]">
          NO SIGNUP · FREE · ONE SESSION · YOUR DATA STAYS YOURS
        </div>
      </div>
    </div>
  );
}
