import { shouldRetryQuery, queryRetryDelay } from "./retry";
import { NetworkError } from "./client";

jest.mock("expo-secure-store", () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
    deleteItemAsync: jest.fn()
}));

jest.mock("expo-router", () => ({
    router: { replace: jest.fn() }
}));

describe("query retry policy", () => {
    it("does not retry any 4xx error (incl. 403, 404, 429)", () => {
        for (const status of [400, 401, 403, 404, 429]) {
            expect(shouldRetryQuery(0, { status })).toBe(false);
        }
    });

    it("retries 5xx errors up to 2 times", () => {
        expect(shouldRetryQuery(0, { status: 503 })).toBe(true);
        expect(shouldRetryQuery(1, { status: 500 })).toBe(true);
        expect(shouldRetryQuery(2, { status: 500 })).toBe(false);
    });

    it("retries network errors up to 2 times", () => {
        const err = new NetworkError("offline");
        expect(shouldRetryQuery(0, err)).toBe(true);
        expect(shouldRetryQuery(2, err)).toBe(false);
    });

    it("uses exponential backoff capped at 8s", () => {
        expect(queryRetryDelay(0)).toBe(1000);
        expect(queryRetryDelay(1)).toBe(2000);
        expect(queryRetryDelay(2)).toBe(4000);
        expect(queryRetryDelay(10)).toBe(8000);
    });

    it("honors Retry-After (capped at 30s)", () => {
        expect(queryRetryDelay(0, { retryAfterMs: 5000 })).toBe(5000);
        expect(queryRetryDelay(0, { retryAfterMs: 120000 })).toBe(30000);
    });
});
