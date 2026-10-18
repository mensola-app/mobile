import { useEffect } from "react";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../context/AuthContext";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient, queryPersistOptions } from "../lib/queryClient";
import { Colors } from "../constants/colors";
import { configureGoogleSignIn } from "../services/googleAuth.service";
import * as Notifications from "expo-notifications";
import ErrorFallback from "../components/ErrorFallback";
import { initMonitoring, wrapRootComponent } from "../utils/monitoring";
import { sanitizeNotificationPath } from "../utils/navigation";
import { setupNetworkListener } from "../utils/network";
import OfflineBanner from "../components/OfflineBanner";
import "../i18n";

initMonitoring();
setupNetworkListener();

// expo-router renders this instead of the app when a render error bubbles up to the root.
export { ErrorFallback as ErrorBoundary };

function RootLayout() {
    useEffect(() => {
        const handleNotificationResponse = (response: Notifications.NotificationResponse | null | undefined) => {
            const rawPath = response?.notification?.request?.content?.data?.path;
            const safePath = sanitizeNotificationPath(rawPath);
            if (safePath) {
                router.push(safePath);
            }
        };

        Notifications.getLastNotificationResponseAsync().then(handleNotificationResponse);

        const subscription = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);

        return () => subscription.remove();
    }, []);

    useEffect(() => {
        configureGoogleSignIn();
    }, []);

    return (
        <PersistQueryClientProvider client={queryClient} persistOptions={queryPersistOptions}>
            <AuthProvider>
                <StatusBar style="light" />
                <OfflineBanner />
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: Colors.background },
                    }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen
                        name="taste-card"
                        options={{
                            presentation: "transparentModal",
                            animation: "fade",
                            headerShown: false,
                            contentStyle: { backgroundColor: "transparent" },
                        }}
                    />
                </Stack>
            </AuthProvider>
        </PersistQueryClientProvider>
    );
}

export default wrapRootComponent(RootLayout);
