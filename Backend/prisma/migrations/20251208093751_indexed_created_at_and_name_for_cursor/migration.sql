-- CreateIndex
CREATE INDEX "idx_posts_feed_cursor" ON "posts"("createdAt", "id");
