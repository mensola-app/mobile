import { Colors } from "@/constants/colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    button: {
        backgroundColor: Colors.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 48,
    },
    disabled: {
        opacity: 0.6,
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    iconWrapper: {
        width: 20,
        height: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    label: {
        color: Colors.textPrimary,
        fontSize: 15,
        fontWeight: "600",
    },
});
