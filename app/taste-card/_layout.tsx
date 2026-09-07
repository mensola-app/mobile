import { Stack } from "expo-router";

export default function TasteCardLayout() {
    return (
        <Stack
            screenOptions={{
                presentation: "transparentModal",
                animation: "fade",
                headerShown: false,
                contentStyle: { backgroundColor: "transparent" },
            }}>
            <Stack.Screen
                name="index"
                options={{
                    presentation: "transparentModal",
                    animation: "fade",
                    headerShown: false,
                    contentStyle: { backgroundColor: "transparent" },
                }}
            />
        </Stack>
    );
}
