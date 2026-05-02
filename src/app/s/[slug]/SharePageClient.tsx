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
    setState({ books, userTitle, sortMode, style, bgVariant });
    router.push("/editor");
  };

  return (
    <div className="min-h-screen bg-bg text-ink">
      <div className="sticky top-0 z-10 bg-bg flex items-center justify-between px-8 py-[18px] border-b border-rule">
        <div className="flex items-center gap-5">
          <Link href="/">
            <Wordmark size={20} />
          </Link>
          <div className="w-px h-5 bg-rule" />
          <div className="font-sans text-xs text-ink-faint tracking-[0.3em]">
            SHARED SHELF · /s/{slug}
          </div>
        </div>
        <div className="flex gap-3 items-center">
          {canEdit && (
            <Button variant="secondary" size="sm" onClick={openInEditor}>
              <Icon name="edit" size={12} /> Edit this shelf
            </Button>
          )}
          <Link href="/">
            <Button variant="gold" size="sm">
              Make yours
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 py-10 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
        <div className="flex justify-center items-start">
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
          <div className="font-serif italic text-[18px] text-ink-muted mb-7">
            {books.length} books · curated with{" "}
            <Link href="/" className="underline underline-offset-2">
              Shelved
            </Link>
            .
          </div>

          <Eyebrow className="!text-[10px] mb-2">Every title</Eyebrow>
          <ul className="divide-y divide-rule">
            {books.map((b, i) => (
              <li key={i} className="py-3 flex items-start gap-3">
                <div
                  className="flex-shrink-0 mt-1 w-3 h-10"
                  style={{ background: b.spineColor }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-ink font-medium leading-tight">
                    {b.title}
                  </div>
                  <div className="text-ink-muted text-sm italic">{b.author}</div>
                  <div className="text-ink-faint text-[11px] tracking-[0.08em] mt-[2px]">
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
      </div>
    </div>
  );
}
