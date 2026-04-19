import { NextResponse } from "next/server";
import { customAlphabet } from "nanoid";
import { getSharesCollection } from "@/lib/mongodb";
import {
  generateEditKey,
  hashEditKey,
  sanitizePayload,
  type ShareDoc,
} from "@/lib/shelf/share";

export const dynamic = "force-dynamic";

const slugAlphabet = "0123456789abcdefghijkmnpqrstuvwxyz";
const makeSlug = customAlphabet(slugAlphabet, 8);

export async function POST(request: Request) {
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

  const slug = makeSlug();
  const editKey = generateEditKey();
  const now = new Date();

  const doc: ShareDoc = {
    slug,
    editKeyHash: hashEditKey(editKey),
    ...payload,
    createdAt: now,
    updatedAt: now,
    views: 0,
  };

  try {
    const collection = await getSharesCollection();
    await collection.insertOne(doc);
  } catch (error) {
    console.error("Share create failed:", error);
    return NextResponse.json(
      { error: "Failed to publish" },
      { status: 500 },
    );
  }

  return NextResponse.json({ slug, editKey });
}
