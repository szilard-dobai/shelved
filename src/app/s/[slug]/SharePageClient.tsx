"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
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
}

export function SharePageClient({
  slug,
  books,
  userTitle,
  sortMode,
  style,
  bgVariant,
}: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const mobile = useIsMobile();
  const { setState, rememberShare, ownedShares } = useAppState();

  const incomingEditKey = params.get("edit");
  const cachedEditKey = ownedShares[slug];
  const canEdit = Boolean(incomingEditKey || cachedEditKey);

  useEffect(() => {
    trackEvent("share_page_view", { slug });
  }, [slug]);

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

      <section className="mx-auto grid max-w-page grid-cols-1 gap-10 px-8 py-10 lg:grid-cols-[1fr_22.5rem]">
        <div className="flex items-start justify-center">
          <ShelfPreview heightOffset={220}>
            <Shelf
              style={style}
              books={books}
              userTitle={userTitle}
              sortMode={sortMode}
            />
          </ShelfPreview>
        </div>

        <div>
          <Eyebrow className="mb-3">A shared Shelved shelf</Eyebrow>
          <Display size="lg" className="mb-5">
            {userTitle}
          </Display>
          <p className="mb-7 font-serif text-lg italic text-ink-muted">
            {books.length} books · curated with{" "}
            <Link href="/" className="underline underline-offset-2">
              Shelved
            </Link>
            .
          </p>

          <Eyebrow className="mb-2 !text-2xs">Every title</Eyebrow>
          <ul className="divide-y divide-rule">
            {books.map((b, i) => (
              <li key={i} className="flex items-start gap-3 py-3">
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
                    · {b.year} · {b.pages}p
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
