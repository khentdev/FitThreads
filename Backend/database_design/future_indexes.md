# Future Database Indexing Strategy

## 1. Full-Text Search (Post Content)
*   **Where to add:** `Post` table on the `title` and `content` columns combined.
*   **Index Type:** GIN (Generalized Inverted Index) with `tsvector`.
*   **Why:** To allow users to search for concepts rather than just exact words.
*   **Example:** A user searches for **"running tips"** and successfully finds a post titled **"Top 10 tips for a better run"** (matching "run" to "running").

## 2. Fuzzy Search (Usernames & Tags)
*   **Where to add:** `User` table (`username` column) and `Tag` table (`name` column).
*   **Index Type:** Trigram Index (using `pg_trgm`).
*   **Why:** To handle typos and partial matches in search bars.
*   **Example:** A user types **"khent"** in the search bar and the system suggests the profile **"kent_dev"** or **"the_khent"**.

## 3. Feed Optimization (Active Posts Only)
*   **Where to add:** `Post` table on `createdAt`.
*   **Index Type:** Partial Index (Filtered).
*   **Why:** To speed up the main feed by completely ignoring deleted posts at the database level.
*   **Example:** When fetching the **"Recent Posts"** feed, the database skips checking the 5,000 deleted spam posts and instantly retrieves the 10 newest valid posts.

## 4. Profile Feed Speed (Composite Index)
*   **Where to add:** `Post` table on `authorId` + `createdAt`.
*   **Index Type:** Composite B-Tree Index.
*   **Why:** To instantly load a specific user's history in chronological order without sorting manually.
*   **Example:** Clicking on a user's profile instantly loads their last 50 posts, even if they have posted 10,000 times over 5 years.
