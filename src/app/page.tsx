"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Display, Eyebrow, Wordmark } from "@/components/ui/typography";
import { Icon } from "@/components/ui/Icon";
import { WoodShelf } from "@/components/shelves";
import { STORY_H, STORY_W } from "@/lib/shelf/helpers";
import { useAppState } from "@/lib/app-state";
import { useIsMobile } from "@/lib/use-media";
import { trackEvent } from "@/lib/tracking";

const FEATURES = [
  {
    eyebrow: "01",
    title: "Import in seconds",
    body: "Upload your Goodreads CSV, paste a list of ISBNs, or just type your books in by hand.",
  },
  {
    eyebrow: "02",
    title: "Tweak the look",
    body: "Pick a shelf style, sort by date or genre, and add your own title.",
  },
  {
    eyebrow: "03",
    title: "Share anywhere",
    body: "Download a high-res image. The QR code links to a public page with every title.",
  },
];

export default function LandingPage() {
  const { state } = useAppState();
  const mobile = useIsMobile();
  const previewScale = mobile ? 0.18 : 0.32;

  useEffect(() => {
    trackEvent("landing_view");
  }, []);

  return (
    <div
      className="absolute inset-0 bg-bg overflow-auto"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 80% 60% at 80% 50%, rgba(217,184,88,0.06), transparent 60%)",
      }}
    >
      <div className="flex items-center justify-between px-5 py-5 md:px-12 md:py-7 relative z-[2]">
        <Wordmark size={22} className="md:!text-[26px]" />
        <div className="flex gap-7 font-sans text-[13px] text-ink-muted tracking-[0.04em]">
          <a className="cursor-pointer hover:text-ink">Examples</a>
          <a className="cursor-pointer hover:text-ink">About</a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1.05fr_1fr] gap-9 md:gap-[60px] items-center px-5 pt-6 pb-[110px] md:px-16 md:pt-8 md:pb-20 max-w-[1320px] mx-auto md:min-h-[calc(100vh-90px)]">
        <div className="text-center md:text-left max-w-[560px] mx-auto md:mx-0 md:justify-self-start">
          <Eyebrow className="mb-4 md:mb-6 text-[10px] md:text-[12px]">
            A year in books · visualised
          </Eyebrow>
          <Display
            className="mb-5 md:mb-7 !text-[56px] md:!text-[100px]"
          >
            Your&nbsp;bookshelf,
            <br />
            beautifully.
          </Display>
          <p className="font-serif italic text-[17px] md:text-[21px] leading-[1.55] text-ink-muted max-w-[480px] mx-auto md:mx-0 mb-7 md:mb-9">
            Turn your reading history into a shareable shelf. Import from
            Goodreads, paste a list of ISBNs, or just your memory — we&apos;ll
            do the rest.
          </p>
          <div className="flex flex-col md:flex-row gap-[10px] md:justify-start">
            <Link
              href="/import"
              onClick={() => trackEvent("landing_cta_click", { cta: "start" })}
              className="contents md:inline-block"
            >
              <Button size="md" full={mobile} className="md:!w-auto">
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
                full={mobile}
                className="md:!w-auto"
              >
                Try the demo
              </Button>
            </Link>
          </div>
          <div className="mt-[22px] md:mt-9 font-sans text-[10px] md:text-[12px] text-ink-faint tracking-[0.16em]">
            NO SIGNUP · FREE · YOUR DATA STAYS YOURS
          </div>
        </div>

        <div className="flex justify-center items-center relative pt-2 md:pt-0">
          <div className="relative">
            <div
              className="absolute -inset-[6px] rounded-[2px]"
              style={{
                boxShadow:
                  "0 40px 80px rgba(0,0,0,0.6), 0 14px 30px rgba(0,0,0,0.4)",
                background: "#0a0604",
              }}
            />
            <div
              className="relative overflow-hidden border border-black/50 outline-1 outline-ink/[0.08]"
              style={{
                width: STORY_W * previewScale,
                height: STORY_H * previewScale,
                outline: "1px solid rgba(244,234,212,0.08)",
              }}
            >
              <div
                className="absolute top-0 left-0"
                style={{
                  width: STORY_W,
                  height: STORY_H,
                  transform: `scale(${previewScale})`,
                  transformOrigin: "0 0",
                }}
              >
                <WoodShelf
                  books={state.books}
                  userTitle={state.userTitle}
                  sortMode="year"
                />
              </div>
            </div>

            <div
              className="absolute -top-[14px] -right-[10px] md:-top-4 md:-right-4 bg-gold px-3 py-[6px] md:px-4 md:py-2 font-sans text-[9px] md:text-[11px] tracking-[0.22em] uppercase font-semibold"
              style={{
                color: "#1a0e08",
                boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
              }}
            >
              An example shelf
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-rule px-5 pt-8 pb-[110px] md:px-16 md:pt-9 md:pb-[60px] max-w-[1320px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[22px] md:gap-14">
          {FEATURES.map((f) => (
            <div key={f.eyebrow}>
              <div className="font-serif italic text-[32px] text-gold mb-2">
                {f.eyebrow}
              </div>
              <div className="font-serif italic text-[24px] font-medium text-ink mb-[6px]">
                {f.title}
              </div>
              <div className="font-sans text-sm leading-[1.6] text-ink-muted">
                {f.body}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
