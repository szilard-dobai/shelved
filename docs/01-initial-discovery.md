---
name: Shelved - April 2026 project idea
description: Bookshelf visualizer project idea for April 2026 - import books, generate beautiful shelf image, download and share
type: project
---

**Shelved** — Your bookshelf, visualized.

**Core flow:** Import your books (Goodreads/Storygraph CSV or manual search) → see them on a beautiful bookshelf → choose a visual style → download the image → share it.

**Key details:**
- Books sorted by date read, with year dividers (2024, 2025, 2026)
- Option to sort by author instead
- Book covers/spines pulled from Open Library API
- Multiple shelf styles (realistic wood, minimal, etc.) — start with one, add more
- Downloadable as image
- No signup, no database, fully local
- Same model as Yearly: one session, one output, no commitment

**Tech:** React/TS, Vite, Tailwind, Vercel. Canvas or HTML-to-image for export. Open Library API for book metadata/covers.

**Input options for v1:**
1. CSV upload (Goodreads/Storygraph export) — the "wow" moment for power users
2. Manual search & add (via Open Library API) — catches everyone else

**Important constraints:**
- Goodreads killed their API in 2020, so no OAuth flow — CSV export only
- The Storygraph is a growing alternative, also has CSV export
- The visual is the whole point — needs to make people go "I want mine"

**Marketing angle:** BookTok, Bookstagram, BookTwitter. Mid-year reading check-ins. Summer reading lists. The reading community is huge, chronically online, and loves visual content.

**Why:** line: Szilard was already thinking about this independently. Matches the Yearly DNA — visual, shareable, zero friction. Reading community is massive and underserved for visual tools.

**How to apply:** When picking this up, start with the visual design direction (the shelf rendering) since that's the core differentiator. Everything else is straightforward.
