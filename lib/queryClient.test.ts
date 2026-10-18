import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    queryClient,
    asyncStoragePersister,
    queryPersistOptions,
    clearPersistedQueryCache,
    QUERY_CACHE_KEY,
    CACHE_MAX_AGE_MS,
} from "./queryClient";

jest.mock("@react-native-async-storage/async-storage", () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
}));

describe("lib/queryClient", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("configures queryClient with 5 minute staleTime and 24 hour gcTime", () => {
        const defaultOptions = queryClient.getDefaultOptions();
        expect(defaultOptions.queries?.staleTime).toBe(1000 * 60 * 5);
        expect(defaultOptions.queries?.gcTime).toBe(CACHE_MAX_AGE_MS);
    });

    it("configures queryPersistOptions with correct maxAge, buster and persister", () => {
        expect(queryPersistOptions.maxAge).toBe(CACHE_MAX_AGE_MS);
        expect(queryPersistOptions.buster).toBe("v1.0.0");
        expect(queryPersistOptions.persister).toBe(asyncStoragePersister);
    });

    it("shouldDehydrateQuery only returns true for successful queries", () => {
        const shouldDehydrate = queryPersistOptions.dehydrateOptions?.shouldDehydrateQuery;
        expect(shouldDehydrate).toBeDefined();

        if (shouldDehydrate) {
            const successQuery = { state: { status: "success" } } as any;
            const errorQuery = { state: { status: "error" } } as any;
            const pendingQuery = { state: { status: "pending" } } as any;

            expect(shouldDehydrate(successQuery)).toBe(true);
            expect(shouldDehydrate(errorQuery)).toBe(false);
            expect(shouldDehydrate(pendingQuery)).toBe(false);
        }
    });

    it("clearPersistedQueryCache clears queryClient and removes storage client", async () => {
        const clearSpy = jest.spyOn(queryClient, "clear");
        const removeClientSpy = jest.spyOn(asyncStoragePersister, "removeClient").mockResolvedValue(undefined as any);

        await clearPersistedQueryCache();

        expect(clearSpy).toHaveBeenCalledTimes(1);
        expect(removeClientSpy).toHaveBeenCalledTimes(1);
    });

    it("clearPersistedQueryCache falls back to AsyncStorage.removeItem if persister throws", async () => {
        jest.spyOn(asyncStoragePersister, "removeClient").mockRejectedValue(new Error("Persister error"));

        await clearPersistedQueryCache();

        expect(AsyncStorage.removeItem).toHaveBeenCalledWith(QUERY_CACHE_KEY);
    });
});
