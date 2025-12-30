---
trigger: always_on
---

# FitThreads – Project Overview & Technical Guidelines
## What Is FitThreads?
FitThreads is a minimalist, text-based social blog built exclusively for fitness-related content. It provides a focused space where people can share and read fitness ideas, thoughts, and experiences without distractions.
**Goal:** Create a fitness-only social platform that prioritizes meaningful discussion, clarity, and relevance over noise and virality.
**Mission:** Help people share authentic fitness ideas in a dedicated environment—unlike broad social platforms where fitness content gets lost among unrelated topics.
**Design Inspiration:** Inspired by Threads by Meta—text-first UI and clean feed interactions, but independently designed and implemented for a fitness-only experience.
**Core Promise:** "If it doesn't help someone read or write a better fitness thought, it doesn't belong here."

## Tech Stack (Locked In)
### Frontend
- Vue 3 + TypeScript (`<script setup>`, Composition API only)
- TailwindCSS v4 (no CSS modules, no scoped styles unless needed)
- TanStack Vue Query + Pinia for server state
- Vue Router 4
- Lucide Vue Next (icons only)

### Backend
- Node.js 20 + Hono (never Express)
- Prisma ORM + PostgreSQL (Neon)
- Redis (Upstash) for rate limiting & magic-link tokens
- JWT in http-only cookies (no localStorage)

### Deployment
- Frontend → Vercel
- Backend → Render
- Database → Neon
- Cache → Upstash Redis

**No new frameworks, no "just try X", no shiny replacements. Ever.**
## MVP Scope (Hard Boundaries)
**Included:** Feed, text posts, tags, likes (fire icon), favorites, search (Top/Recent/Profiles), profiles, auth (email/password + magic link), light/dark mode
**Excluded until post-MVP:** Comments, images, follows, notifications, mentions, reposts
Everything outside the included scope is forbidden until explicitly approved.

## Core Engineering Rules
- **Pure functional core** everywhere possible
- **Optimistic UI** mandatory for likes & favorites
- **Cursor-based pagination** only (never offset)
- **PostgreSQL FTS** for search (no third-party search services)
- **Rate limiting** mandatory on all mutation endpoints (see `.agent/rules/rate_limits.md`)
- **Plain text only** — zero Markdown rendering
- **Brutal minimalism** — no avatars, no gradients, no animations unless they serve readability
- **Accessibility & performance first** — assume 3G + screen reader
- **Type safety & validation** — validate all inputs (client + server)
- **Testing** — Vitest + MSW minimum; Cypress only after MVP
- **Delete code > add code**

## When in Doubt
Ask: "Does this make reading or writing a fitness thought faster or clearer?"
If the answer is no → don't do it.
---
These rules are the DNA of FitThreads. They apply to every file, every suggestion, every refactor in this workspace forever.