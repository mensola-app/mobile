import { renderHook, act, waitFor } from "@testing-library/react-native";
import { AppState, AppStateStatus } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { useImportJob } from "./useImportJob";
import { ImportService } from "@/services/import.service";

jest.mock("expo-keep-awake", () => ({
    activateKeepAwakeAsync: jest.fn().mockResolvedValue(undefined),
    deactivateKeepAwake: jest.fn().mockResolvedValue(undefined),
}));

const mockInvalidateQueries = jest.fn();
jest.mock("@tanstack/react-query", () => ({
    useQueryClient: () => ({
        invalidateQueries: mockInvalidateQueries,
    }),
}));

jest.mock("@/services/import.service", () => ({
    ImportService: {
        getImportProgress: jest.fn(),
    },
}));

jest.mock("@/utils/logger", () => ({
    logger: {
        log: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
    },
}));

describe("useImportJob", () => {
    const STORAGE_KEY = "test_active_job_id";
    const KEEP_AWAKE_TAG = "test-import";

    beforeEach(async () => {
        jest.clearAllMocks();
        await AsyncStorage.clear();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("initializes with default step when no job is stored", async () => {
        const { result } = renderHook(() =>
            useImportJob({
                storageKey: STORAGE_KEY,
                keepAwakeTag: KEEP_AWAKE_TAG,
                isVisible: true,
                defaultStep: "guide",
                genericErrorMessage: "An error occurred",
            }),
        );

        await waitFor(() => {
            expect(result.current.step).toBe("guide");
            expect(result.current.jobId).toBeNull();
            expect(result.current.progressData).toBeNull();
        });
    });

    it("resumes saved active job from AsyncStorage on mount", async () => {
        await AsyncStorage.setItem(STORAGE_KEY, "saved-job-123");
        (ImportService.getImportProgress as jest.Mock).mockResolvedValue({
            jobId: "saved-job-123",
            userId: "user-1",
            status: "processing",
            totalItems: 50,
            processedItems: 25,
            successCount: 25,
            failedCount: 0,
            createdAt: "2026-10-14T00:00:00Z",
            updatedAt: "2026-10-14T00:01:00Z",
        });

        const { result } = renderHook(() =>
            useImportJob({
                storageKey: STORAGE_KEY,
                keepAwakeTag: KEEP_AWAKE_TAG,
                isVisible: true,
                defaultStep: "guide",
                genericErrorMessage: "An error occurred",
            }),
        );

        await waitFor(() => {
            expect(result.current.jobId).toBe("saved-job-123");
            expect(result.current.step).toBe("progress");
            expect(result.current.percent).toBe(50);
        });
    });

    it("starts a new job, activates keep-awake, and sets queued progress data", async () => {
        (ImportService.getImportProgress as jest.Mock).mockResolvedValue({
            jobId: "job-new-1",
            userId: "user-1",
            status: "processing",
            totalItems: 100,
            processedItems: 10,
            successCount: 10,
            failedCount: 0,
            createdAt: "2026-10-14T00:00:00Z",
            updatedAt: "2026-10-14T00:01:00Z",
        });

        const { result } = renderHook(() =>
            useImportJob({
                storageKey: STORAGE_KEY,
                keepAwakeTag: KEEP_AWAKE_TAG,
                isVisible: true,
                defaultStep: "guide",
                genericErrorMessage: "An error occurred",
            }),
        );

        await act(async () => {
            await result.current.startJob("job-new-1", 100, "letterboxd");
        });

        expect(result.current.jobId).toBe("job-new-1");
        expect(result.current.step).toBe("progress");
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        expect(stored).toBe("job-new-1");
        expect(activateKeepAwakeAsync).toHaveBeenCalledWith(KEEP_AWAKE_TAG);
    });

    it("transitions to completed, invalidates query keys, and removes job on completion", async () => {
        const mockOnSuccess = jest.fn();
        (ImportService.getImportProgress as jest.Mock).mockResolvedValueOnce({
            jobId: "job-done",
            userId: "user-1",
            status: "completed",
            totalItems: 20,
            processedItems: 20,
            successCount: 20,
            failedCount: 0,
            createdAt: "2026-10-14T00:00:00Z",
            updatedAt: "2026-10-14T00:01:00Z",
        });

        const { result } = renderHook(() =>
            useImportJob({
                storageKey: STORAGE_KEY,
                keepAwakeTag: KEEP_AWAKE_TAG,
                isVisible: true,
                defaultStep: "guide",
                onSuccessQueryKeys: [["profile"], ["movies"]],
                onSuccess: mockOnSuccess,
                genericErrorMessage: "An error occurred",
            }),
        );

        await act(async () => {
            await result.current.startJob("job-done", 20);
        });

        await waitFor(() => {
            expect(result.current.step).toBe("completed");
            expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ["profile"] });
            expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ["movies"] });
            expect(mockOnSuccess).toHaveBeenCalled();
        });

        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        expect(stored).toBeNull();
    });

    it("stops polling and displays error after max consecutive errors (3)", async () => {
        (ImportService.getImportProgress as jest.Mock).mockRejectedValue(new Error("Network glitch"));

        const { result } = renderHook(() =>
            useImportJob({
                storageKey: STORAGE_KEY,
                keepAwakeTag: KEEP_AWAKE_TAG,
                isVisible: true,
                defaultStep: "guide",
                genericErrorMessage: "Failed to import",
                pollingIntervalMs: 1000,
                maxConsecutiveErrors: 3,
            }),
        );

        await act(async () => {
            await result.current.startJob("glitch-job", 10);
        });

        // 1st error occurred immediately
        expect(ImportService.getImportProgress).toHaveBeenCalledTimes(1);

        // Advance 2000ms for backoff (1000 * 2) -> 2nd error
        await act(async () => {
            jest.advanceTimersByTime(2000);
        });
        expect(ImportService.getImportProgress).toHaveBeenCalledTimes(2);

        // Advance 3000ms for backoff (1000 * 3) -> 3rd error
        await act(async () => {
            jest.advanceTimersByTime(3000);
        });
        expect(ImportService.getImportProgress).toHaveBeenCalledTimes(3);

        // Should now stop polling and surface error
        expect(result.current.error).toBe("Failed to import");

        // Advance more time to verify it doesn't poll anymore
        await act(async () => {
            jest.advanceTimersByTime(10000);
        });
        expect(ImportService.getImportProgress).toHaveBeenCalledTimes(3);
    });

    it("stops polling and removes job when server returns 404", async () => {
        const error404 = { status: 404, message: "Not found" };
        (ImportService.getImportProgress as jest.Mock).mockRejectedValueOnce(error404);

        const { result } = renderHook(() =>
            useImportJob({
                storageKey: STORAGE_KEY,
                keepAwakeTag: KEEP_AWAKE_TAG,
                isVisible: true,
                defaultStep: "guide",
                genericErrorMessage: "Job not found",
            }),
        );

        await act(async () => {
            await result.current.startJob("deleted-job", 10);
        });

        await waitFor(() => {
            expect(result.current.step).toBe("guide");
            expect(result.current.error).toBe("Job not found");
        });

        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        expect(stored).toBeNull();
    });

    it("pauses polling timer when app moves to background and resumes when active", async () => {
        let appStateListener: ((state: AppStateStatus) => void) | undefined;
        jest.spyOn(AppState, "addEventListener").mockImplementation((_, listener) => {
            appStateListener = listener;
            return { remove: jest.fn() } as any;
        });

        (ImportService.getImportProgress as jest.Mock).mockResolvedValue({
            jobId: "bg-job",
            userId: "u1",
            status: "processing",
            totalItems: 50,
            processedItems: 10,
            successCount: 10,
            failedCount: 0,
            createdAt: "2026-10-14T00:00:00Z",
            updatedAt: "2026-10-14T00:01:00Z",
        });

        const { result } = renderHook(() =>
            useImportJob({
                storageKey: STORAGE_KEY,
                keepAwakeTag: KEEP_AWAKE_TAG,
                isVisible: true,
                defaultStep: "guide",
                genericErrorMessage: "Error",
                pollingIntervalMs: 2000,
            }),
        );

        await act(async () => {
            await result.current.startJob("bg-job", 50);
        });
        expect(ImportService.getImportProgress).toHaveBeenCalledTimes(1);

        // Transition to background
        act(() => {
            appStateListener?.("background");
        });

        // Advance timers by 5000ms while in background
        await act(async () => {
            jest.advanceTimersByTime(5000);
        });

        // Call count should NOT have increased while in background
        expect(ImportService.getImportProgress).toHaveBeenCalledTimes(1);

        // Transition back to active
        await act(async () => {
            appStateListener?.("active");
        });

        // Immediately resumes polling
        expect(ImportService.getImportProgress).toHaveBeenCalledTimes(2);
    });

    it("stops job and cleans up on cancelOrResetJob", async () => {
        const { result } = renderHook(() =>
            useImportJob({
                storageKey: STORAGE_KEY,
                keepAwakeTag: KEEP_AWAKE_TAG,
                isVisible: true,
                defaultStep: "guide",
                genericErrorMessage: "Error",
            }),
        );

        await act(async () => {
            await result.current.startJob("cancel-job", 30);
        });

        expect(result.current.jobId).toBe("cancel-job");

        await act(async () => {
            await result.current.cancelOrResetJob();
        });

        expect(result.current.jobId).toBeNull();
        expect(result.current.step).toBe("guide");
        expect(result.current.progressData).toBeNull();
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        expect(stored).toBeNull();
    });
});
