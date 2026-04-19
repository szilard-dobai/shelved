"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Eyebrow, Display, Wordmark } from "@/components/ui/typography";
import { Icon, type IconName } from "@/components/ui/Icon";
import { trackEvent } from "@/lib/tracking";

type Method = "csv" | "isbn" | "search" | null;

interface MethodCard {
  id: "csv" | "isbn" | "search";
  icon: IconName;
  label: string;
  blurb: string;
  tag: string | null;
}

const METHODS: MethodCard[] = [
  {
    id: "csv",
    icon: "upload",
    label: "Goodreads CSV",
    blurb: "Upload your library export. The fastest path.",
    tag: "Most popular",
  },
  {
    id: "isbn",
    icon: "hash",
    label: "Paste ISBNs",
    blurb: "One per line. We'll match covers & metadata.",
    tag: null,
  },
  {
    id: "search",
    icon: "search",
    label: "Search & add",
    blurb: "Find books by title or author, one at a time.",
    tag: null,
  },
];

export default function ImportPage() {
  const router = useRouter();
  const [method, setMethod] = useState<Method>(null);
  const [isbnText, setIsbnText] = useState(
    "9780441172719\n9780553573404\n9781594205231\n9780385490818",
  );
  const [search, setSearch] = useState("");
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    trackEvent("import_view");
  }, []);

  const selectMethod = (m: "csv" | "isbn" | "search") => {
    setMethod(m);
    trackEvent("import_method_selected", { method: m });
  };

  const mockSearchResults =
    search.length > 1
      ? [
          { title: "The Name of the Wind", author: "Patrick Rothfuss", year: 2007 },
          { title: "The Wise Man's Fear", author: "Patrick Rothfuss", year: 2011 },
          {
            title: "The Slow Regard of Silent Things",
            author: "Patrick Rothfuss",
            year: 2014,
          },
        ]
      : [];

  return (
    <div className="absolute inset-0 bg-bg overflow-auto">
      {/* Top bar */}
      <div className="sticky top-0 z-[5] flex items-center justify-between px-5 py-4 md:px-12 md:py-6 bg-bg border-b border-rule gap-3">
        <div className="flex items-center gap-3 md:gap-5 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-2 text-ink-muted hover:text-ink text-[13px] font-sans"
            aria-label="Back"
          >
            <Icon name="arrowLeft" size={16} />
            <span className="hidden md:inline">Back</span>
          </Link>
          <div className="hidden md:block w-px h-5 bg-rule" />
          <Wordmark size={20} className="!text-[18px] md:!text-[20px]" />
        </div>
        <div className="hidden md:block font-sans text-xs text-ink-faint tracking-[0.3em]">
          STEP 1 OF 3 · IMPORT
        </div>
      </div>

      {/* Hero */}
      <div className="text-center max-w-[900px] mx-auto px-5 pt-12 pb-6 md:px-12 md:pt-20 md:pb-10">
        <Eyebrow className="mb-[14px] md:mb-5">Bring your books</Eyebrow>
        <Display size="xl" className="!text-[48px] md:!text-[88px]">
          How do you track?
        </Display>
        <p className="font-serif italic text-[16px] md:text-[20px] text-ink-muted mt-[18px]">
          Pick any method below — you can add more later.
        </p>
      </div>

      {/* Method cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5 px-5 md:px-12 pb-6 md:pb-8 max-w-[1200px] mx-auto">
        {METHODS.map((m) => {
          const active = method === m.id;
          return (
            <button
              key={m.id}
              onClick={() => selectMethod(m.id)}
              className={[
                "text-left rounded-[2px] p-8 cursor-pointer text-ink font-sans relative transition-all",
                active
                  ? "bg-bg-raised border border-gold"
                  : "bg-transparent border border-rule hover:border-rule-strong",
              ].join(" ")}
            >
              {m.tag && (
                <div className="absolute top-4 right-4 text-[10px] uppercase tracking-[0.2em] text-gold">
                  {m.tag}
                </div>
              )}
              <div className={`mb-4 md:mb-5 ${active ? "text-gold" : "text-ink"}`}>
                <Icon name={m.icon} size={28} />
              </div>
              <div className="font-serif italic text-[22px] md:text-[28px] font-medium mb-2 text-ink">
                {m.label}
              </div>
              <div className="text-sm text-ink-muted leading-[1.5]">
                {m.blurb}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active method panel */}
      <div className="px-5 pt-4 pb-12 md:px-12 md:pt-5 max-w-[1200px] mx-auto min-h-[360px]">
        {method === "csv" && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              trackEvent("csv_upload", { source: "drop" });
            }}
            className={[
              "rounded-[2px] p-8 md:p-16 text-center border-2 border-dashed transition-all",
              dragOver ? "border-gold bg-gold-soft" : "border-rule-strong bg-bg-raised",
            ].join(" ")}
          >
            <div className="text-gold flex justify-center">
              <Icon name="upload" size={40} />
            </div>
            <div className="font-serif italic text-[24px] md:text-[32px] mt-4 md:mt-5 text-ink">
              Drop your export here
            </div>
            <div className="text-sm text-ink-muted mt-2 mb-6 md:mb-7">
              .csv from Goodreads or Storygraph · up to 5,000 books
            </div>
            <Button
              variant="gold"
              onClick={() => trackEvent("csv_upload", { source: "button" })}
            >
              Choose a file
            </Button>
            <div className="mt-8 text-xs text-ink-faint font-sans">
              <a className="text-ink-muted underline underline-offset-[3px] cursor-pointer">
                How to export from Goodreads →
              </a>
            </div>
          </div>
        )}

        {method === "isbn" && (
          <div className="bg-bg-raised border border-rule p-5 md:p-8 rounded-[2px]">
            <Eyebrow className="mb-3">ISBN · one per line</Eyebrow>
            <textarea
              value={isbnText}
              onChange={(e) => setIsbnText(e.target.value)}
              className="w-full min-h-[220px] box-border bg-bg text-ink border border-rule rounded-[2px] p-4 text-sm leading-[1.7] outline-none resize-y font-mono"
            />
            <div className="flex justify-between items-center mt-4">
              <div className="font-sans text-[13px] text-ink-muted">
                {isbnText.split("\n").filter((l) => l.trim()).length} ISBNs detected
              </div>
              <Button
                variant="gold"
                onClick={() => {
                  trackEvent("isbn_import", {
                    count: isbnText.split("\n").filter((l) => l.trim()).length,
                  });
                  router.push("/editor");
                }}
              >
                Match & import
              </Button>
            </div>
          </div>
        )}

        {method === "search" && (
          <div className="bg-bg-raised border border-rule p-5 md:p-8 rounded-[2px]">
            <div className="relative">
              <div className="absolute top-0 left-0 text-ink-muted">
                <Icon name="search" size={18} />
              </div>
              <input
                autoFocus
                placeholder="Search by title or author…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="absolute -top-1 left-[30px] right-0 bg-transparent border-none outline-none text-ink font-serif italic text-[22px] md:text-[28px] font-medium"
              />
            </div>
            <div className="h-px bg-rule mt-[22px]" />
            <div className="mt-2">
              {mockSearchResults.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center gap-5 py-[14px] border-b border-rule"
                >
                  <div
                    className="w-11 h-16 flex-shrink-0"
                    style={{
                      background: "linear-gradient(135deg, #8b4e28, #3a1e10)",
                    }}
                  />
                  <div className="flex-1">
                    <div className="font-serif italic text-[20px] text-ink">
                      {r.title}
                    </div>
                    <div className="text-[13px] text-ink-muted mt-[2px]">
                      {r.author} · {r.year}
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      trackEvent("search_result_added", { title: r.title })
                    }
                  >
                    + Add
                  </Button>
                </div>
              ))}
              {!search && (
                <div className="text-center py-10 text-ink-faint font-serif italic text-[18px]">
                  Type to find a book.
                </div>
              )}
            </div>
          </div>
        )}

        {!method && (
          <div className="text-center py-8">
            <div className="font-sans text-[13px] text-ink-faint tracking-[0.16em] uppercase">
              or —
            </div>
            <div className="mt-4">
              <Link
                href="/editor"
                onClick={() => trackEvent("skip_with_sample_click")}
                className="text-ink font-serif italic text-[22px] underline underline-offset-[6px] decoration-rule-strong"
              >
                skip & try with sample books
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
