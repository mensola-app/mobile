import { isNetworkFailure } from "./client";

const MAX_RETRIES = 2;
const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 8000;

const getStatus = (error: unknown): number | undefined => {
    const status = (error as { status?: unknown } | null)?.status;
    return typeof status === "number" ? status : undefined;
};

/**
 * React Query `retry` predicate.
 * - Network failures and 5xx are retried (max 2 times).
 * - Every 4xx (401/403/404/429...) is NOT retried; retrying them is pointless
 *   and for 429 it makes the rate limit worse.
 */
export const shouldRetryQuery = (failureCount: number, error: unknown): boolean => {
    if (failureCount >= MAX_RETRIES) return false;
    const status = getStatus(error);
    if (status !== undefined) return status >= 500;
    return isNetworkFailure(error);
};

/** Exponential backoff (1s, 2s, 4s... capped), honoring a server provided Retry-After. */
export const queryRetryDelay = (attemptIndex: number, error?: unknown): number => {
    const retryAfterMs = (error as { retryAfterMs?: unknown } | null)?.retryAfterMs;
    if (typeof retryAfterMs === "number" && retryAfterMs > 0) {
        return Math.min(retryAfterMs, 30000);
    }
    return Math.min(BASE_DELAY_MS * 2 ** attemptIndex, MAX_DELAY_MS);
};
