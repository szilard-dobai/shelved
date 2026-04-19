"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Display, Eyebrow, Hairline, Wordmark } from "@/components/ui/typography";
import { Icon } from "@/components/ui/Icon";
import { ShelfPreview } from "@/components/ShelfPreview";
import { Shelf } from "@/components/shelves";
import { QRCode } from "@/components/decor/QRCode";
import { useAppState } from "@/lib/app-state";
import { trackEvent } from "@/lib/tracking";

interface ShareInfo {
  slug: string;
  editKey: string;
  viewUrl: string;
  editUrl: string;
}

export default function ExportPage() {
  const { state, rememberShare } = useAppState();
  const { books, userTitle, sortMode, style } = state;
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

  return (
    <div className="absolute inset-0 bg-bg text-ink overflow-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-[14px] md:px-8 md:py-[18px] border-b border-rule gap-2">
        <div className="flex items-center gap-[10px] md:gap-5 min-w-0">
          <Link
            href="/editor"
            className="flex items-center gap-2 text-ink-muted hover:text-ink text-[13px] font-sans"
            aria-label="Back to editor"
          >
            <Icon name="arrowLeft" size={16} />
            <span className="hidden md:inline">Back to editor</span>
          </Link>
          <div className="hidden md:block w-px h-5 bg-rule" />
          <Wordmark size={20} className="!text-[18px] md:!text-[20px]" />
          <div className="hidden md:block font-sans text-xs text-ink-faint tracking-[0.3em] ml-2">
            STEP 3 · SHARE
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_420px] gap-7 md:gap-10 px-5 py-6 md:p-10 max-w-[1400px] mx-auto">
        {/* Preview */}
        <div className="flex justify-center items-start">
          <ShelfPreview
            fitMode="viewport"
            heightOffset={240}
            widthOffset={40}
            maxScale={0.5}
          >
            <Shelf
              style={style}
              books={books}
              userTitle={userTitle}
              sortMode={sortMode}
            />
          </ShelfPreview>
        </div>

        {/* Share panel */}
        <div>
          <Eyebrow className="mb-3">Ready to share</Eyebrow>
          <Display
            size="lg"
            className="mb-[18px] !text-[44px] md:!text-[64px]"
          >
            {userTitle}
          </Display>

          <div className="font-serif italic text-[16px] md:text-[18px] text-ink-muted mb-[22px] md:mb-7">
            Your shelf is ready. Download the image, share anywhere, or publish a
            link to a page where people can browse every title.
          </div>

          <div className="grid gap-[10px] mb-7">
            <Button
              variant="gold"
              size="lg"
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

          {/* Stats */}
          <div className="grid grid-cols-3 gap-[10px] md:gap-4">
            {[
              { k: String(books.length), l: "books" },
              {
                k: books.reduce((s, b) => s + b.pages, 0).toLocaleString(),
                l: "pages",
              },
              {
                k: books.length
                  ? (books.reduce((s, b) => s + b.rating, 0) / books.length).toFixed(1)
                  : "0.0",
                l: "avg",
              },
            ].map((it) => (
              <div key={it.l}>
                <div className="font-serif italic text-[32px] md:text-[42px] font-medium leading-none text-ink">
                  {it.k}
                </div>
                <div className="text-[11px] tracking-[0.22em] uppercase text-ink-faint mt-1 font-sans">
                  {it.l}
                </div>
              </div>
            ))}
          </div>

          <Hairline className="my-5" />

          <div className="text-xs text-ink-faint font-sans leading-[1.6]">
            The QR on your shelf links to a public page where viewers can see
            every title, author and rating.
          </div>
        </div>
      </div>
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
    <div className="space-y-3 mt-2">
      {/* Public view link */}
      <div className="border border-rule rounded-[2px] p-4 bg-bg-raised">
        <Eyebrow className="!text-[10px] mb-2">Share this publicly</Eyebrow>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs text-ink truncate font-mono">
            {share.viewUrl}
          </code>
          <Button variant="secondary" size="sm" onClick={onCopyView}>
            {copiedView ? (
              <>
                <Icon name="check" size={12} /> Copied
              </>
            ) : (
              <>Copy</>
            )}
          </Button>
        </div>
      </div>

      {/* Edit link — secret */}
      <div className="border border-gold rounded-[2px] p-4 bg-gold-soft">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1 text-gold">
            <Icon name="edit" size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <Eyebrow className="!text-[10px] mb-2 !text-gold">
              Save to edit later
            </Eyebrow>
            <div className="text-[12px] text-ink-muted mb-3 leading-[1.5]">
              Bookmark this link — it&apos;s the only way to edit your shelf. We
              can&apos;t recover it for you.
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs text-ink truncate font-mono">
                {share.editUrl}
              </code>
              <Button variant="secondary" size="sm" onClick={onCopyEdit}>
                {copiedEdit ? (
                  <>
                    <Icon name="check" size={12} /> Copied
                  </>
                ) : (
                  <>Copy</>
                )}
              </Button>
            </div>

            {/* QR for cross-device handoff */}
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-rule">
              <div className="flex-shrink-0 p-2 bg-[#f4ead4]">
                <QRCode
                  size={72}
                  bg="#f4ead4"
                  fg="#1a0e08"
                  seed={share.editUrl}
                />
              </div>
              <div className="text-[11px] text-ink-muted leading-[1.5] font-sans">
                On your laptop?{" "}
                <span className="text-ink">Scan with your phone</span> to open
                the editor there too.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
