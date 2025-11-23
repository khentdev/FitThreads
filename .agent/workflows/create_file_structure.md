---
description: 
---

Feature-Based Folder Structure Engineering Rules
1. Organize by Feature, Not by Technical Layer

Rule: Every domain/feature owns its logic end-to-end.
Examples of features: auth, posts, users, tags, search, profile.

Each feature contains:

API layer / Routes

Controllers

Services

Repositories / Data access

Schemas (validation)

Types / DTOs

Feature-specific components (frontend)

Feature-specific composables (frontend)

Reason: Prevents “God folders” like services/, controllers/, etc.
Everything lives where it logically belongs.

2. Keep the Structure Flat

Rule: No deep nesting inside a feature. Max depth = 3 folders.

Bad:

posts/services/v1/core/logic/


Good:

posts/
  service.ts
  controller.ts
  repository.ts


Reason: Deep nesting increases cognitive load and hurts discoverability.

3. Use Consistent Naming

Rule: Folders should be plural (posts, users, tags)
Files should indicate role clearly:

posts.controller.ts
posts.service.ts
posts.repository.ts
posts.schema.ts
posts.types.ts


Reason: Consistency speeds onboarding and avoids ambiguity.

4. Each Feature Is Self-Contained

Rule: A feature folder must work in isolation except for shared utilities.
No cross-feature imports unless through a shared interface or public API.

Bad:
posts.service.ts importing auth.controller.ts.

Good:
posts.service.ts imports authService via a public barrel in /auth.

5. Shared/Common Goes in Its Own Domain

Rule: Anything used by 2+ features goes into shared/ or common/:

Backend:

middlewares/

exceptions/

utils/

db/

config/

Frontend:

ui/ (reusable components)

lib/

hooks/

api/ (only if API layer is unified)

Reason: Avoid duplication while keeping domains isolated.

6. Feature API Exposure Rule

Each feature must expose a single entry file:

Backend:

posts/
  index.ts    // exports router, service, types if needed


Frontend:

posts/
  index.ts    // exports composables, components, types


Reason: Makes the domain plug-and-play, and migration-friendly.

7. Unit Tests Live Beside the Feature

Rule: *.spec.ts or *.test.ts lives inside the feature folder.

posts/
  posts.service.spec.ts
  posts.controller.spec.ts


Reason: Encourages tight coupling between feature and tests, and makes refactoring safer.

8. Align Backend and Frontend Domain Names

Rule: Feature names must be mirrored across frontend + backend.

Backend:

src/modules/posts/


Frontend:

src/features/posts/


Reason: Improves clarity, searchability, and communication across teams.

9. Barrel Files Only at Feature Root

Rule: Use index.ts inside the feature root, not in every subfolder.

Reason: Prevents circular imports and keeps structure predictable.

10. Scalability Rule

Rule: If a feature grows too big, split into subdomains — still feature-based.

Example: posts turns into:

posts/
  creation/
  reading/
  reactions/


Reason: Feature domains scale horizontally without breaking existing structure.

Summary Checklist (Engineering Ready)

✔ Organize by domain, not by layer
✔ Keep folders flat inside features
✔ One feature = routes + logic + validation + tests
✔ Shared logic isolated in shared
✔ Clear naming conventions
✔ Mirror frontend ↔ backend feature names
✔ Tests live inside features
✔ Use barrel files only at feature roots
✔ Features must be self-contained
✔ Scale horizontally by splitting sub-features