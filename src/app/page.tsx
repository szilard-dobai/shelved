"use client";

import { WoodShelf } from "@/components/shelves";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Display, Eyebrow, Wordmark } from "@/components/ui/typography";
import { useAppState } from "@/lib/app-state";
import { STORY_H, STORY_W } from "@/lib/shelf/helpers";
import { trackEvent } from "@/lib/tracking";
import { useIsMobile } from "@/lib/use-media";
import { motion } from "motion/react";
import Link from "next/link";
import { useEffect } from "react";

const FEATURES = [
  {
    eyebrow: "01",
    title: "Import in seconds",
    body: "Upload your Goodreads or StoryGraph CSV, or just type your books in by hand.",
  },
  {
    eyebrow: "02",
    title: "Tweak the look",
    body: "Pick a shelf style, sort by date, author, or title, and add your own headline.",
  },
  {
    eyebrow: "03",
    title: "Share anywhere",
    body: "Download a high-res image. The QR code links to a public page with every title.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function LandingPage() {
  const { state, ownedShares, hydrated, loadDemo } = useAppState();
  const mobile = useIsMobile();
  const previewScale = mobile ? 0.18 : 0.32;
  const isReturning =
    hydrated &&
    (Object.keys(ownedShares).length > 0 || state.currentSlug !== null);

  useEffect(() => {
    trackEvent("landing_view");
  }, []);

  return (
    <div
      className="min-h-screen bg-bg"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 80% 60% at 80% 50%, rgba(217,184,88,0.06), transparent 60%)",
      }}
    >
      <header className="relative flex items-center justify-between px-5 py-5 md:px-12 md:py-7">
        <Wordmark size={mobile ? 22 : 26} />
      </header>

      <section className="mx-auto grid max-w-page grid-cols-1 items-center gap-9 px-5 pt-6 pb-20 md:px-16 md:pt-8 md:pb-24 lg:min-h-[calc(100vh-5.625rem)] lg:grid-cols-[1.05fr_1fr] lg:gap-15 lg:pb-20">
        <motion.div
          className="mx-auto max-w-xl text-center lg:mx-0 lg:justify-self-start lg:text-left"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.28, delayChildren: 0.15 } },
          }}
        >
          <motion.div variants={fadeUp}>
            <Eyebrow className="mb-4 !text-2xs md:mb-6 md:!text-xs">
              Your reading log · visualised
            </Eyebrow>
          </motion.div>
          <motion.div variants={fadeUp}>
            <Display className="mb-5 !text-display md:mb-7 lg:!text-display-xl">
              Your&nbsp;bookshelf,
              <br />
              beautifully.
            </Display>
          </motion.div>
          <motion.p
            variants={fadeUp}
            className="mx-auto mb-7 max-w-lg font-serif text-lg italic leading-normal text-ink-muted md:mb-9 md:text-xl lg:mx-0"
          >
            Turn your reading history into a shareable shelf. Import from
            Goodreads, StoryGraph, or just your memory — we&apos;ll do the
            rest.
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="flex flex-col gap-2.5 sm:flex-row sm:justify-center lg:justify-start"
            style={{ visibility: hydrated ? undefined : "hidden" }}
          >
            {isReturning ? (
              <Link
                href="/editor"
                onClick={() =>
                  trackEvent("landing_cta_click", { cta: "continue" })
                }
                className="contents sm:inline-block"
              >
                <Button size="md" className="w-full sm:w-auto">
                  Continue your shelf
                  <Icon name="arrowRight" size={16} />
                </Button>
              </Link>
            ) : (
              <>
                <Link
                  href="/import"
                  onClick={() =>
                    trackEvent("landing_cta_click", { cta: "start" })
                  }
                  className="contents sm:inline-block"
                >
                  <Button size="md" className="w-full sm:w-auto">
                    Start your shelf
                    <Icon name="arrowRight" size={16} />
                  </Button>
                </Link>
                <Link
                  href="/editor"
                  onClick={() => {
                    loadDemo();
                    trackEvent("landing_cta_click", { cta: "demo" });
                  }}
                  className="contents sm:inline-block"
                >
                  <Button
                    size="md"
                    variant="secondary"
                    className="w-full sm:w-auto"
                  >
                    Try the demo
                  </Button>
                </Link>
              </>
            )}
          </motion.div>
          <motion.div
            variants={fadeUp}
            className="mt-6 font-sans text-2xs tracking-widest text-ink-faint md:mt-9 md:text-xs"
          >
            NO SIGNUP · FREE · YOUR DATA STAYS YOURS
          </motion.div>
        </motion.div>

        <motion.div
          className="flex items-center justify-center pt-2 lg:pt-0"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1.5,
            delay: 0.8,
            ease: [0.22, 1, 0.36, 1] as const,
          }}
        >
          <div className="relative rounded-xs bg-[#0a0604] p-1.5 shadow-[0_2.5rem_5rem_rgba(0,0,0,0.6),_0_0.875rem_1.875rem_rgba(0,0,0,0.4)]">
            <div
              className="relative overflow-hidden border border-black/50 outline outline-ink/8"
              style={{
                width: STORY_W * previewScale,
                height: STORY_H * previewScale,
              }}
            >
              <div
                className="absolute left-0 top-0 select-none"
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
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-page border-t border-rule px-5 pt-8 pb-28 md:px-16 md:pt-9 md:pb-15">
        <motion.div
          className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-14"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.35, delayChildren: 0.15 } },
          }}
        >
          {FEATURES.map((f) => (
            <motion.div key={f.eyebrow} variants={fadeUp}>
              <div className="mb-2 font-serif text-3xl italic text-gold">
                {f.eyebrow}
              </div>
              <div className="mb-1.5 font-serif text-2xl font-medium italic text-ink">
                {f.title}
              </div>
              <div className="font-sans text-sm leading-relaxed text-ink-muted">
                {f.body}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
