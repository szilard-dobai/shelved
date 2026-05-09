# Shelved

<p align="center">
  <img src="public/icon.png" alt="Shelved Logo" width="80" height="80" />
</p>

<p align="center">
  <strong>Your bookshelf, beautifully.</strong><br />
  Import your reading history, pick a shelf style, download the image, share the link — no signup required.
</p>

<p align="center">
  <a href="https://shelved.ink">
    <img src="https://img.shields.io/website?url=https%3A%2F%2Fshelved.ink&label=shelved.ink" alt="Website Status" />
  </a>
</p>

<p align="center">
  <img src="public/og-image.png" alt="Shelved Preview" width="600" />
</p>

## Features

- Import from a Goodreads CSV, a StoryGraph CSV, or type books in by hand
- Two shelf styles — realistic wood with year dividers, or a clean minimal layout
- Sort by date read, author, or title; add your own headline
- High-res PNG export of the finished shelf, ready for stories or grid posts
- Public share link at `/s/<slug>` with every title listed for accessibility
- Edit-anywhere via a secret `?edit=KEY` link — laptop → phone handoff via on-screen QR
- Anonymous, no signup, no login; your books stay in `localStorage` until you publish

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) with App Router
- **React:** 19.2
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) (CSS-first config via `@theme`)
- **Animation:** [Motion](https://motion.dev/)
- **Storage:** [MongoDB](https://www.mongodb.com/) for published shares + anonymous analytics
- **Image export:** [`html-to-image`](https://github.com/bubkoo/html-to-image) rendered against a 1080×1920 story canvas
- **CSV parsing:** [`csv-parse`](https://csv.js.org/parse/) for Goodreads and StoryGraph exports
- **Covers:** [Open Library](https://openlibrary.org/dev/docs/api/covers) covers API
- **Deployment:** [Vercel](https://vercel.com/) with Analytics

## Getting Started

```bash
cp .env.example .env.local   # fill in MONGODB_URI + MONGODB_DB
npm install
npm run dev                  # Start dev server (http://localhost:3000)
```

## Commands

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start dev server         |
| `npm run build` | Create production build  |
| `npm run start` | Run the production build |
| `npm run lint`  | Run ESLint               |

## Routes

| Route                             | What it does                                           |
| --------------------------------- | ------------------------------------------------------ |
| `/`                               | Landing page with live shelf preview                   |
| `/import`                         | Goodreads CSV, StoryGraph CSV, or manual entry         |
| `/editor`                         | Book gallery, live shelf preview, and styling controls |
| `/export`                         | Final preview, PNG download, publish share link        |
| `/s/[slug]`                       | Public read-only share page                            |
| `GET /api/shares/[slug]`          | Fetch a shared shelf                                   |
| `POST /api/shares`                | Publish a shelf → returns `{ slug, editKey }`          |
| `PUT /api/shares/[slug]?edit=KEY` | Edit an existing shelf                                 |
| `POST /api/tracking`              | Anonymous analytics (port of the `yearly` convention)  |

## Share / Edit Model

No accounts. When you publish, you get two URLs:

- A public view URL — `/s/<slug>` — safe to share anywhere.
- A secret edit URL — `/s/<slug>?edit=<key>` — the only way to edit later.

Keep the edit URL. The export screen renders a QR of it so you can hand off from laptop to phone in a tap. Edit keys are hashed server-side; losing yours means the shelf is read-only forever.

## Attribution

Cover art and book metadata are fetched from the [Open Library](https://openlibrary.org) covers API. All titles, authors, and cover designs belong to their respective publishers and rights holders.
