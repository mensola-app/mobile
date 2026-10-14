import { useEffect } from "react";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Colors } from "../constants/colors";
import { configureGoogleSignIn } from "../services/googleAuth.service";
import { shouldRetryQuery, queryRetryDelay } from "../api/retry";
import * as Notifications from "expo-notifications";
import ErrorFallback from "../components/ErrorFallback";
import { initMonitoring, wrapRootComponent } from "../utils/monitoring";
import { sanitizeNotificationPath } from "../utils/navigation";
import "../i18n";

initMonitoring();

// expo-router renders this instead of the app when a render error bubbles up to the root.
export { ErrorFallback as ErrorBoundary };

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 10,
            retry: shouldRetryQuery,
            retryDelay: queryRetryDelay,
        },
    },
});

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
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <StatusBar style="light" />
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
        </QueryClientProvider>
    );
}

export default wrapRootComponent(RootLayout);
