import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import PageHeader from "../../../components/PageHeader";

export default function RootLayout() {
    return (
        <>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen
                    name="index"
                    options={{
                        headerShown: true,
                        headerBackVisible: false,
                        header: (props) => <PageHeader {...props} />,
                    }}
                />
                <Stack.Screen
                    name="edit"
                    options={{
                        presentation: "modal",
                        headerTitle: "Profili Düzenle",
                    }}
                />
                <Stack.Screen
                    name="[statType]"
                    options={{
                        headerShown: true,
                        header: (props) => <PageHeader {...props} />,
                        animation: "fade_from_bottom",
                    }}
                />
            </Stack>
        </>
    );
}
