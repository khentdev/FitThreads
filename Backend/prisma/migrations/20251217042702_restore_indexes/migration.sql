-- CreateIndex
CREATE INDEX "idx_users_bio_trgm" ON "users" USING GIN ("bio" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_users_username_trgm" ON "users" USING GIN ("username" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "idx_users_username_asc" ON "users"("username" ASC, "id" ASC);
