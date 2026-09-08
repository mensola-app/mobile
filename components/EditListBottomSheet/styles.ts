import { StyleSheet } from "react-native";
import { styles as baseStyles } from "@/components/CreateListBottomSheet/styles";
import { Colors } from "@/constants/colors";

export const styles = StyleSheet.create({
    ...baseStyles,
    deleteBtn: {
        backgroundColor: "rgba(239, 68, 68, 0.12)",
        borderWidth: 1,
        borderColor: "rgba(239, 68, 68, 0.3)",
        marginTop: 4,
    },
    deleteBtnLabel: {
        color: Colors.danger,
    },
});
