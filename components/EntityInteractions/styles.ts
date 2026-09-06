import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 32,
        flexGrow: 1,
    },
    separator: {
        height: 12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 48,
    },
    footerLoader: {
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 64,
        paddingHorizontal: 24,
    },
    emptyIcon: {
        marginBottom: 16,
        opacity: 0.7,
    },
    emptyTitle: {
        color: Colors.textPrimary,
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
        textAlign: "center",
    },
    emptySubtitle: {
        color: Colors.textMuted,
        fontSize: 13,
        textAlign: "center",
        lineHeight: 18,
    },
    errorContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 48,
        paddingHorizontal: 24,
    },
    errorText: {
        color: "#FF4D4F",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 16,
    },
    retryButton: {
        paddingVertical: 10,
        paddingHorizontal: 24,
        backgroundColor: Colors.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    retryText: {
        color: Colors.textPrimary,
        fontSize: 13,
        fontWeight: "600",
    },
});
