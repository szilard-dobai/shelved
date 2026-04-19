# Shelved

Your bookshelf, visualized. Import your reading history, pick a shelf style, download the image, share the link.

## Stack

- Next.js 16 App Router · React 19 · TypeScript
- Tailwind v4 (CSS-first config via `@theme`)
- MongoDB for anonymous share storage and analytics

## Getting started

```bash
cp .env.example .env.local   # fill in MONGODB_URI + MONGODB_DB
npm install
npm run dev
```

Open http://localhost:3000.

## Routes

- `/` — landing
- `/import` — Goodreads CSV / ISBN paste / manual search
- `/editor` — book gallery + live shelf preview + controls
- `/export` — final preview, PNG download, publish share link
- `/s/[slug]` — public read-only share page
- `GET /api/shares/[slug]` — fetch a shared shelf
- `POST /api/shares` — publish a shelf → returns `{slug, editKey}`
- `PUT /api/shares/[slug]?edit=KEY` — edit an existing shelf
- `POST /api/tracking` — anonymous analytics (port of the `yearly` convention)

## Share / edit model

No auth. When you publish, you get a public view URL (`/s/slug`) and a secret edit URL (`/s/slug?edit=KEY`). Keep the edit URL — it's the only way to edit. A QR of the edit URL on the export screen makes laptop → phone handoff trivial. The edit key is stored hashed server-side.
