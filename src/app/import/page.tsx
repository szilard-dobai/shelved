"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Display, Eyebrow, Wordmark } from "@/components/ui/typography";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useIsMobile } from "@/lib/use-media";
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
  const mobile = useIsMobile();
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
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-rule bg-bg px-5 py-4 md:px-12 md:py-6">
        <div className="flex min-w-0 items-center gap-3 md:gap-5">
          <Link
            href="/"
            className="flex items-center gap-2 font-sans text-md text-ink-muted hover:text-ink"
            aria-label="Back"
          >
            <Icon name="arrowLeft" size={16} />
            <span className="hidden md:inline">Back</span>
          </Link>
          <div className="hidden h-5 w-px bg-rule md:block" />
          <Wordmark size={mobile ? 18 : 20} />
        </div>
        <div className="hidden font-sans text-xs tracking-eyebrow text-ink-faint md:block">
          STEP 1 OF 3 · IMPORT
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-5 pt-12 pb-6 text-center md:px-12 md:pt-20 md:pb-10">
        <Eyebrow className="mb-3.5 md:mb-5">Bring your books</Eyebrow>
        <Display size="xl" className="!text-5xl md:!text-display-lg">
          How do you track?
        </Display>
        <p className="mt-4 font-serif text-base italic text-ink-muted md:mt-5 md:text-xl">
          Pick any method below — you can add more later.
        </p>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-3 px-5 pb-6 md:grid-cols-3 md:gap-5 md:px-12 md:pb-8">
        {METHODS.map((m) => {
          const active = method === m.id;
          return (
            <button
              key={m.id}
              onClick={() => selectMethod(m.id)}
              className={[
                "relative cursor-pointer rounded-xs p-8 text-left font-sans text-ink transition-all",
                active
                  ? "border border-gold bg-bg-raised"
                  : "border border-rule bg-transparent hover:border-rule-strong",
              ].join(" ")}
            >
              {m.tag && (
                <div className="absolute right-4 top-4 text-2xs uppercase tracking-widest text-gold">
                  {m.tag}
                </div>
              )}
              <div className={`mb-4 md:mb-5 ${active ? "text-gold" : "text-ink"}`}>
                <Icon name={m.icon} size={28} />
              </div>
              <div className="mb-2 font-serif text-2xl font-medium italic text-ink md:text-3xl">
                {m.label}
              </div>
              <div className="text-sm leading-normal text-ink-muted">
                {m.blurb}
              </div>
            </button>
          );
        })}
      </section>

      <section className="mx-auto min-h-[22.5rem] max-w-6xl px-5 pt-4 pb-12 md:px-12 md:pt-5">
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
              "rounded-xs border-2 border-dashed p-8 text-center transition-all md:p-16",
              dragOver
                ? "border-gold bg-gold-soft"
                : "border-rule-strong bg-bg-raised",
            ].join(" ")}
          >
            <div className="flex justify-center text-gold">
              <Icon name="upload" size={40} />
            </div>
            <div className="mt-4 font-serif text-2xl italic text-ink md:mt-5 md:text-3xl">
              Drop your export here
            </div>
            <div className="mt-2 mb-6 text-sm text-ink-muted md:mb-7">
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
            <div className="mt-8 font-sans text-xs text-ink-faint">
              <a className="cursor-pointer text-ink-muted underline underline-offset-2">
                How to export from {sourceLabel} →
              </a>
            </div>
          </div>
        )}

        {method === "search" && (
          <div className="rounded-xs border border-rule bg-bg-raised p-6 md:p-8">
            <Eyebrow className="mb-4">Type a book to add</Eyebrow>
            <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-[1.4fr_1fr_5rem]">
              <SearchField
                label="Title"
                placeholder="e.g. The Name of the Wind"
                value={title}
                onChange={setTitle}
              />
              <SearchField label="Author" placeholder="Patrick Rothfuss" />
              <SearchField label="Year" placeholder="2007" />
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="font-sans text-md text-ink-muted">
                You can edit covers, ratings &amp; dates next.
              </div>
              <div className="flex gap-2.5">
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
          <div className="py-8 text-center">
            <div className="font-sans text-md uppercase tracking-widest text-ink-faint">
              or —
            </div>
            <div className="mt-4">
              <Link
                href="/editor"
                onClick={() => trackEvent("skip_with_sample_click")}
                className="font-serif text-2xl italic text-ink underline underline-offset-8 decoration-rule-strong"
              >
                skip & try with sample books
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function SearchField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div>
      <div className="mb-1 font-sans text-2xs uppercase tracking-widest text-ink-faint">
        {label}
      </div>
      <input
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        className="box-border w-full border-0 border-b border-rule bg-transparent py-1 font-serif text-2xl italic text-ink outline-none focus:border-rule-strong"
      />
    </div>
  );
}
