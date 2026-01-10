# Project Overview – FitThreads

FitThreads is a minimalist, text-based social blog built exclusively for fitness-related content. It provides a focused space where people can share and read fitness ideas, thoughts, and experiences without distractions from unrelated topics.

## Goal
To create a fitness-only social platform that prioritizes meaningful discussion, clarity, and relevance over noise and virality.

## Mission
To help people share authentic fitness ideas in a dedicated environment—unlike broad social platforms where fitness content gets lost among unrelated topics.

## Design Inspiration
FitThreads is inspired by Threads by Meta Platforms, Inc., particularly its text-first UI and feed interaction patterns.  
While some interaction logic is similar, all features are independently designed and implemented to support a minimalist, fitness-only experience.

## What It Achieves
- Keeps all content fitness-focused
- Encourages thoughtful reading and writing
- Removes distractions common in mainstream social platforms
- Builds a clean, scalable foundation for a focused fitness community

## Tech Stack

### Frontend
- Vue 3 + TypeScript
- TailwindCSS
- TanStack Vue Query
- Vue Router

### Backend
- Node.js + Hono
- Prisma ORM
- JWT-based authentication

### Infrastructure
- PostgreSQL (database)
- Redis (caching/session management)

### Deployment
- Vercel (Frontend)
- Render (Backend)
- Neon (Database)

> Status: **MVP Completed**. Active development continues.
>
> *This project is being maintained and evolved indefinitely.*

## Key Learnings
- **Security & Auth**: Implemented secure OTP flows, multi-layered rate limiting (IP/User/Email) to prevent abuse, and strict cookie configuration (SameSite/Secure).
- **Performance**: Mastered optimistic UI updates and frontend caching for instant interactions. Optimized PostgreSQL with Full Text Search and targeted indexing.
- **Testing & Quality**: Adopted a "Test First" strategy using Vitest to catch logic errors early. Standardized error handling with mapped error codes.
- **DevOps & DX**: Dockerized the local development environment for consistency.
- **System Design**: Learned to architect feature requirements and database schemas upfront, ensuring efficient data flows and scalable relationships.
- **UI/UX**: Focused on semantic color theming and polished user experiences.

