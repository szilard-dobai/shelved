"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Eyebrow, Display, Wordmark } from "@/components/ui/typography";
import { Icon, type IconName } from "@/components/ui/Icon";
import { trackEvent } from "@/lib/tracking";

type Method = "csv" | "storygraph" | "search" | null;

interface MethodCard {
  id: "csv" | "storygraph" | "search";
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
    blurb: "Upload your Goodreads library export.",
    tag: "Most popular",
  },
  {
    id: "storygraph",
    icon: "upload",
    label: "Storygraph CSV",
    blurb: "Same idea — upload your Storygraph export.",
    tag: null,
  },
  {
    id: "search",
    icon: "edit",
    label: "Type them in",
    blurb: "Add books one at a time, by hand.",
    tag: null,
  },
];

export default function ImportPage() {
  const router = useRouter();
  const [method, setMethod] = useState<Method>(null);
  const [dragOver, setDragOver] = useState(false);
  const [title, setTitle] = useState("");

  useEffect(() => {
    trackEvent("import_view");
  }, []);

  const selectMethod = (m: "csv" | "storygraph" | "search") => {
    setMethod(m);
    trackEvent("import_method_selected", { method: m });
  };

  const isCsv = method === "csv" || method === "storygraph";
  const sourceLabel = method === "storygraph" ? "Storygraph" : "Goodreads";

  return (
    <div className="absolute inset-0 bg-bg overflow-auto">
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

      <div className="text-center max-w-[900px] mx-auto px-5 pt-12 pb-6 md:px-12 md:pt-20 md:pb-10">
        <Eyebrow className="mb-[14px] md:mb-5">Bring your books</Eyebrow>
        <Display size="xl" className="!text-[48px] md:!text-[88px]">
          How do you track?
        </Display>
        <p className="font-serif italic text-[16px] md:text-[20px] text-ink-muted mt-[18px]">
          Pick any method below — you can add more later.
        </p>
      </div>

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

      <div className="px-5 pt-4 pb-12 md:px-12 md:pt-5 max-w-[1200px] mx-auto min-h-[360px]">
        {isCsv && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              trackEvent("csv_upload", { source: "drop", from: method });
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
              .csv from {sourceLabel} · up to 5,000 books
            </div>
            <Button
              variant="gold"
              onClick={() =>
                trackEvent("csv_upload", { source: "button", from: method })
              }
            >
              Choose a file
            </Button>
            <div className="mt-8 text-xs text-ink-faint font-sans">
              <a className="text-ink-muted underline underline-offset-[3px] cursor-pointer">
                How to export from {sourceLabel} →
              </a>
            </div>
          </div>
        )}

        {method === "search" && (
          <div className="bg-bg-raised border border-rule p-[22px] md:p-8 rounded-[2px]">
            <Eyebrow className="mb-4">Type a book to add</Eyebrow>
            <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_80px] gap-3 items-end">
              <div>
                <div className="font-sans text-[10px] tracking-[0.2em] text-ink-faint uppercase mb-1">
                  Title
                </div>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Name of the Wind"
                  className="w-full box-border bg-transparent border-0 border-b border-rule text-ink font-serif italic text-[22px] py-1 outline-none focus:border-rule-strong"
                />
              </div>
              <div>
                <div className="font-sans text-[10px] tracking-[0.2em] text-ink-faint uppercase mb-1">
                  Author
                </div>
                <input
                  placeholder="Patrick Rothfuss"
                  className="w-full box-border bg-transparent border-0 border-b border-rule text-ink font-serif italic text-[22px] py-1 outline-none focus:border-rule-strong"
                />
              </div>
              <div>
                <div className="font-sans text-[10px] tracking-[0.2em] text-ink-faint uppercase mb-1">
                  Year
                </div>
                <input
                  placeholder="2007"
                  className="w-full box-border bg-transparent border-0 border-b border-rule text-ink font-serif italic text-[22px] py-1 outline-none focus:border-rule-strong"
                />
              </div>
            </div>
            <div className="flex justify-between items-center mt-[22px] gap-3 flex-wrap">
              <div className="font-sans text-[13px] text-ink-muted">
                You can edit covers, ratings &amp; dates next.
              </div>
              <div className="flex gap-[10px]">
                <Button variant="secondary" size="sm">
                  + Add another
                </Button>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => {
                    trackEvent("book_added_manual", { source: "import" });
                    router.push("/editor");
                  }}
                >
                  Done
                </Button>
              </div>
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
