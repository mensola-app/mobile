import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";

export const styles = StyleSheet.create({
    container: {
        gap: 16,
        paddingTop: 8,
        paddingBottom: 24,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    imagePicker: {
        backgroundColor: Colors.surface,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: Colors.border,
        borderStyle: "dashed",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        position: "relative",
    },
    imagePickerActive: {
        borderStyle: "solid",
        borderColor: "transparent",
    },
    playlistImagePicker: {
        width: 76,
        height: 76,
        aspectRatio: 1,
    },
    movieImagePicker: {
        width: 60,
        height: 90,
        aspectRatio: 2 / 3,
    },
    placeholderContainer: {
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
    },
    addBadge: {
        position: "absolute",
        bottom: 5,
        right: 5,
        backgroundColor: Colors.primary,
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    previewImage: {
        width: "100%",
        height: "100%",
        borderRadius: 10,
    },
    removeBadge: {
        position: "absolute",
        top: 5,
        right: 5,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    titleWrapper: {
        flex: 1,
    },
    titleInput: {
        marginBottom: 0,
    },
    switchRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    switchLabelGroup: {
        flex: 1,
        marginRight: 12,
    },
    switchLabel: {
        color: Colors.textPrimary,
        fontSize: 15,
        fontWeight: "600",
    },
    switchDesc: {
        color: Colors.textSecondary,
        fontSize: 12,
        marginTop: 2,
    },
    errorText: {
        color: Colors.danger,
        fontSize: 13,
        textAlign: "center",
    },
    submitBtn: {
        marginTop: 8,
    },
});

