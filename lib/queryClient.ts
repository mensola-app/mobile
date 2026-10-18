import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import type { PersistQueryClientOptions } from "@tanstack/react-query-persist-client";
import { shouldRetryQuery, queryRetryDelay } from "@/lib/http/retry";

export const QUERY_CACHE_KEY = "MENSOLA_QUERY_OFFLINE_CACHE";
export const CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 24; // 24 hours

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes fresh
            gcTime: CACHE_MAX_AGE_MS, // 24 hours (must be >= maxAge for proper persistence)
            retry: shouldRetryQuery,
            retryDelay: queryRetryDelay,
        },
    },
});

export const asyncStoragePersister = createAsyncStoragePersister({
    storage: AsyncStorage,
    key: QUERY_CACHE_KEY,
    throttleTime: 1000,
});

type DehydrateQueryParam = Parameters<
    NonNullable<NonNullable<PersistQueryClientOptions["dehydrateOptions"]>["shouldDehydrateQuery"]>
>[0];

export const queryPersistOptions: Omit<PersistQueryClientOptions, "queryClient"> = {
    persister: asyncStoragePersister,
    maxAge: CACHE_MAX_AGE_MS,
    buster: "v1.0.0",
    dehydrateOptions: {
        shouldDehydrateQuery: (query: DehydrateQueryParam) => {
            // Only persist successfully loaded queries, skip pending or errored
            return query.state.status === "success";
        },
    },
};

/**
 * Purges both in-memory and AsyncStorage persisted React Query cache.
 * Useful on logout or user switch.
 */
export const clearPersistedQueryCache = async (): Promise<void> => {
    queryClient.clear();
    try {
        await asyncStoragePersister.removeClient();
    } catch {
        try {
            await AsyncStorage.removeItem(QUERY_CACHE_KEY);
        } catch {
            // no-op
        }
    }
};
