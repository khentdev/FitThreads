import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "../../../../prisma/prismaConfig.js";
import { getRedisClient } from "../../../configs/redis.js";
import bcrypt from "bcrypt";
import { refreshSessionService } from "../service.js";
import { generateTokens } from "../tokens.js";
import { hashData } from "../../../lib/hash.js";
import { getCacheKey } from "../utils/cache-keys.js";
import { SessionCachePayload } from "../types.js";

describe("Refresh Session Integration Tests", () => {
    const redis = getRedisClient();
    const testUser = {
        username: "session_test_user",
        email: "sessiontest@example.com",
        password: "password123"
    };
    const testDeviceId = JSON.stringify({
        userAgent: "test_browser",
        platform: "test_platform",
    });

    beforeEach(async () => {
        await prisma.user.deleteMany({
            where: { email: testUser.email }
        });
        const user = await prisma.user.findUnique({ where: { email: testUser.email } });
        if (user) {
            await prisma.session.deleteMany({ where: { userId: user.id } });
            await prisma.tokenCleanupQueue.deleteMany({ where: { userId: user.id } });
        }
        const keys = await redis.keys("*session*");
        if (keys.length > 0) await redis.del(...keys);
    });

    afterAll(async () => {
        await prisma.user.deleteMany({
            where: { email: testUser.email }
        });
        await prisma.$disconnect();
    });

    it("Should handle normal session refresh and gets cached payload.", async () => {
        const hashedPassword = await bcrypt.hash(testUser.password, 10);
        const user = await prisma.user.create({
            data: {
                username: testUser.username,
                email: testUser.email,
                hashedPassword,
                emailVerified: true,
                emailVerifiedAt: new Date()
            }
        });

        const { refreshToken, refreshTokenExpiry } = await generateTokens({
            userId: user.id,
            deviceId: testDeviceId
        });

        await prisma.session.create({
            data: {
                userId: user.id,
                token: hashData(refreshToken),
                expiresAt: new Date(refreshTokenExpiry * 1000)
            }
        });

        const result = await refreshSessionService({ user, deviceId: testDeviceId, oldToken: refreshToken });
        expect(result).toHaveProperty("accessToken");
        expect(result).toHaveProperty("refreshToken");
        expect(result).toHaveProperty("csrfToken");
        expect(result).toHaveProperty("user");

        const oldTokenCacheKey = getCacheKey.sessionToken(hashData(result.refreshToken!));
        console.log("1st request oldTokenCacheKey:", oldTokenCacheKey);
        const cached = await redis.get(oldTokenCacheKey) as SessionCachePayload;
        expect(cached).toBeDefined();

        const result2 = await refreshSessionService({ user, deviceId: testDeviceId, oldToken: result.refreshToken! });
        expect(result2).toHaveProperty("accessToken");
        expect(result2).toHaveProperty("refreshToken");
        expect(result2).toHaveProperty("csrfToken");
        expect(result2).toHaveProperty("user");

        const oldTokenCacheKey2 = getCacheKey.sessionToken(hashData(result2.refreshToken!));
        console.log("2nd request oldTokenCacheKey:", oldTokenCacheKey2);
        const cached2 = await redis.get(oldTokenCacheKey2) as SessionCachePayload;
        expect(cached2).toBeDefined();
    });

    it("Should handle concurrent refresh requests with same old token", async () => {
        const hashedPassword = await bcrypt.hash(testUser.password, 10);
        const user = await prisma.user.create({
            data: {
                username: testUser.username,
                email: testUser.email,
                hashedPassword,
                emailVerified: true,
                emailVerifiedAt: new Date()
            }
        });

        const { refreshToken: initialToken, refreshTokenExpiry } = await generateTokens({
            userId: user.id,
            deviceId: testDeviceId
        });

        await prisma.session.create({
            data: {
                userId: user.id,
                token: hashData(initialToken),
                expiresAt: new Date(refreshTokenExpiry * 1000)
            }
        });

        console.log("\n TEST: Simulating 5 concurrent refresh requests with same old token");
        console.log(`Initial Token: ${initialToken.substring(0, 20)}...`);

        const concurrentRequests = Array.from({ length: 5 }, (_, i) => {
            console.log(`Launching request ${i + 1}`);
            return refreshSessionService({
                user,
                deviceId: testDeviceId,
                oldToken: initialToken
            });
        });

        const results = await Promise.all(concurrentRequests);
        console.log("\n All 5 requests completed!");

        const uniqueRefreshTokens = new Set(results.map(r => r.refreshToken));
        console.log(`Unique refresh tokens: ${uniqueRefreshTokens.size} (should be 1)`);

        results.forEach((r, i) => {
            console.log(`Request ${i + 1}: ${r.refreshToken?.substring(0, 20)}...`);
        });

        expect(uniqueRefreshTokens.size).toBe(1);
        results.forEach(r => expect(results[0].refreshToken).toBe(r.refreshToken));

        const uniqueAccessTokens = new Set(results.map(r => r.accessToken));
        expect(uniqueAccessTokens.size).toBe(5);

        const uniqueCsrfTokens = new Set(results.map(r => r.csrfToken));
        expect(uniqueCsrfTokens.size).toBe(5);

        const oldTokenCacheKey = getCacheKey.sessionToken(hashData(initialToken));
        const newTokenCacheKey = getCacheKey.sessionToken(hashData(results[0].refreshToken!));

        const oldCache = await redis.get(oldTokenCacheKey) as SessionCachePayload;
        const newCache = await redis.get(newTokenCacheKey) as SessionCachePayload;

        console.log(`\n Old token cache exists: ${!!oldCache} (30 sec TTL)`);
        console.log(`New token cache exists: ${!!newCache} (20 min TTL)`);

        expect(oldCache).toBeDefined();
        expect(newCache).toBeDefined();
        expect(oldCache.refreshToken).toBe(results[0].refreshToken);
        expect(newCache.refreshToken).toBe(results[0].refreshToken);

        const sessions = await prisma.session.findMany({
            where: { userId: user.id }
        });

        console.log(`Total sessions in DB: ${sessions.length} (1-2 expected due to race condition)`)
        expect(sessions.length).toBeLessThanOrEqual(2);

        const cleanupQueue = await prisma.tokenCleanupQueue.findMany({
            where: { userId: user.id }
        });

        console.log(`Tokens in cleanup queue: ${cleanupQueue.length} (should be 1)`);
        expect(cleanupQueue.length).toBe(1);
        expect(cleanupQueue[0].hashedToken).toBe(hashData(initialToken));

        console.log("\n TEST PASSED: Concurrent requests handled correctly!\n");
    });
});
