"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Display, Eyebrow, Wordmark } from "@/components/ui/typography";
import { Icon } from "@/components/ui/Icon";
import { ShelfPreview } from "@/components/ShelfPreview";
import { Shelf } from "@/components/shelves";
import { useAppState } from "@/lib/app-state";
import { useIsMobile } from "@/lib/use-media";
import type { BgVariant, Book, ShelfStyle, SortMode } from "@/lib/shelf/types";
import { trackEvent } from "@/lib/tracking";

interface Props {
  slug: string;
  books: Book[];
  userTitle: string;
  sortMode: SortMode;
  style: ShelfStyle;
  bgVariant: BgVariant;
  showBookCount: boolean;
  showPages: boolean;
  showRating: boolean;
}

export function SharePageClient({
  slug,
  books,
  userTitle,
  sortMode,
  style,
  bgVariant,
  showBookCount,
  showPages,
  showRating,
}: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const mobile = useIsMobile();
  const { setState, rememberShare, ownedShares } = useAppState();
  const [hydrated, setHydrated] = useState(false);

  const incomingEditKey = params.get("edit");
  const cachedEditKey = ownedShares[slug];
  const canEdit = Boolean(incomingEditKey || cachedEditKey);
  const shareUrl = hydrated ? `${window.location.origin}/s/${slug}` : undefined;

  useEffect(() => {
    trackEvent("share_page_view", { slug });
  }, [slug]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (incomingEditKey) rememberShare(slug, incomingEditKey);
  }, [incomingEditKey, rememberShare, slug]);

  const openInEditor = () => {
    setState({
      books,
      userTitle,
      sortMode,
      style,
      bgVariant,
      showBookCount,
      showPages,
      showRating,
      currentSlug: canEdit ? slug : null,
    });
    router.push("/editor");
  };

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-rule bg-bg px-4 py-3.5 md:px-8 md:py-4">
        <div className="flex min-w-0 items-center gap-2.5 md:gap-5">
          <Link href="/">
            <Wordmark size={mobile ? 18 : 20} />
          </Link>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          {canEdit && (
            <Button
              variant="secondary"
              size="sm"
              className="!py-1.5"
              onClick={openInEditor}
            >
              <Icon name="edit" size={12} /> Edit
              <span className="hidden sm:inline"> this shelf</span>
            </Button>
          )}
          <Link href="/">
            <Button variant="gold" size="sm" className="!py-1.5">
              {canEdit ? "New" : "Make yours"}
            </Button>
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-page px-5 py-10 md:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <Eyebrow className="mb-3">A shared Shelved shelf</Eyebrow>
          <Display size="lg" className="mb-5">
            {userTitle}
          </Display>
          <p className="font-serif text-lg italic text-ink-muted">
            {books.length} books · curated with{" "}
            <Link href="/" className="underline underline-offset-2">
              Shelved
            </Link>
            .
          </p>
        </div>

        <div className="flex items-start justify-center">
          <ShelfPreview heightOffset={380}>
            <Shelf
              style={style}
              books={books}
              userTitle={userTitle}
              sortMode={sortMode}
              bgVariant={bgVariant}
              showBookCount={showBookCount}
              showPages={showPages}
              showRating={showRating}
              shareUrl={shareUrl}
            />
          </ShelfPreview>
        </div>

        <div className="mt-14 border-t border-rule pt-8">
          <Eyebrow className="mb-5 text-center !text-2xs">Every title</Eyebrow>
          <ul className="columns-1 gap-x-10 md:columns-2 lg:columns-3">
            {books.map((b, i) => (
              <li
                key={i}
                className="flex break-inside-avoid items-start gap-3 border-t border-rule py-3 first:border-t-0"
              >
                <div
                  className="mt-1 h-10 w-3 flex-shrink-0"
                  style={{ background: b.spineColor }}
                />
                <div className="min-w-0 flex-1">
                  <div className="font-medium leading-tight text-ink">
                    {b.title}
                  </div>
                  <div className="text-sm italic text-ink-muted">
                    {b.author}
                  </div>
                  <div className="mt-0.5 text-xs tracking-wide text-ink-faint">
                    {"★".repeat(b.rating)}
                    <span className="opacity-30">
                      {"★".repeat(5 - b.rating)}
                    </span>{" "}
                    · {b.year}
                    {showPages && b.pages != null ? ` · ${b.pages}p` : ""}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
