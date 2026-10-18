import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import i18n from "i18next";
import { router } from "expo-router";
import { Platform } from "react-native";
import { IUser } from "@/types/user.types";
import { registerForPushNotificationsAsync } from "@/utils/notification.utils";
import { DeviceService } from "@/services/device.service";
import { AuthService } from "@/services/auth.service";
import { useQueryClient } from "@tanstack/react-query";
import { setMonitoringUser } from "@/utils/monitoring";
import { logger } from "@/utils/logger";

interface AuthContextType {
    user?: IUser;
    token: string | null;
    pushToken: string | null;
    isLoading: boolean;
    setUser: (u: IUser | undefined) => void;
    login: (tokens: { accessToken: string; refreshToken?: string }, userData: IUser) => Promise<void>;
    logout: (pushToken?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const queryClient = useQueryClient();
    const [user, setUserState] = useState<IUser>();
    const [token, setToken] = useState<string | null>(null);
    const [pushToken, setPushToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadStoredAuth() {
            try {
                const storedToken = await SecureStore.getItemAsync("token");
                let storedUser = await AsyncStorage.getItem("user_data").catch((err) => {
                    logger.warn("Failed to read user_data from AsyncStorage", err);
                    return null;
                });

                // Migration fallback: If not in AsyncStorage, check legacy SecureStore location
                if (!storedUser) {
                    const legacyUser = await SecureStore.getItemAsync("user_data").catch(() => null);
                    if (legacyUser) {
                        storedUser = legacyUser;
                        // Migrate to AsyncStorage and delete from SecureStore to stay under 2KB limit
                        await AsyncStorage.setItem("user_data", legacyUser).catch(() => {});
                        await SecureStore.deleteItemAsync("user_data").catch(() => {});
                    }
                }

                if (storedToken && storedUser) {
                    try {
                        const parsedUser = JSON.parse(storedUser);
                        setToken(storedToken);
                        setUserState(parsedUser);
                        setMonitoringUser(parsedUser.id);
                    } catch (parseError) {
                        logger.error(
                            "Failed to parse stored user profile from storage, corrupted payload",
                            parseError,
                        );
                        await AsyncStorage.removeItem("user_data").catch((delErr) => {
                            logger.warn("Failed to delete corrupted user_data from AsyncStorage", delErr);
                        });
                        await SecureStore.deleteItemAsync("user_data").catch(() => {});
                    }
                }
            } catch (storageError) {
                logger.error("Failed to read auth credentials from SecureStore", storageError);
            } finally {
                setIsLoading(false);
            }
        }
        loadStoredAuth();
    }, []);

    useEffect(() => {
        let isMounted = true;
        let retryTimeoutId: ReturnType<typeof setTimeout> | null = null;
        let attempt = 0;
        const maxAttempts = 3;

        async function syncPushToken() {
            if (!token || !user) return;

            try {
                const tokenData = await registerForPushNotificationsAsync();
                if (!tokenData || !isMounted) return;

                setPushToken(tokenData);
                await SecureStore.setItemAsync("push_token", tokenData).catch((err) => {
                    logger.warn("Failed to persist push_token in SecureStore", err);
                });

                const deviceLanguage = getLocales()[0]?.languageCode ?? "tr";
                const locale = i18n.language || deviceLanguage;

                const attemptRegisterDevice = async (): Promise<boolean> => {
                    try {
                        const deviceRes = await DeviceService.registerDevice({
                            pushToken: tokenData,
                            locale,
                            platform: Platform.OS,
                        });
                        if (deviceRes?.id) {
                            await AsyncStorage.setItem("device_db_id", deviceRes.id).catch((err) => {
                                logger.warn("Failed to persist device_db_id in AsyncStorage", err);
                            });
                        }
                        return true;
                    } catch (deviceErr) {
                        attempt += 1;
                        logger.warn(
                            `Device registration attempt ${attempt}/${maxAttempts} failed`,
                            deviceErr,
                        );

                        if (attempt < maxAttempts && isMounted) {
                            const delayMs = attempt * 3000;
                            retryTimeoutId = setTimeout(() => {
                                if (isMounted) {
                                    attemptRegisterDevice();
                                }
                            }, delayMs);
                        } else if (attempt >= maxAttempts) {
                            logger.error(
                                "Device push registration failed after maximum retries",
                                deviceErr,
                                {
                                    platform: Platform.OS,
                                    hasToken: Boolean(tokenData),
                                    attempts: attempt,
                                },
                            );
                        }
                        return false;
                    }
                };

                await attemptRegisterDevice();
            } catch (err) {
                logger.error("Failed to complete push notification registration flow", err);
            }
        }

        if (token && user) {
            syncPushToken();
        }

        return () => {
            isMounted = false;
            if (retryTimeoutId) {
                clearTimeout(retryTimeoutId);
            }
        };
    }, [token, user]);

    const setUser = (u: IUser | undefined) => {
        setUserState(u);
        setMonitoringUser(u?.id);
        if (u) {
            AsyncStorage.setItem("user_data", JSON.stringify(u)).catch((err) => {
                logger.warn("Failed to persist user_data in AsyncStorage", err);
            });
        } else {
            AsyncStorage.removeItem("user_data").catch((err) => {
                logger.warn("Failed to delete user_data from AsyncStorage", err);
            });
            SecureStore.deleteItemAsync("user_data").catch(() => {});
        }
    };

    const login = async (tokens: { accessToken: string; refreshToken?: string }, userData: IUser) => {
        try {
            await SecureStore.setItemAsync("token", tokens.accessToken);
            if (tokens.refreshToken) {
                await SecureStore.setItemAsync("refreshToken", tokens.refreshToken);
            }
            await AsyncStorage.setItem("user_data", JSON.stringify(userData));
            await SecureStore.deleteItemAsync("user_data").catch(() => {});
        } catch (err) {
            logger.error("Failed to persist auth credentials during login", err);
        }
        setToken(tokens.accessToken);
        setUserState(userData);
        setMonitoringUser(userData.id);
    };

    const logout = async (pushTokenOverride?: string) => {
        try {
            // Clear React Query cache immediately so no stale user data persists
            queryClient.clear();
            setMonitoringUser(undefined);

            const storedPushToken = await SecureStore.getItemAsync("push_token").catch((err) => {
                logger.warn("Failed to read push_token from SecureStore during logout", err);
                return null;
            });
            const activePushToken = pushTokenOverride || pushToken || storedPushToken || undefined;
            const refreshToken = await SecureStore.getItemAsync("refreshToken").catch((err) => {
                logger.warn("Failed to read refreshToken from SecureStore during logout", err);
                return null;
            });

            // Delete device from backend if registered
            try {
                const deviceDbId = await AsyncStorage.getItem("device_db_id");
                if (deviceDbId) {
                    await DeviceService.deleteDevice(deviceDbId);
                    await AsyncStorage.removeItem("device_db_id");
                }
            } catch (err) {
                logger.warn("Failed to unregister device from backend on logout", err);
            }

            try {
                await AuthService.logout({
                    refreshToken: refreshToken || undefined,
                    pushToken: activePushToken,
                });
            } catch (err) {
                logger.warn("AuthService.logout request failed or server unreachable", err);
            }

            await SecureStore.deleteItemAsync("token").catch((err) => {
                logger.warn("Failed to delete token on logout", err);
            });
            await SecureStore.deleteItemAsync("refreshToken").catch((err) => {
                logger.warn("Failed to delete refreshToken on logout", err);
            });
            await AsyncStorage.removeItem("user_data").catch((err) => {
                logger.warn("Failed to delete user_data from AsyncStorage on logout", err);
            });
            await SecureStore.deleteItemAsync("user_data").catch(() => {});
            await SecureStore.deleteItemAsync("push_token").catch((err) => {
                logger.warn("Failed to delete push_token on logout", err);
            });
            await AsyncStorage.removeItem("device_db_id").catch((err) => {
                logger.warn("Failed to delete device_db_id on logout", err);
            });

            setToken(null);
            setUserState(undefined);
            setPushToken(null);
            router.replace("/login");
        } catch (err) {
            logger.error("Unexpected error during logout flow", err);
            setToken(null);
            setUserState(undefined);
            setPushToken(null);
            router.replace("/login");
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, pushToken, isLoading, setUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useGlobalUser = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useGlobalUser must be used within an AuthProvider");
    }
    return context;
};
