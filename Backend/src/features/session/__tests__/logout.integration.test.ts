import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../../../createApp.js";
import { prisma } from "../../../../prisma/prismaConfig.js";
import { generateTokens } from "../tokens.js";
import { getRedisClient } from "../../../configs/redis.js";
import { getCacheKey } from "../utils/cache-keys.js";
import { hashData } from "../../../lib/hash.js";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

describe("Logout Integration Tests", () => {
    const app = createApp();
    const redis = getRedisClient();

    const testUser = {
        username: "logout_test_user",
        email: "logouttest@example.com",
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

    describe("POST /auth/session/logout", () => {
        it("Should successfully logout and delete session from DB and Redis cache", { timeout: 30000 }, async () => {
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

            const { refreshToken, refreshTokenExpiry, csrfToken } = await generateTokens({
                userId: user.id,
                deviceId: hashData(testDeviceId)
            });
            const hashedRefreshToken = hashData(refreshToken);

            await prisma.session.create({
                data: {
                    userId: user.id,
                    token: hashedRefreshToken,
                    expiresAt: new Date(refreshTokenExpiry * 1000)
                }
            });

            const cacheKey = getCacheKey.sessionToken(hashedRefreshToken);
            await redis.set(cacheKey, JSON.stringify({
                user,
                refreshToken
            }), { ex: 1200 });

            const sessionBeforeLogout = await prisma.session.findUnique({
                where: { userId_token: { userId: user.id, token: hashedRefreshToken } }
            });
            expect(sessionBeforeLogout).toBeDefined();

            const cacheBeforeLogout = await redis.get(cacheKey);
            expect(cacheBeforeLogout).toBeDefined();

            const response = await app.request("/auth/session/logout", {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "Cookie": `sid=${refreshToken}; csrfToken=${csrfToken}`,
                    "X-CSRF-Token": csrfToken,
                    "X-Fingerprint": testDeviceId
                }
            });
            expect(response.status).toBe(204);

            const sessionAfterLogout = await prisma.session.findUnique({
                where: { userId_token: { userId: user.id, token: hashedRefreshToken } }
            });
            expect(sessionAfterLogout).toBeNull();

            const cacheAfterLogout = await redis.get(cacheKey);
            expect(cacheAfterLogout).toBeNull();

            const setCookieHeader = response.headers.get("Set-Cookie");
            expect(setCookieHeader).toBeTruthy();
            expect(setCookieHeader).toContain("sid=");
            expect(setCookieHeader).toContain("csrfToken=");
        });

        it("Should reject logout without session cookie", async () => {
            const csrfToken = randomUUID();

            const response = await app.request("/auth/session/logout", {
                method: "POST",
                headers: {
                    "Cookie": `csrfToken=${csrfToken}`,
                    "X-CSRF-Token": csrfToken,
                    "X-Fingerprint": testDeviceId
                }
            });

            expect(response.status).toBe(401);
            const json = await response.json() as any;
            expect(json.error.code).toBe("SESSION_UNAUTHORIZED");
        });

        it("Should reject logout without CSRF token", async () => {
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

            const response = await app.request("/auth/session/logout", {
                method: "POST",
                headers: {
                    "Cookie": `sid=${refreshToken}`,
                    "X-Fingerprint": testDeviceId
                }
            });

            expect(response.status).toBe(401);
            const json = await response.json() as any;
            expect(json.error.code).toBe("SESSION_UNAUTHORIZED");
        });

        it("Should reject logout with mismatched CSRF tokens", async () => {
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

            const { refreshToken, refreshTokenExpiry, csrfToken } = await generateTokens({
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

            const response = await app.request("/auth/session/logout", {
                method: "POST",
                headers: {
                    "Cookie": `sid=${refreshToken}; csrfToken=${csrfToken}`,
                    "X-CSRF-Token": "different-csrf-token",
                    "X-Fingerprint": testDeviceId
                }
            });

            expect(response.status).toBe(401);
            const json = await response.json() as any;
            expect(json.error.code).toBe("SESSION_UNAUTHORIZED");
        });

        it("Should reject logout with invalid fingerprint", async () => {
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

            const { refreshToken, refreshTokenExpiry, csrfToken } = await generateTokens({
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

            const differentDeviceId = JSON.stringify({
                userAgent: "different_browser",
                platform: "different_platform",
            });

            const response = await app.request("/auth/session/logout", {
                method: "POST",
                headers: {
                    "Cookie": `sid=${refreshToken}; csrfToken=${csrfToken}`,
                    "X-CSRF-Token": csrfToken,
                    "X-Fingerprint": differentDeviceId
                }
            });

            expect(response.status).toBe(401);
            const json = await response.json() as any;
            expect(json.error.code).toBe("SESSION_UNAUTHORIZED");
        });

        it("Should reject logout with non-existent session token", async () => {
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

            const { refreshToken, csrfToken } = await generateTokens({
                userId: user.id,
                deviceId: testDeviceId
            });

            const response = await app.request("/auth/session/logout", {
                method: "POST",
                headers: {
                    "Cookie": `sid=${refreshToken}; csrfToken=${csrfToken}`,
                    "X-CSRF-Token": csrfToken,
                    "X-Fingerprint": testDeviceId
                }
            });

            expect(response.status).toBe(401);
            const json = await response.json() as any;
            expect(json.error.code).toBe("SESSION_UNAUTHORIZED");
        });

        it("Should handle logout when Redis cache is already empty", async () => {
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

            const { refreshToken, refreshTokenExpiry, csrfToken } = await generateTokens({
                userId: user.id,
                deviceId: hashData(testDeviceId)
            });
            const hashedRefreshToken = hashData(refreshToken);

            await prisma.session.create({
                data: {
                    userId: user.id,
                    token: hashedRefreshToken,
                    expiresAt: new Date(refreshTokenExpiry * 1000)
                }
            });

            const response = await app.request("/auth/session/logout", {
                method: "POST",
                headers: {
                    "Cookie": `sid=${refreshToken}; csrfToken=${csrfToken}`,
                    "X-CSRF-Token": csrfToken,
                    "X-Fingerprint": testDeviceId
                }
            });
            expect(response.status).toBe(204);

            const sessionAfterLogout = await prisma.session.findUnique({
                where: { userId_token: { userId: user.id, token: hashedRefreshToken } }
            });
            expect(sessionAfterLogout).toBeNull();
        });
    });
});