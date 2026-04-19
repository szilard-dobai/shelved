import { NextResponse } from "next/server";
import { getSharesCollection } from "@/lib/mongodb";
import {
  hashEditKey,
  sanitizePayload,
  type ShareDoc,
} from "@/lib/shelf/share";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  try {
    const collection = await getSharesCollection();
    const doc = await collection.findOne<ShareDoc>(
      { slug },
      { projection: { editKeyHash: 0 } },
    );
    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({
      slug: doc.slug,
      books: doc.books,
      userTitle: doc.userTitle,
      sortMode: doc.sortMode,
      style: doc.style,
      bgVariant: doc.bgVariant,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  } catch (error) {
    console.error("Share fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const url = new URL(request.url);
  const editKey = url.searchParams.get("edit");
  if (!editKey) {
    return NextResponse.json({ error: "Missing edit key" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = sanitizePayload(body);
  if (!payload) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const collection = await getSharesCollection();
    const result = await collection.updateOne(
      { slug, editKeyHash: hashEditKey(editKey) },
      {
        $set: {
          books: payload.books,
          userTitle: payload.userTitle,
          sortMode: payload.sortMode,
          style: payload.style,
          bgVariant: payload.bgVariant,
          updatedAt: new Date(),
        },
      },
    );
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Unauthorized or not found" },
        { status: 403 },
      );
    }
  } catch (error) {
    console.error("Share update failed:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
