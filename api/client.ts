import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { Alert } from "react-native";
import i18n from "i18next";
import { usePreferences } from "@/hooks/usePreferences";
import { API_BASE_URL as BASE_URL } from "@/constants/env";
import { onlineManager } from "@tanstack/react-query";

export interface RequestOptions extends Omit<RequestInit, "body"> {
    body?: unknown;
    auth?: boolean;
    params?: Record<string, string | number | boolean | undefined>;
    timeout?: number;
    silentNetworkError?: boolean;
}

export class NetworkError extends Error {
    success: false = false;
    isNetworkError: true = true;
    error: { code: string; message: string };

    constructor(message: string) {
        super(message);
        this.name = "NetworkError";
        this.error = {
            code: "NETWORK_ERROR",
            message,
        };
        Object.setPrototypeOf(this, NetworkError.prototype);
    }
}

export const getActiveLanguage = (): string => {
    try {
        if (i18n && i18n.language) {
            return i18n.language.split("-")[0];
        }
        const prefLang = usePreferences.getState().language;
        if (prefLang && prefLang !== "system") {
            return prefLang;
        }
    } catch {
        // fallback
    }
    return "tr";
};

let lastNetworkAlertTimestamp = 0;
const ALERT_THROTTLE_MS = 4000;

export const resetNetworkAlertThrottle = () => {
    lastNetworkAlertTimestamp = 0;
};

export const notifyNetworkError = (message?: string) => {
    // When offline, the persistent OfflineBanner informs the user, so suppress blocking modal alert spam.
    if (!onlineManager.isOnline()) {
        return;
    }

    const now = Date.now();
    if (now - lastNetworkAlertTimestamp > ALERT_THROTTLE_MS) {
        lastNetworkAlertTimestamp = now;
        const title =
            (typeof i18n.t === "function" && i18n.t("common.networkErrorTitle", { defaultValue: "Bağlantı Hatası" })) ||
            "Bağlantı Hatası";
        const body =
            message ||
            (typeof i18n.t === "function" &&
                i18n.t("common.networkErrorMessage", {
                    defaultValue: "Lütfen internet bağlantınızı kontrol edin.",
                })) ||
            "Lütfen internet bağlantınızı kontrol edin.";
        Alert.alert(title, body);
    }
};

export interface ApiError {
    success: false;
    error: {
        code?: string;
        message: string;
    };
    status?: number;
    retryAfterMs?: number;
}

export const isApiError = (error: unknown): error is ApiError => {
    return (
        typeof error === "object" &&
        error !== null &&
        "success" in error &&
        (error as { success: unknown }).success === false
    );
};

export const isNetworkFailure = (error: unknown): boolean => {
    if (!error || typeof error !== "object") return false;
    const err = error as { name?: string; message?: string };
    if (err.name === "AbortError" || err.name === "TimeoutError") return true;
    const msg = String(err.message || "").toLowerCase();
    const isNetworkMsg =
        msg.includes("network") ||
        msg.includes("fetch") ||
        msg.includes("failed to fetch") ||
        msg.includes("connection") ||
        msg.includes("offline") ||
        msg.includes("timeout") ||
        msg.includes("aborted") ||
        msg.includes("load failed");

    if (error instanceof TypeError) {
        return isNetworkMsg;
    }
    return isNetworkMsg;
};

const REFRESH_TIMEOUT_MS = 10000;

class SessionExpiredError extends Error {
    constructor() {
        super("Session expired");
        this.name = "SessionExpiredError";
        Object.setPrototypeOf(this, SessionExpiredError.prototype);
    }
}

/**
 * fetch with its own timeout and (optional) caller abort signal.
 * Timer and listener are always cleaned up, so nothing leaks on error paths.
 */
const fetchWithTimeout = async (
    input: string,
    init: RequestInit,
    timeoutMs: number,
    callerSignal?: AbortSignal,
): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const onCallerAbort = () => controller.abort();

    if (callerSignal) {
        if (callerSignal.aborted) {
            controller.abort();
        } else {
            callerSignal.addEventListener("abort", onCallerAbort, { once: true });
        }
    }

    try {
        return await fetch(input, { ...init, signal: controller.signal });
    } finally {
        clearTimeout(timeoutId);
        callerSignal?.removeEventListener("abort", onCallerAbort);
    }
};

const clearSession = async () => {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("refreshToken");
    await SecureStore.deleteItemAsync("user_data");
    router.replace("/login");
};

let refreshPromise: Promise<string> | null = null;

/**
 * Refreshes the access token. All concurrent callers share a single in-flight request.
 * - Resolves with the new access token.
 * - Rejects with SessionExpiredError (after wiping the session) only if the server rejects the refresh token (4xx).
 * - Rejects with the underlying error (network/timeout/5xx) WITHOUT logging the user out.
 */
const refreshAccessToken = (activeLang: string): Promise<string> => {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
        const storedRefreshToken = await SecureStore.getItemAsync("refreshToken");

        const refreshResponse = await fetchWithTimeout(
            `${BASE_URL}/v1/auth/refresh`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept-Language": activeLang,
                },
                body: JSON.stringify({ refreshToken: storedRefreshToken }),
            },
            REFRESH_TIMEOUT_MS,
        );

        let refreshData: { success?: boolean; data?: { accessToken?: string } } | null = null;
        try {
            refreshData = await refreshResponse.json();
        } catch {
            // non-JSON body; handled by status below
        }

        if (refreshResponse.ok && refreshData?.success && refreshData.data?.accessToken) {
            const newToken: string = refreshData.data.accessToken;
            await SecureStore.setItemAsync("token", newToken);
            return newToken;
        }

        if (refreshResponse.status >= 400 && refreshResponse.status < 500) {
            await clearSession();
            throw new SessionExpiredError();
        }

        throw {
            success: false,
            error: { message: "Token refresh failed" },
            status: refreshResponse.status,
        };
    })().finally(() => {
        refreshPromise = null;
    });

    return refreshPromise;
};


async function httpClient<T = unknown>(url: string, options: RequestOptions = {}): Promise<T> {
    const activeLang = getActiveLanguage();
    const config: RequestInit = {
        method: options.method || "GET",
        headers: {
            "Accept-Language": activeLang,
            ...(options.headers as Record<string, string>),
        },
    };

    if (options.body) {
        if (options.body instanceof FormData) {
            config.body = options.body;
        } else {
            (config.headers as Record<string, string>)["Content-Type"] = "application/json";
            config.body = JSON.stringify(options.body);
        }
    }

    if (options.auth) {
        const token = await SecureStore.getItemAsync("token");
        if (token) {
            (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
        }
    }

    let targetUrl = url;
    if (options.params) {
        const searchParams = new URLSearchParams();
        Object.entries(options.params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, String(value));
            }
        });
        const queryString = searchParams.toString();
        if (queryString) {
            targetUrl += (targetUrl.includes("?") ? "&" : "?") + queryString;
        }
    }

    const timeoutMs = options.timeout ?? 15000;
    const callerSignal = options.signal ?? undefined;

    const execute = async (requestConfig: RequestInit) => {
        const response = await fetchWithTimeout(`${BASE_URL}${targetUrl}`, requestConfig, timeoutMs, callerSignal);
        const isJson = response.headers.get("content-type")?.includes("application/json");
        const data = isJson ? await response.json() : null;
        return { response, data };
    };

    try {
        let { response, data: responseData } = await execute(config);

        if (options.auth && response.status === 401) {
            let newToken: string;
            try {
                newToken = await refreshAccessToken(activeLang);
            } catch (refreshError) {
                if (refreshError instanceof SessionExpiredError) {
                    throw (
                        responseData || {
                            success: false,
                            error: {
                                message:
                                    (typeof i18n.t === "function" &&
                                        i18n.t("auth.sessionExpired", {
                                            defaultValue: "Oturum süresi doldu.",
                                        })) ||
                                    "Oturum süresi doldu.",
                            },
                        }
                    );
                }
                throw refreshError;
            }

            // Retry exactly once with the fresh token, through the same path as a normal request
            // (fresh timeout/signal, same error normalization). A second 401 is surfaced as an error.
            ({ response, data: responseData } = await execute({
                ...config,
                headers: {
                    ...(config.headers as Record<string, string>),
                    Authorization: `Bearer ${newToken}`,
                },
            }));
        }


        if (!response.ok || (responseData && responseData.success === false)) {
            const isRateLimited = response.status === 429;
            const errorBody =
                responseData ||
                (isRateLimited
                    ? {
                          success: false,
                          error: {
                              code: "RATE_LIMITED",
                              message:
                                  (typeof i18n.t === "function" &&
                                      i18n.t("common.rateLimitedMessage", {
                                          defaultValue: "Çok fazla istek gönderildi. Lütfen biraz bekleyip tekrar deneyin.",
                                      })) ||
                                  "Çok fazla istek gönderildi. Lütfen biraz bekleyip tekrar deneyin.",
                          },
                      }
                    : {
                          success: false,
                          error: { message: "Bir hata meydana geldi." },
                      });

            const retryAfterSeconds = Number(response.headers.get("retry-after"));
            Object.defineProperty(errorBody, "status", { value: response.status, enumerable: false });
            if (isRateLimited && Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
                Object.defineProperty(errorBody, "retryAfterMs", {
                    value: retryAfterSeconds * 1000,
                    enumerable: false,
                });
            }
            throw errorBody;
        }


        return responseData;
    } catch (error) {
        if (isNetworkFailure(error)) {
            const localizedMessage =
                (typeof i18n.t === "function" &&
                    i18n.t("common.networkErrorMessage", {
                        defaultValue: "Lütfen internet bağlantınızı kontrol edin.",
                    })) ||
                "Lütfen internet bağlantınızı kontrol edin.";
            if (!options.silentNetworkError) {
                notifyNetworkError(localizedMessage);
            }
            throw new NetworkError(localizedMessage);
        }
        throw error;
    }
}

export const client = {
    get: <T = unknown>(url: string, options?: Omit<RequestOptions, "method" | "body">) =>
        httpClient<T>(url, { ...options, method: "GET" }),
    post: <T = unknown>(url: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
        httpClient<T>(url, { ...options, method: "POST", body }),
    put: <T = unknown>(url: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
        httpClient<T>(url, { ...options, method: "PUT", body }),
    patch: <T = unknown>(url: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
        httpClient<T>(url, { ...options, method: "PATCH", body }),
    delete: <T = unknown>(url: string, options?: Omit<RequestOptions, "method" | "body">) =>
        httpClient<T>(url, { ...options, method: "DELETE" }),
};
