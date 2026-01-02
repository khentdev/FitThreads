import { describe, it, expect } from "vitest";
import { env } from "../env.js";

describe("Environment Configuration", () => {
    it("Should be running on test environment", () => {
        expect(process.env.NODE_ENV).toBe("test");
        expect(env.NODE_ENV).toBe("test");
    })

    it("Should use a test prefix for Redis", async () => {
        const { getRedisTestPrefix } = await import("../redis.js")
        expect(getRedisTestPrefix()).toBe("test:")
    })
})