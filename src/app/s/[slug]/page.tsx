import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSharesCollection } from "@/lib/mongodb";
import type { ShareDoc } from "@/lib/shelf/share";
import { SharePageClient } from "./SharePageClient";

export const dynamic = "force-dynamic";

async function loadShare(slug: string) {
  const collection = await getSharesCollection();
  const doc = await collection.findOne<ShareDoc>(
    { slug },
    { projection: { editKeyHash: 0, _id: 0 } },
  );
  return doc;
}

function buildShelfJsonLd(doc: ShareDoc, slug: string) {
  const visible =
    doc.yearFilter != null && doc.books.some((b) => b.year === doc.yearFilter)
      ? doc.books.filter((b) => b.year === doc.yearFilter)
      : doc.books;
  const url = `https://shelved.ink/s/${slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: doc.userTitle,
    url,
    isPartOf: {
      "@type": "WebSite",
      name: "Shelved",
      url: "https://shelved.ink",
    },
    mainEntity: {
      "@type": "ItemList",
      name: doc.userTitle,
      numberOfItems: visible.length,
      itemListElement: visible.map((book, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Book",
          name: book.title,
          author: { "@type": "Person", name: book.author },
          ...(book.year ? { datePublished: String(book.year) } : {}),
          ...(book.pages ? { numberOfPages: book.pages } : {}),
          ...(book.rating > 0
            ? {
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: book.rating,
                  bestRating: 5,
                  worstRating: 1,
                  ratingCount: 1,
                },
              }
            : {}),
        },
      })),
    },
  };
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = await loadShare(slug);
  if (!doc) notFound();

  const jsonLd = buildShelfJsonLd(doc, slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SharePageClient
        slug={doc.slug}
        books={doc.books}
        userTitle={doc.userTitle}
        sortMode={doc.sortMode}
        style={doc.style}
        bgVariant={doc.bgVariant}
        showBookCount={doc.showBookCount !== false}
        showPages={doc.showPages !== false}
        showRating={doc.showRating !== false}
        yearFilter={doc.yearFilter ?? null}
      />
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = await loadShare(slug);
  if (!doc) {
    return {
      title: "Shelf not found",
      robots: { index: false, follow: false },
    };
  }
  const visibleCount =
    doc.yearFilter != null && doc.books.some((b) => b.year === doc.yearFilter)
      ? doc.books.filter((b) => b.year === doc.yearFilter).length
      : doc.books.length;
  const description = `${doc.userTitle} — a shared bookshelf of ${visibleCount} ${
    visibleCount === 1 ? "book" : "books"
  } on Shelved. Browse every title, author and rating.`;
  const path = `/s/${slug}`;
  return {
    title: doc.userTitle,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title: `${doc.userTitle} · Shelved`,
      description,
      url: path,
      siteName: "Shelved",
    },
    twitter: {
      card: "summary_large_image",
      title: `${doc.userTitle} · Shelved`,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}
