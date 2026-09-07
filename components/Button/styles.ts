import { Colors } from "@/constants/colors";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    button: {
        backgroundColor: Colors.primary,
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 48,
    },
    label: { color: Colors.textPrimary, fontSize: 16, fontWeight: "bold" },
    disabled: { opacity: 0.6 },
});

export { styles };
