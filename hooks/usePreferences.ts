import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import { createMMKV } from "react-native-mmkv";
import { logger } from "@/utils/logger";

let storage: any = null;
let isMMKVAvailable = false;

try {
    storage = createMMKV();
    isMMKVAvailable = true;
} catch (e) {
    logger.warn(
        "MMKV native module is not available (e.g., app needs a native rebuild or running in Expo Go). Falling back to in-memory storage."
    );
}

const mockMap = new Map<string, string>();

const mmkvStorage: StateStorage = {
    setItem: (name: string, value: string) => {
        if (isMMKVAvailable && storage) {
            storage.set(name, value);
        } else {
            mockMap.set(name, value);
        }
    },
    getItem: (name: string) => {
        if (isMMKVAvailable && storage) {
            const value = storage.getString(name);
            return value ?? null;
        }
        return mockMap.get(name) ?? null;
    },
    removeItem: (name: string) => {
        if (isMMKVAvailable && storage) {
            storage.remove(name);
        } else {
            mockMap.delete(name);
        }
    },
};

export interface PreferencesState {
    theme: "dark" | "light" | "system";
    language: "en" | "tr" | "system";
    "default-tab": "movies" | "tracks";
    "shelf-layout": "grid" | "list";
    setPreference: (key: "theme" | "language" | "default-tab" | "shelf-layout", value: any) => void;
}

export const usePreferences = create<PreferencesState>()(
    persist(
        (set: any): PreferencesState => ({
            theme: "dark",
            language: "system",
            "default-tab": "movies",
            "shelf-layout": "grid",
            setPreference: (key, value) => {
                set(() => ({ [key]: value }));
            },
        }),
        {
            name: "user-preferences",
            storage: createJSONStorage(() => mmkvStorage),
        },
    ),
);
