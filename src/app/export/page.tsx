"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Display,
  Eyebrow,
  Hairline,
  Wordmark,
} from "@/components/ui/typography";
import { Icon } from "@/components/ui/Icon";
import { ShelfPreview } from "@/components/ShelfPreview";
import { Shelf } from "@/components/shelves";
import { QRCode } from "@/components/decor/QRCode";
import { useAppState } from "@/lib/app-state";
import { useIsMobile } from "@/lib/use-media";
import { trackEvent } from "@/lib/tracking";

interface ShareInfo {
  slug: string;
  editKey: string;
  viewUrl: string;
  editUrl: string;
}

export default function ExportPage() {
  const { state, rememberShare, hydrated } = useAppState();
  const { books, userTitle, sortMode, style } = state;
  const mobile = useIsMobile();
  const [share, setShare] = useState<ShareInfo | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [copiedView, setCopiedView] = useState(false);
  const [copiedEdit, setCopiedEdit] = useState(false);

  useEffect(() => {
    trackEvent("export_view");
  }, []);

  const publish = async () => {
    if (publishing) return;
    setPublishing(true);
    try {
      const res = await fetch("/api/shares", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          books,
          userTitle,
          sortMode,
          style,
          bgVariant: state.bgVariant,
        }),
      });
      if (!res.ok) throw new Error("Publish failed");
      const data = (await res.json()) as {
        slug: string;
        editKey: string;
      };
      const origin = window.location.origin;
      const viewUrl = `${origin}/s/${data.slug}`;
      const editUrl = `${origin}/s/${data.slug}?edit=${data.editKey}`;
      rememberShare(data.slug, data.editKey);
      setShare({ slug: data.slug, editKey: data.editKey, viewUrl, editUrl });
      trackEvent("share_created", {
        slug: data.slug,
        bookCount: books.length,
        style,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setPublishing(false);
    }
  };

  const copy = async (
    text: string,
    setFlag: (b: boolean) => void,
    event: "share_link_copied" | "edit_link_copied",
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      setFlag(true);
      setTimeout(() => setFlag(false), 1500);
      trackEvent(event);
    } catch {}
  };

  const stats = [
    { label: "books", value: String(books.length) },
    {
      label: "pages",
      value: books.reduce((s, b) => s + b.pages, 0).toLocaleString(),
    },
    {
      label: "avg",
      value: books.length
        ? (books.reduce((s, b) => s + b.rating, 0) / books.length).toFixed(1)
        : "0.0",
    },
  ];

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-rule bg-bg px-4 py-3.5 md:px-8 md:py-4">
        <div className="flex min-w-0 items-center gap-2.5 md:gap-5">
          <Link
            href="/editor"
            className="flex items-center gap-2 font-sans text-md text-ink-muted hover:text-ink"
            aria-label="Back to editor"
          >
            <Icon name="arrowLeft" size={16} />
            <span className="hidden md:inline">Back to editor</span>
          </Link>
          <div className="hidden h-5 w-px bg-rule md:block" />
          <Wordmark size={mobile ? 18 : 20} />
          <div className="ml-2 hidden font-sans text-xs tracking-eyebrow text-ink-faint md:block">
            STEP 3 · SHARE
          </div>
        </div>
      </header>

      <section
        className="mx-auto grid max-w-page grid-cols-1 gap-7 px-5 py-6 md:grid-cols-[1fr_26.25rem] md:gap-10 md:p-10"
        aria-busy={!hydrated}
        style={{ visibility: hydrated ? undefined : "hidden" }}
      >
        <div className="flex items-start justify-center">
          <ShelfPreview
            fitMode="viewport"
            heightOffset={240}
            widthOffset={40}
            maxScale={mobile ? 0.25 : 0.5}
          >
            <Shelf
              style={style}
              books={books}
              userTitle={userTitle}
              sortMode={sortMode}
            />
          </ShelfPreview>
        </div>

        <div>
          <Eyebrow className="mb-3">Ready to share</Eyebrow>
          <Display size="lg" className="mb-4 !text-5xl md:!text-display">
            {userTitle}
          </Display>

          <p className="mb-5 font-serif text-base italic text-ink-muted md:mb-7 md:text-lg">
            Your shelf is ready. Download the image, share anywhere, or publish
            a link to a page where people can browse every title.
          </p>

          <div className="mb-7 grid gap-2.5">
            <Button
              variant="gold"
              size={mobile ? "md" : "lg"}
              full
              onClick={() => trackEvent("export_png_click")}
            >
              <Icon name="download" size={16} />
              Download PNG · 2160×3840
            </Button>

            {!share ? (
              <Button
                variant="secondary"
                full
                onClick={publish}
                disabled={publishing}
              >
                <Icon name="share" size={14} />
                {publishing ? "Publishing…" : "Publish share link"}
              </Button>
            ) : (
              <SharePanel
                share={share}
                copiedView={copiedView}
                copiedEdit={copiedEdit}
                onCopyView={() =>
                  copy(share.viewUrl, setCopiedView, "share_link_copied")
                }
                onCopyEdit={() =>
                  copy(share.editUrl, setCopiedEdit, "edit_link_copied")
                }
              />
            )}
          </div>

          <Hairline className="my-5" />

          <div className="grid grid-cols-3 gap-2.5 md:gap-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="font-serif text-3xl font-medium italic leading-none text-ink md:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 font-sans text-xs uppercase tracking-widest text-ink-faint">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <Hairline className="my-5" />

          <p className="font-sans text-xs leading-relaxed text-ink-faint">
            The QR on your shelf links to a public page where viewers can see
            every title, author and rating.
          </p>
        </div>
      </section>
    </div>
  );
}

function SharePanel({
  share,
  copiedView,
  copiedEdit,
  onCopyView,
  onCopyEdit,
}: {
  share: ShareInfo;
  copiedView: boolean;
  copiedEdit: boolean;
  onCopyView: () => void;
  onCopyEdit: () => void;
}) {
  return (
    <div className="mt-2 space-y-3">
      <div className="rounded-xs border border-rule bg-bg-raised p-4">
        <Eyebrow className="mb-2 !text-2xs">Share this publicly</Eyebrow>
        <div className="flex items-center gap-2">
          <code className="flex-1 truncate font-mono text-xs text-ink">
            {share.viewUrl}
          </code>
          <CopyButton copied={copiedView} onClick={onCopyView} />
        </div>
      </div>

      <div className="rounded-xs border border-gold bg-gold-soft p-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex-shrink-0 text-gold">
            <Icon name="edit" size={14} />
          </div>
          <div className="min-w-0 flex-1">
            <Eyebrow className="mb-2 !text-2xs !text-gold">
              Save to edit later
            </Eyebrow>
            <p className="mb-3 text-xs leading-normal text-ink-muted">
              Bookmark this link — it&apos;s the only way to edit your shelf. We
              can&apos;t recover it for you.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate font-mono text-xs text-ink">
                {share.editUrl}
              </code>
              <CopyButton copied={copiedEdit} onClick={onCopyEdit} />
            </div>

            <div className="mt-4 flex items-center gap-3 border-t border-rule pt-4">
              <div className="flex-shrink-0 bg-[#f4ead4] p-2">
                <QRCode
                  size={72}
                  bg="#f4ead4"
                  fg="#1a0e08"
                  seed={share.editUrl}
                />
              </div>
              <p className="font-sans text-xs leading-normal text-ink-muted">
                On your laptop?{" "}
                <span className="text-ink">Scan with your phone</span> to open
                the editor there too.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CopyButton({
  copied,
  onClick,
}: {
  copied: boolean;
  onClick: () => void;
}) {
  return (
    <Button variant="secondary" size="sm" onClick={onClick}>
      {copied ? (
        <>
          <Icon name="check" size={12} /> Copied
        </>
      ) : (
        <>Copy</>
      )}
    </Button>
  );
}
