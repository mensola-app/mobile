import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import PageHeader from "@/components/PageHeader";
import { Colors } from "@/constants/colors";

export default function ArtistLayout() {
    return (
        <>
            <StatusBar style="light" />
            <Stack
                screenOptions={{
                    headerShown: true,
                    header: (props) => <PageHeader {...props} />,
                    contentStyle: { backgroundColor: Colors.background },
                    animation: "slide_from_right",
                }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="discography" />
            </Stack>
        </>
    );
}
