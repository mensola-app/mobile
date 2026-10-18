import React from "react";
import { renderHook, waitFor, act } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

import { AuthProvider, useGlobalUser } from "./AuthContext";
import { registerForPushNotificationsAsync } from "@/utils/notification.utils";
import { DeviceService } from "@/services/device.service";
import { AuthService } from "@/services/auth.service";
import { setMonitoringUser } from "@/utils/monitoring";
import { logger } from "@/utils/logger";
import { IUser } from "@/types/user.types";

jest.mock("expo-secure-store", () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
}));

jest.mock("expo-router", () => ({
    router: {
        replace: jest.fn(),
    },
}));

jest.mock("@/utils/notification.utils", () => ({
    registerForPushNotificationsAsync: jest.fn(),
}));

jest.mock("@/services/device.service", () => ({
    DeviceService: {
        registerDevice: jest.fn(),
        deleteDevice: jest.fn(),
    },
}));

jest.mock("@/services/auth.service", () => ({
    AuthService: {
        logout: jest.fn(),
    },
}));

jest.mock("@/utils/monitoring", () => ({
    setMonitoringUser: jest.fn(),
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

describe("AuthContext", () => {
    let queryClient: QueryClient;

    const mockUser: IUser = {
        id: "user-123",
        username: "johndoe",
        fullname: "John Doe",
        email: "john@example.com",
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });

        (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
        (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
        (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);

        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
        (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
        (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

        (registerForPushNotificationsAsync as jest.Mock).mockResolvedValue(null);
        (DeviceService.registerDevice as jest.Mock).mockResolvedValue({ id: "db-device-99" });
        (DeviceService.deleteDevice as jest.Mock).mockResolvedValue(undefined);
        (AuthService.logout as jest.Mock).mockResolvedValue(undefined);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    const createWrapper = () => {
        return ({ children }: { children: React.ReactNode }) => (
            <QueryClientProvider client={queryClient}>
                <AuthProvider>{children}</AuthProvider>
            </QueryClientProvider>
        );
    };

    it("throws error when useGlobalUser is used outside AuthProvider", () => {
        // Suppress expected React boundary error in test output
        const spy = jest.spyOn(console, "error").mockImplementation(() => {});
        expect(() => renderHook(() => useGlobalUser())).toThrow(
            "useGlobalUser must be used within an AuthProvider",
        );
        spy.mockRestore();
    });

    it("loads stored credentials on startup from AsyncStorage and binds monitoring user", async () => {
        (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
            if (key === "token") return Promise.resolve("initial-token-123");
            return Promise.resolve(null);
        });
        (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
            if (key === "user_data") return Promise.resolve(JSON.stringify(mockUser));
            return Promise.resolve(null);
        });

        const { result } = renderHook(() => useGlobalUser(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.token).toBe("initial-token-123");
        expect(result.current.user).toEqual(mockUser);
        expect(setMonitoringUser).toHaveBeenCalledWith("user-123");
        expect(logger.error).not.toHaveBeenCalled();
    });

    it("migrates legacy user_data from SecureStore to AsyncStorage on startup", async () => {
        (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
            if (key === "token") return Promise.resolve("legacy-token");
            if (key === "user_data") return Promise.resolve(JSON.stringify(mockUser));
            return Promise.resolve(null);
        });
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

        const { result } = renderHook(() => useGlobalUser(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.token).toBe("legacy-token");
        expect(result.current.user).toEqual(mockUser);
        expect(AsyncStorage.setItem).toHaveBeenCalledWith("user_data", JSON.stringify(mockUser));
        expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("user_data");
    });

    it("handles SecureStore read failure gracefully without crashing and logs to telemetry", async () => {
        const storeError = new Error("Keystore unavailable");
        (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(storeError);

        const { result } = renderHook(() => useGlobalUser(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.token).toBeNull();
        expect(result.current.user).toBeUndefined();
        expect(logger.error).toHaveBeenCalledWith(
            "Failed to read auth credentials from SecureStore",
            storeError,
        );
    });

    it("detects corrupted JSON in user_data, cleans storage, and reports error", async () => {
        (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
            if (key === "token") return Promise.resolve("valid-token");
            return Promise.resolve(null);
        });
        (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
            if (key === "user_data") return Promise.resolve("{ invalid json string");
            return Promise.resolve(null);
        });

        const { result } = renderHook(() => useGlobalUser(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.token).toBeNull();
        expect(result.current.user).toBeUndefined();
        expect(logger.error).toHaveBeenCalledWith(
            "Failed to parse stored user profile from storage, corrupted payload",
            expect.any(SyntaxError),
        );
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith("user_data");
    });

    it("registers push notifications and saves device id when token and user are present", async () => {
        (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
            if (key === "token") return Promise.resolve("auth-token");
            return Promise.resolve(null);
        });
        (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
            if (key === "user_data") return Promise.resolve(JSON.stringify(mockUser));
            return Promise.resolve(null);
        });
        (registerForPushNotificationsAsync as jest.Mock).mockResolvedValue("ExponentPushToken[abc1234]");
        (DeviceService.registerDevice as jest.Mock).mockResolvedValue({ id: "db-device-99" });

        const { result } = renderHook(() => useGlobalUser(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.pushToken).toBe("ExponentPushToken[abc1234]");
        });

        expect(SecureStore.setItemAsync).toHaveBeenCalledWith("push_token", "ExponentPushToken[abc1234]");
        expect(DeviceService.registerDevice).toHaveBeenCalledWith(
            expect.objectContaining({
                pushToken: "ExponentPushToken[abc1234]",
            }),
        );
        expect(AsyncStorage.setItem).toHaveBeenCalledWith("device_db_id", "db-device-99");
    });

    it("retries device registration on failure and logs telemetry when retries are exhausted", async () => {
        (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
            if (key === "token") return Promise.resolve("auth-token");
            return Promise.resolve(null);
        });
        (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
            if (key === "user_data") return Promise.resolve(JSON.stringify(mockUser));
            return Promise.resolve(null);
        });
        (registerForPushNotificationsAsync as jest.Mock).mockResolvedValue("ExponentPushToken[xyz]");
        const netErr = new Error("Network timeout");
        (DeviceService.registerDevice as jest.Mock).mockRejectedValue(netErr);

        renderHook(() => useGlobalUser(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(logger.warn).toHaveBeenCalledWith(
                "Device registration attempt 1/3 failed",
                netErr,
            );
        });

        // Fast-forward 1st retry delay (3s)
        await act(async () => {
            jest.advanceTimersByTime(3000);
        });

        await waitFor(() => {
            expect(logger.warn).toHaveBeenCalledWith(
                "Device registration attempt 2/3 failed",
                netErr,
            );
        });

        // Fast-forward 2nd retry delay (6s)
        await act(async () => {
            jest.advanceTimersByTime(6000);
        });

        await waitFor(() => {
            expect(logger.error).toHaveBeenCalledWith(
                "Device push registration failed after maximum retries",
                netErr,
                expect.objectContaining({ attempts: 3, hasToken: true }),
            );
        });
    });

    it("updates user with setUser and saves to AsyncStorage", async () => {
        const { result } = renderHook(() => useGlobalUser(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        const updatedUser: IUser = { ...mockUser, username: "new_username" };
        act(() => {
            result.current.setUser(updatedUser);
        });

        expect(result.current.user).toEqual(updatedUser);
        expect(AsyncStorage.setItem).toHaveBeenCalledWith("user_data", JSON.stringify(updatedUser));
        expect(setMonitoringUser).toHaveBeenCalledWith("user-123");

        // Pass undefined to clear user
        act(() => {
            result.current.setUser(undefined);
        });

        expect(result.current.user).toBeUndefined();
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith("user_data");
        expect(setMonitoringUser).toHaveBeenCalledWith(undefined);
    });

    it("logs user in, stores credentials, and updates state", async () => {
        const { result } = renderHook(() => useGlobalUser(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        await act(async () => {
            await result.current.login(
                { accessToken: "new-access-token", refreshToken: "new-refresh-token" },
                mockUser,
            );
        });

        expect(SecureStore.setItemAsync).toHaveBeenCalledWith("token", "new-access-token");
        expect(SecureStore.setItemAsync).toHaveBeenCalledWith("refreshToken", "new-refresh-token");
        expect(AsyncStorage.setItem).toHaveBeenCalledWith("user_data", JSON.stringify(mockUser));

        expect(result.current.token).toBe("new-access-token");
        expect(result.current.user).toEqual(mockUser);
        expect(setMonitoringUser).toHaveBeenCalledWith("user-123");
    });

    it("logs user in even if SecureStore fails, logging to telemetry", async () => {
        const { result } = renderHook(() => useGlobalUser(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        const storeError = new Error("Storage quota exceeded");
        (SecureStore.setItemAsync as jest.Mock).mockRejectedValueOnce(storeError);

        await act(async () => {
            await result.current.login({ accessToken: "new-access-token" }, mockUser);
        });

        expect(logger.error).toHaveBeenCalledWith(
            "Failed to persist auth credentials during login",
            storeError,
        );
        expect(result.current.token).toBe("new-access-token");
        expect(result.current.user).toEqual(mockUser);
    });

    it("performs full logout cleanup, unregisters device, clears queries, and navigates to login", async () => {
        (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) => {
            if (key === "token") return Promise.resolve("active-token");
            if (key === "refreshToken") return Promise.resolve("active-refresh-token");
            if (key === "push_token") return Promise.resolve("stored-push-token");
            return Promise.resolve(null);
        });
        (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
            if (key === "user_data") return Promise.resolve(JSON.stringify(mockUser));
            if (key === "device_db_id") return Promise.resolve("device-to-remove-123");
            return Promise.resolve(null);
        });

        const queryClearSpy = jest.spyOn(queryClient, "clear");

        const { result } = renderHook(() => useGlobalUser(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.token).toBe("active-token");
        });

        await act(async () => {
            await result.current.logout();
        });

        expect(queryClearSpy).toHaveBeenCalled();
        expect(setMonitoringUser).toHaveBeenCalledWith(undefined);
        expect(DeviceService.deleteDevice).toHaveBeenCalledWith("device-to-remove-123");
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith("device_db_id");
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith("user_data");
        expect(AuthService.logout).toHaveBeenCalledWith({
            refreshToken: "active-refresh-token",
            pushToken: "stored-push-token",
        });

        expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("token");
        expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("refreshToken");
        expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("push_token");

        expect(result.current.token).toBeNull();
        expect(result.current.user).toBeUndefined();
        expect(result.current.pushToken).toBeNull();
        expect(router.replace).toHaveBeenCalledWith("/login");
    });
});
