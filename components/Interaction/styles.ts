import { Colors } from "@/constants/colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        padding: 12,
        backgroundColor: Colors.surfaceLight,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: "#000",
        shadowOpacity: 0.16,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },
    cardContent: {
        gap: 8,
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 0,
    },
    userInfoContainer: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 8,
    },
    nameWrapper: {
        flex: 1,
        justifyContent: "center",
    },
    username: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    fullname: {
        fontSize: 14,
        fontWeight: "700",
        color: Colors.textPrimary,
    },
    interactionInfo: {
        alignItems: "flex-end",
        gap: 6,
    },
    date: {
        color: Colors.textSecondary,
        fontSize: 11,
    },
    badges: {
        flexDirection: "row",
        gap: 6,
    },
    badgeItem: {
        height: 26,
        minWidth: 30,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 6,
        paddingVertical: 3,
    },
    commentContainer: {
        backgroundColor: Colors.surface,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 4,
    },
    comment: {
        fontSize: 12.5,
        color: Colors.textPrimary,
        lineHeight: 18,
    },
    actionButtons: {
        flexDirection: "row",
        gap: 6,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: "rgba(74, 158, 255, 0.15)",
    },
    actionButtonLiked: {
        backgroundColor: "rgba(239, 68, 68, 0.15)",
    },
    actionButtonText: {
        color: Colors.primary,
        fontSize: 12,
        fontWeight: "600",
    },
    actionButtonTextLiked: {
        color: Colors.danger,
    },
});
