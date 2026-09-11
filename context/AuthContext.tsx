import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { Platform } from "react-native";
import { IUser } from "@/types/user.types";
import { registerForPushNotificationsAsync } from "@/utils/notification.utils";
import { UserService } from "@/services/user.service";
import { AuthService } from "@/services/auth.service";

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
    const [user, setUserState] = useState<IUser>();
    const [token, setToken] = useState<string | null>(null);
    const [pushToken, setPushToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadStoredAuth() {
            try {
                const storedToken = await SecureStore.getItemAsync("token");
                const storedUser = await SecureStore.getItemAsync("user_data");
                const storedPushToken = await SecureStore.getItemAsync("push_token");

                if (storedPushToken) {
                    setPushToken(storedPushToken);
                }

                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUserState(JSON.parse(storedUser));
                }
            } catch {
                // Ignore storage read error
            } finally {
                setIsLoading(false);
            }
        }
        loadStoredAuth();
    }, []);

    useEffect(() => {
        let isMounted = true;
        if (token && user) {
            registerForPushNotificationsAsync().then(async (tokenData) => {
                if (tokenData && isMounted) {
                    setPushToken(tokenData);
                    await SecureStore.setItemAsync("push_token", tokenData).catch(() => {});
                    try {
                        await UserService.savePushToken({
                            pushToken: tokenData,
                            platform: Platform.OS,
                        });
                    } catch {
                        // Silently handle backend sync error
                    }
                }
            });
        }
        return () => {
            isMounted = false;
        };
    }, [token, user]);

    const setUser = (u: IUser | undefined) => {
        setUserState(u);
        if (u) {
            SecureStore.setItemAsync("user_data", JSON.stringify(u)).catch(() => {});
        } else {
            SecureStore.deleteItemAsync("user_data").catch(() => {});
        }
    };

    const login = async (tokens: { accessToken: string; refreshToken?: string }, userData: IUser) => {
        try {
            await SecureStore.setItemAsync("token", tokens.accessToken);
            if (tokens.refreshToken) {
                await SecureStore.setItemAsync("refreshToken", tokens.refreshToken);
            }
            await SecureStore.setItemAsync("user_data", JSON.stringify(userData));
            setToken(tokens.accessToken);
            setUserState(userData);
        } catch {
            // Silently handle save error
        }
    };

    const logout = async (pushTokenOverride?: string) => {
        try {
            const storedPushToken = await SecureStore.getItemAsync("push_token");
            const activePushToken = pushTokenOverride || pushToken || storedPushToken || undefined;
            const refreshToken = await SecureStore.getItemAsync("refreshToken");

            try {
                await AuthService.logout({
                    refreshToken: refreshToken || undefined,
                    pushToken: activePushToken,
                });
            } catch {
                // Ignore network or authentication errors on logout
            }

            await SecureStore.deleteItemAsync("token");
            await SecureStore.deleteItemAsync("refreshToken");
            await SecureStore.deleteItemAsync("user_data");
            await SecureStore.deleteItemAsync("push_token");

            setToken(null);
            setUserState(undefined);
            setPushToken(null);
            router.replace("/login");
        } catch {
            // Silently handle cleanup error
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
