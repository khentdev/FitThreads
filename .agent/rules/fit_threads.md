---
trigger: always_on
---

# FitThreads – Permanent Project-Wide Rules (Nov 2025 → forever)
# These rules are locked in for this entire workspace. Never override or ignore them.

## 1. Project Identity & Mission (never forget why this exists)
FitThreads is a minimalist, text-only social platform for authentic fitness thoughts.  
Purpose: Give people a clean, fast, distraction-free space to read and share real fitness ideas — no ads, no algorithms, no noise.  
Core promise: “If it doesn’t help someone read or write a better fitness thought, it doesn’t belong here.”

## 2. Tech Stack – This is final, no debates
Frontend  
- Vue 3 + TypeScript + <script setup> (Composition API only)  
- TailwindCSS version -4 (search docs for using it in vite) only (no CSS modules, no scoped styles (unless needed), no icon component libraries except lucide-vue-next)  
- TanStack Vue Query and Pinia store for all server state  
- Vue Router 4  
 

Backend  
- Node.js 20 + Hono (never Express)  
- Prisma ORM + PostgreSQL (Neon)  
- Redis (Upstash) for rate limiting & magic-link tokens  
- JWT in http-only cookies (no localStorage)  

Deployment  
- Frontend → Vercel  
- Backend → Render
- DB → Neon.tech  

No new frameworks, no “just try X”, no shiny replacements. Ever.

## 3. MVP Scope – Hard boundaries (do NOT add these unless explicitly ordered)
Current MVP includes ONLY:  
- Feed, plain-text posts + tags, likes (fire icon), favorites, search (Top / Recent / Profiles), profiles, auth (email/password + magic link), light/dark mode  

Everything else (comments, images, follows, notifications, mentions, reposts, etc.) is post-MVP and forbidden until the owner says “add it now”.

## 4. Non-Negotiable Engineering Rules
- Pure functional core everywhere possible  
- Optimistic UI mandatory for likes & favorites  
- Cursor-based pagination only (never offset)  
- Full-text search = PostgreSQL FTS + trigram indexes (no Algolia, Meili, Typesense)  
- Manual Validation - Type checks every API endpoints, validation inputs etc.  
- Rate limiting: 6 posts/hour & 100 likes/min per user (Redis-backed)  
- Plain text only — zero Markdown rendering  
- Brutal minimalism: no avatars, no gradients, no animations unless they serve readability  
- Accessibility & performance first — assume 3G + screen reader  
- Tests: Vitest + MSW minimum; Cypress only after MVP  
- Delete code > add code  

## 5. When in doubt
Ask: “Does this make reading or writing a fitness thought faster or clearer?”  
If the answer is no → don’t do it.

These rules are the DNA of FitThreads. They apply to every file, every suggestion, every refactor in this workspace forever.