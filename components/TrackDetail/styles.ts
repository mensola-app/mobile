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
        color: "white",
        fontWeight: "600",
    },
    rowWrapper: {
        gap: "3.5%",
        paddingHorizontal: "4%",
    },

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
    trackTitle: {
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

    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 48,
    },
    emptyText: {
        color: Colors.textMuted,
        fontSize: 15,
        marginTop: 12,
    },

    listContainer: {
        paddingVertical: 8,
        flexShrink: 1,
    },
    sheetError: {
        color: Colors.danger,
        fontSize: 14,
        marginBottom: 8,
        textAlign: "center",
    },
    bottomSheetEmptyText: {
        color: Colors.textSecondary,
        fontSize: 15,
        paddingVertical: 24,
        textAlign: "center",
    },
    listItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    listItemLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flex: 1,
    },
    listItemIcon: {
        color: Colors.textSecondary,
        fontSize: 20,
    },
    listItemTitle: {
        color: Colors.textPrimary,
        fontSize: 16,
        fontWeight: "500",
        flex: 1,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: Colors.border,
        alignItems: "center",
        justifyContent: "center",
    },
    checkboxChecked: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    commentsContainer: {
        gap: 10,
        paddingTop: 14,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    commentsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    commentsTitle: {
        color: Colors.textPrimary,
        fontSize: 16,
        fontWeight: "700",
    },
    seeAll: {
        color: Colors.primary,
        fontSize: 13,
        fontWeight: "600",
    },
    commentItem: {
        marginBottom: 8,
    },
    emptyCommentsContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 28,
        paddingHorizontal: 24,
        marginHorizontal: 16,
        marginTop: 14,
        backgroundColor: Colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    emptyIcon: {
        marginBottom: 10,
        opacity: 0.8,
    },
    emptyCommentsText: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 16,
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
    },
    rateButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFCC00",
    },
});
