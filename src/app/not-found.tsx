"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Display, Eyebrow, Wordmark } from "@/components/ui/typography";
import { useIsMobile } from "@/lib/use-media";

export default function NotFound() {
  const mobile = useIsMobile();
  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink">
      <header className="relative flex items-center justify-between px-5 py-5 md:px-12 md:py-7">
        <Link href="/">
          <Wordmark size={mobile ? 22 : 26} />
        </Link>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center px-8 pb-20 text-center">
        <Eyebrow className="mb-4">404</Eyebrow>
        <Display size="xl" className="mb-5 !text-5xl md:!text-display-lg">
          This page isn&apos;t here.
        </Display>
        <p className="mb-10 max-w-lg font-serif text-xl italic text-ink-muted">
          The link might be mistyped, or the page may have moved.
        </p>
        <Link href="/">
          <Button variant="gold" size="lg">
            Back home
          </Button>
        </Link>
      </div>
    </div>
  );
}
