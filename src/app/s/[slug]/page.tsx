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

export default async function SharePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = await loadShare(slug);
  if (!doc) notFound();

  return (
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
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = await loadShare(slug);
  if (!doc) return { title: "Shelf not found — Shelved" };
  return {
    title: `${doc.userTitle} — Shelved`,
    description: `${doc.books.length} books on a shared Shelved bookshelf.`,
  };
}
