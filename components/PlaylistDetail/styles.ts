import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";

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
        color: Colors.textMuted,
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
    // Square poster for playlist (vs 2/3 ratio for movies)
    poster: {
        width: "100%",
        aspectRatio: 1,
        borderRadius: 12,
        backgroundColor: Colors.surface,
    },
    posterPlaceholder: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.surfaceLight,
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
    description: {
        color: Colors.textSecondary,
        fontSize: 14,
        lineHeight: 20,
    },
    readMoreButton: {
        marginTop: 4,
        alignSelf: "flex-start",
    },
    readMoreText: {
        color: Colors.primary,
        fontSize: 13,
        fontWeight: "600",
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
        color: Colors.textMuted,
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
        color: Colors.textMuted,
        fontSize: 15,
        marginTop: 12,
    },
    ownerRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    ownerAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 12,
    },
    ownerAvatarPlaceholder: {
        backgroundColor: Colors.surfaceLight,
        justifyContent: "center",
        alignItems: "center",
    },
    ownerAvatarLetter: {
        color: Colors.textPrimary,
        fontSize: 18,
        fontWeight: "bold",
    },
    ownerInfo: {
        flex: 1,
    },
    ownerName: {
        color: Colors.textPrimary,
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 2,
    },
    ownerUsername: {
        color: Colors.textMuted,
        fontSize: 13,
    },
    creatorBadge: {
        backgroundColor: "rgba(74, 158, 255, 0.15)",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    creatorBadgeText: {
        color: Colors.primary,
        fontSize: 12,
        fontWeight: "600",
    },
});
