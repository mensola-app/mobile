import { client } from "./client";
import * as SecureStore from "expo-secure-store";

jest.mock("expo-secure-store", () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
    deleteItemAsync: jest.fn()
}));

jest.mock("expo-router", () => ({
    router: {
        replace: jest.fn()
    }
}));

describe("HttpClient Infrastructure Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn();
    });

    it("should append the Authorization header and return data on a successful authorized GET request", async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
            "mock-access-token"
        );

        const mockApiResponse = {
            success: true,
            data: { fullname: "John Doe" }
        };

        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            status: 200,
            headers: {
                get: (headerName: string) =>
                    headerName === "content-type" ? "application/json" : null
            },
            json: async () => mockApiResponse
        });

        const result = await client.get("/user", { auth: true });

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining("/user"),
            expect.objectContaining({
                method: "GET",
                headers: expect.objectContaining({
                    Authorization: "Bearer mock-access-token"
                })
            })
        );

        expect(result).toEqual(mockApiResponse);
    });

    it("should automatically refresh the token upon a 401 error and retry the original request with the new token", async () => {
        (SecureStore.getItemAsync as jest.Mock).mockImplementation(key => {
            if (key === "token") return Promise.resolve("old-token");
            if (key === "refreshToken") return Promise.resolve("refresh-token");
            return Promise.resolve(null);
        });

        (global.fetch as jest.Mock)
            .mockResolvedValueOnce({
                ok: false,
                status: 401,
                headers: {
                    get: h => (h === "content-type" ? "application/json" : null)
                },
                json: async () => ({ success: false, message: "Unauthorized" })
            })

            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                headers: {
                    get: h => (h === "content-type" ? "application/json" : null)
                },
                json: async () => ({
                    success: true,
                    data: { accessToken: "new-token" }
                })
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                headers: {
                    get: h => (h === "content-type" ? "application/json" : null)
                },
                json: async () => ({ success: true, data: "profile" })
            });

        const result = await client.get("/profile", { auth: true });

        expect(SecureStore.setItemAsync).toHaveBeenCalledWith("token", "new-token");

        expect(global.fetch).toHaveBeenLastCalledWith(
            expect.stringContaining("/profile"),
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: "Bearer new-token"
                })
            })
        );

        expect(result).toEqual({ success: true, data: "profile" });
    });

    it("should NOT refresh the token or redirect to /login on a 403 error", async () => {
        const { router } = require("expo-router");

        (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("some-token");

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 403,
            headers: {
                get: (h: string) => (h === "content-type" ? "application/json" : null)
            },
            json: async () => ({ success: false, message: "Forbidden" })
        });

        await expect(client.get("/users/private", { auth: true })).rejects.toBeTruthy();

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
        expect(router.replace).not.toHaveBeenCalled();
    });

    it("should expose status and Retry-After on a 429 with a non-JSON body", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 429,
            headers: {
                get: (h: string) => (h === "retry-after" ? "7" : null)
            }
        });

        const error = await client.get("/search").catch(e => e);

        expect(error.status).toBe(429);
        expect(error.retryAfterMs).toBe(7000);
        expect(error.error.code).toBe("RATE_LIMITED");
        expect(typeof error.error.message).toBe("string");
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it("should keep the backend error body and attach status on a JSON 429", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 429,
            headers: {
                get: (h: string) => (h === "content-type" ? "application/json" : null)
            },
            json: async () => ({ success: false, message: "Slow down" })
        });

        const error = await client.get("/search").catch(e => e);

        expect(error.status).toBe(429);
        expect(error.message).toBe("Slow down");
        expect(error.retryAfterMs).toBeUndefined();
    });

    it("should clear tokens and redirect to /login if the refresh token request fails", async () => {
        const { router } = require("expo-router");

        (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("any-token");

        (global.fetch as jest.Mock)
            .mockResolvedValueOnce({
                ok: false,
                status: 401,
                headers: {
                    get: h => (h === "content-type" ? "application/json" : null)
                },
                json: async () => ({ success: false })
            })
            .mockResolvedValueOnce({
                ok: false,
                status: 400,
                headers: {
                    get: h => (h === "content-type" ? "application/json" : null)
                },
                json: async () => ({ success: false })
            });

        await expect(client.get("/profile", { auth: true })).rejects.toEqual(
            expect.objectContaining({ success: false })
        );

        expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("token");
        expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("refreshToken");

        expect(router.replace).toHaveBeenCalledWith("/login");
    });

    it("should queue subsequent requests while a refresh token request is in progress and resolve them after completion", async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("old-token");

        (global.fetch as jest.Mock)
            .mockResolvedValueOnce({
                ok: false,
                status: 401,
                headers: { get: h => "application/json" },
                json: async () => ({ success: false })
            })
            .mockResolvedValueOnce({
                ok: false,
                status: 401,
                headers: { get: h => "application/json" },
                json: async () => ({ success: false })
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                headers: { get: h => "application/json" },
                json: async () => ({
                    success: true,
                    data: { accessToken: "yeni-token" }
                })
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                headers: { get: h => "application/json" },
                json: async () => ({ success: true, data: "request-2-data" })
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                headers: { get: h => "application/json" },
                json: async () => ({ success: true, data: "request-1-data" })
            });

        const [res1, res2] = await Promise.all([
            client.get("/endpoint1", { auth: true }),
            client.get("/endpoint2", { auth: true })
        ]);

        const refreshCalls = (global.fetch as jest.Mock).mock.calls.filter(
            call => call[0].includes("/auth/refresh")
        );
        expect(refreshCalls.length).toBe(1);

        expect(res1).toEqual({ success: true, data: "request-1-data" });
        expect(res2).toEqual({ success: true, data: "request-2-data" });
    });

    it("should include Accept-Language header on outgoing requests", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            status: 200,
            headers: {
                get: (h: string) => (h === "content-type" ? "application/json" : null),
            },
            json: async () => ({ success: true, data: "ok" }),
        });

        await client.get("/test-i18n");

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining("/test-i18n"),
            expect.objectContaining({
                headers: expect.objectContaining({
                    "Accept-Language": expect.any(String),
                }),
            }),
        );
    });

    it("should catch network errors, show an alert, and reject with structured NetworkError", async () => {
        const { Alert } = require("react-native");
        const alertSpy = jest.spyOn(Alert, "alert");

        const { resetNetworkAlertThrottle } = require("./client");
        resetNetworkAlertThrottle();

        (global.fetch as jest.Mock).mockRejectedValueOnce(new TypeError("Network request failed"));

        await expect(client.get("/offline-test")).rejects.toMatchObject({
            success: false,
            isNetworkError: true,
            error: {
                code: "NETWORK_ERROR",
            },
        });

        expect(alertSpy).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(String),
        );
    });

    it("should throttle alerts when multiple network errors happen concurrently", async () => {
        const { Alert } = require("react-native");
        const alertSpy = jest.spyOn(Alert, "alert");

        const { resetNetworkAlertThrottle } = require("./client");
        resetNetworkAlertThrottle();

        (global.fetch as jest.Mock)
            .mockRejectedValueOnce(new TypeError("Network request failed"))
            .mockRejectedValueOnce(new TypeError("Network request failed"));

        await Promise.allSettled([
            client.get("/throttle-1"),
            client.get("/throttle-2"),
        ]);

        expect(alertSpy).toHaveBeenCalledTimes(1);
    });

    it("should respect silentNetworkError option and not trigger alert", async () => {
        const { Alert } = require("react-native");
        const alertSpy = jest.spyOn(Alert, "alert");
        alertSpy.mockClear();

        (global.fetch as jest.Mock).mockRejectedValueOnce(new TypeError("Network request failed"));

        await expect(client.get("/silent-test", { silentNetworkError: true })).rejects.toMatchObject({
            isNetworkError: true,
        });

        expect(alertSpy).not.toHaveBeenCalled();
    });

    it("should catch abort and timeout errors as network errors", async () => {
        const abortErr = new Error("The user aborted a request.");
        abortErr.name = "AbortError";

        (global.fetch as jest.Mock).mockRejectedValueOnce(abortErr);

        await expect(client.get("/timeout-test", { silentNetworkError: true })).rejects.toMatchObject({
            success: false,
            isNetworkError: true,
            error: {
                code: "NETWORK_ERROR",
            },
        });
    });
});

