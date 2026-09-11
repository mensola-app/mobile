import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ProfileView from "../../../components/Profile";
import { Colors } from "@/constants/colors";
import { Stack, useRouter } from "expo-router";
import { ProfileProvider } from "../../../context/ProfileContext";

export default function Profile() {
    const router = useRouter();
    return (
        <ProfileProvider userId="me">
            <Stack.Screen
                options={
                    {
                        headerTransparent: true,
                        headerBackVisible: false,
                        headerRightActions: [
                            {
                                id: "settings",
                                icon: "menu",
                                size: 22,
                                onPress: () => router.push("/settings"),
                            },
                        ],
                    } as any
                }
            />
            <SafeAreaView style={styles.container}>
                <ProfileView />
            </SafeAreaView>
        </ProfileProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingTop: 20,
    },
});
