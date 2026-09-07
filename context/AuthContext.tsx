import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { IUser } from "@/types/user.types";

interface AuthContextType {
    user?: IUser;
    token: string | null;
    isLoading: boolean;
    setUser: (u: IUser | undefined) => void;
    login: (tokens: { accessToken: string; refreshToken?: string }, userData: IUser) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUserState] = useState<IUser>();
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadStoredAuth() {
            try {
                const storedToken = await SecureStore.getItemAsync("token");
                const storedUser = await SecureStore.getItemAsync("user_data");

                if (storedToken && storedUser) {
                    setToken(storedToken);
                    setUserState(JSON.parse(storedUser));
                }
            } catch (e) {
                console.error("Failed to load auth state", e);
            } finally {
                setIsLoading(false);
            }
        }
        loadStoredAuth();
    }, []);

    const setUser = (u: IUser | undefined) => {
        setUserState(u);
        if (u) {
            SecureStore.setItemAsync("user_data", JSON.stringify(u)).catch((e) =>
                console.error("Failed to sync user data to SecureStore", e)
            );
        } else {
            SecureStore.deleteItemAsync("user_data").catch((e) =>
                console.error("Failed to delete user data from SecureStore", e)
            );
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
        } catch (e) {
            console.error("Failed to save auth state", e);
        }
    };

    const logout = async () => {
        try {
            await SecureStore.deleteItemAsync("token");
            await SecureStore.deleteItemAsync("refreshToken");
            await SecureStore.deleteItemAsync("user_data");
            setToken(null);
            setUserState(undefined);
            router.replace("/login");
        } catch (e) {
            console.error("Failed to clear auth state", e);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, setUser, login, logout }}>
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
