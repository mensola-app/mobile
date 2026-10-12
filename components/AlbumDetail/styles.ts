import { Colors } from "@/constants/colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.background,
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.background,
        padding: 24,
    },
    errorText: {
        color: Colors.textSecondary,
        fontSize: 16,
        textAlign: "center",
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    retryText: {
        color: Colors.textPrimary,
        fontWeight: "600",
    },
    rowWrapper: {
        gap: "3.5%",
        paddingHorizontal: "4%",
    },
    // Hero Banner styles
    heroBanner: {
        height: 310,
        width: "100%",
        position: "relative",
    },
    bannerBackgroundImg: {
        width: "100%",
        height: "100%",
    },
    bannerGradient: {
        ...StyleSheet.absoluteFill,
    },
    bannerContent: {
        position: "absolute",
        bottom: 12,
        left: 16,
        right: 16,
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 16,
    },
    posterWrapper: {
        width: 110,
    },
    poster: {
        width: "100%",
        aspectRatio: 1,
        borderRadius: 12,
        backgroundColor: Colors.surface,
    },
    posterPlaceholder: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.surface,
    },
    infoContainer: {
        flex: 1,
        gap: 4,
        minWidth: 0,
    },
    titleWrapper: {
        flexDirection: "row",
        alignItems: "center",
    },
    movieTitle: {
        color: Colors.textPrimary,
        fontSize: 20,
        fontWeight: "bold",
    },
    creatorContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 2,
    },
    avatar: {
        width: 22,
        height: 22,
        borderRadius: 11,
        marginRight: 6,
    },
    avatarPlaceholder: {
        backgroundColor: Colors.surfaceLight,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarLetter: {
        color: Colors.textPrimary,
        fontSize: 11,
        fontWeight: "bold",
    },
    creatorName: {
        color: Colors.textSecondary,
        fontSize: 13,
        fontWeight: "500",
    },
    movieStats: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginTop: 4,
        flexWrap: "wrap",
    },
    actionBar: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 8,
        width: "100%",
    },
    descriptionSection: {
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 4,
    },

    tabContainer: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        marginTop: 12,
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    tabButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 12,
        marginRight: 24,
        borderBottomWidth: 2,
        borderBottomColor: "transparent",
    },
    activeTabButton: {
        borderBottomColor: Colors.primary,
    },
    tabText: {
        color: Colors.textSecondary,
        fontSize: 15,
        fontWeight: "600",
    },
    activeTabText: {
        color: Colors.textPrimary,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 48,
    },
    emptyText: {
        color: Colors.textSecondary,
        fontSize: 15,
        marginTop: 12,
        textAlign: "center",
        paddingHorizontal: 24,
    },
    rateButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "rgba(255, 204, 0, 0.12)",
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(255, 204, 0, 0.3)",
        marginTop: 16,
    },
    rateButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFCC00",
    },
});
