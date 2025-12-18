CREATE EXTENSION IF NOT EXISTS pg_trgm;


-- USER INDEXES
-- Username: Full-text search (for post search by author username)
CREATE INDEX idx_users_username_fts 
ON users 
USING GIN (to_tsvector('english', username));

-- Username: Trigram for profile search (case-insensitive contains)
CREATE INDEX idx_users_username_trgm 
ON users 
USING gin (username gin_trgm_ops);

-- Bio: Trigram for profile search
CREATE INDEX idx_users_bio_trgm 
ON users 
USING gin (bio gin_trgm_ops);

-- Pagination for profile search
CREATE INDEX idx_users_username_asc 
ON users (username ASC, id ASC);

-- POST INDEXES
-- Title: Full-text search
CREATE INDEX idx_posts_title_fts 
ON posts 
USING GIN (to_tsvector('english', title));

-- Content: Full-text search
CREATE INDEX idx_posts_content_fts 
ON posts 
USING GIN (to_tsvector('english', content));

-- Feed cursor optimization (already in Prisma schema)
-- idx_posts_feed_cursor: (createdAt DESC, id DESC


-- TAG INDEXES
-- Tag name: Full-text search (for post search by tag)
CREATE INDEX idx_tags_name_fts 
ON tags 
USING GIN (to_tsvector('english', name));