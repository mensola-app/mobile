import { useEffect, useState } from "react";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { onlineManager } from "@tanstack/react-query";
import { Platform } from "react-native";
import { logger } from "./logger";

/**
 * Connects React Native NetInfo to TanStack Query's onlineManager.
 *
 * - When offline: React Query pauses background queries and retry loops so the network is not spammed.
 * - When online: React Query automatically resumes and refreshes stale queries.
 */
export function setupNetworkListener(): () => void {
    if (Platform.OS === "web") {
        return () => {};
    }

    onlineManager.setEventListener((setOnline) => {
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            const isConnected = Boolean(state.isConnected);
            // On native platforms, isInternetReachable may initially be null; treat null as reachable
            const isReachable = state.isInternetReachable ?? true;
            const isOnline = isConnected && isReachable;

            setOnline(isOnline);
            logger.debug("Network connectivity changed", {
                isConnected,
                isInternetReachable: state.isInternetReachable,
                type: state.type,
            });
        });

        return () => {
            unsubscribe();
        };
    });

    return () => {
        // Return no-op cleanup
    };
}

export interface NetworkStatus {
    isOnline: boolean;
    hasBeenOffline: boolean;
}

/**
 * Hook to observe network connectivity for UI components (e.g. OfflineBanner).
 */
export function useNetworkStatus(): NetworkStatus {
    const [isOnline, setIsOnline] = useState<boolean>(true);
    const [hasBeenOffline, setHasBeenOffline] = useState<boolean>(false);

    useEffect(() => {
        const handleState = (state: NetInfoState) => {
            const connected = Boolean(state.isConnected);
            const reachable = state.isInternetReachable ?? true;
            const online = connected && reachable;

            setIsOnline(online);
            if (!online) {
                setHasBeenOffline(true);
            }
        };

        const unsubscribe = NetInfo.addEventListener(handleState);

        NetInfo.fetch()
            .then(handleState)
            .catch((err) => {
                logger.warn("Failed to fetch initial network state", err);
            });

        return () => {
            unsubscribe();
        };
    }, []);

    return { isOnline, hasBeenOffline };
}
