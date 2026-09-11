import { useEffect } from "react";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Colors } from "../constants/colors";
import { configureGoogleSignIn } from "../services/googleAuth.service";
import * as Notifications from "expo-notifications";
import "../i18n";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 10,
            retry: 2,
        },
    },
});

export default function RootLayout() {
    useEffect(() => {
        Notifications.getLastNotificationResponseAsync().then((response) => {
            const data = response?.notification?.request?.content?.data;
            if (data?.path) {
                router.push(data.path as any);
            }
        });

        const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
            const data = response.notification.request.content.data;
            if (data?.path) {
                router.push(data.path as any);
            }
        });

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
