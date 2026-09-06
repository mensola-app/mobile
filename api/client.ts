import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { Alert } from "react-native";
import i18n from "i18next";
import { usePreferences } from "@/hooks/usePreferences";

export interface RequestOptions extends RequestInit {
    auth?: boolean;
    params?: Record<string, string | number | boolean | undefined>;
    timeout?: number;
    silentNetworkError?: boolean;
}

interface RefreshQueueItem {
    resolve: (value: any) => void;
    reject: (error: any) => void;
    url: string;
    config: RequestInit;
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

export const isNetworkFailure = (error: any): boolean => {
    if (!error) return false;
    if (error.name === "AbortError" || error.name === "TimeoutError") return true;
    if (error instanceof TypeError) return true;
    const msg = String(error.message || "").toLowerCase();
    return (
        msg.includes("network") ||
        msg.includes("fetch") ||
        msg.includes("failed to fetch") ||
        msg.includes("connection") ||
        msg.includes("offline") ||
        msg.includes("timeout") ||
        msg.includes("aborted")
    );
};

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://api.mensola.app";

let isRefreshing = false;
let failedQueue: RefreshQueueItem[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((item) => {
        if (error) {
            item.reject(error);
        } else if (token) {
            const updatedConfig = {
                ...item.config,
                headers: {
                    ...item.config.headers,
                    Authorization: `Bearer ${token}`,
                },
            };
            fetch(`${BASE_URL}${item.url}`, updatedConfig)
                .then((res) => (res.headers.get("content-type")?.includes("application/json") ? res.json() : res))
                .then((data) => item.resolve(data))
                .catch((err) => item.reject(err));
        }
    });
    failedQueue = [];
};

async function httpClient<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    if (options.signal) {
        options.signal.addEventListener("abort", () => controller.abort());
    }
    config.signal = controller.signal;

    try {
        const response = await fetch(`${BASE_URL}${targetUrl}`, config);
        clearTimeout(timeoutId);
        const isJson = response.headers.get("content-type")?.includes("application/json");
        const responseData = isJson ? await response.json() : null;

        if (options.auth && (response.status === 401 || response.status === 403)) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject, url: targetUrl, config });
                });
            }

            isRefreshing = true;

            try {
                const storedRefreshToken = await SecureStore.getItemAsync("refreshToken");

                const refreshResponse = await fetch(`${BASE_URL}/v1/auth/refresh`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept-Language": activeLang,
                    },
                    body: JSON.stringify({
                        refreshToken: storedRefreshToken,
                    }),
                });

                const refreshData = await refreshResponse.json();

                if (refreshResponse.ok && refreshData.success) {
                    const newToken = refreshData.data.accessToken;
                    await SecureStore.setItemAsync("token", newToken);

                    isRefreshing = false;
                    processQueue(null, newToken);

                    (config.headers as Record<string, string>)["Authorization"] = `Bearer ${newToken}`;
                    const retryResponse = await fetch(`${BASE_URL}${targetUrl}`, config);
                    return isJson ? await retryResponse.json() : (null as unknown as T);
                } else {
                    processQueue(refreshData, null);
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
            }

            isRefreshing = false;
            await SecureStore.deleteItemAsync("token");
            await SecureStore.deleteItemAsync("refreshToken");
            await SecureStore.deleteItemAsync("user_data");

            router.replace("/login");

            throw (
                responseData || {
                    success: false,
                    error: { message: "Oturum süresi doldu." },
                }
            );
        }

        if (!response.ok || (responseData && responseData.success === false)) {
            throw (
                responseData || {
                    success: false,
                    error: { message: "Bir hata meydana geldi." },
                }
            );
        }

        return responseData;
    } catch (error) {
        clearTimeout(timeoutId);
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
    get: <T = any>(url: string, options?: Omit<RequestOptions, "method" | "body">) =>
        httpClient<T>(url, { ...options, method: "GET" }),
    post: <T = any>(url: string, body?: any, options?: Omit<RequestOptions, "method" | "body">) =>
        httpClient<T>(url, { ...options, method: "POST", body }),
    put: <T = any>(url: string, body?: any, options?: Omit<RequestOptions, "method" | "body">) =>
        httpClient<T>(url, { ...options, method: "PUT", body }),
    patch: <T = any>(url: string, body?: any, options?: Omit<RequestOptions, "method" | "body">) =>
        httpClient<T>(url, { ...options, method: "PATCH", body }),
    delete: <T = any>(url: string, options?: Omit<RequestOptions, "method" | "body">) =>
        httpClient<T>(url, { ...options, method: "DELETE" }),
};
