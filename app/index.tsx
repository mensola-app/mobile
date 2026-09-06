import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useGlobalUser } from "../context/AuthContext";
import { Colors } from "../constants/colors";

export default function Index() {
    const { user, isLoading } = useGlobalUser();

    if (isLoading) {
        return (
            <View
                style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.background }}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (user) {
        return <Redirect href="/home" />;
    }

    return <Redirect href="/login" />;
}
