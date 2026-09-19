import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
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
        height: 110,
    },
    poster: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: Colors.surface,
    },
    posterPlaceholder: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    infoContainer: {
        flex: 1,
        gap: 4,
    },
    titleWrapper: {
        flexDirection: "row",
        alignItems: "center",
    },
    artistName: {
        color: Colors.textPrimary,
        fontSize: 20,
        fontWeight: "bold",
    },
    metaWrapper: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 2,
    },
    followersText: {
        fontSize: 13,
        color: Colors.textSecondary,
        fontWeight: "500",
    },
    dot: {
        color: Colors.textSecondary,
        fontSize: 14,
    },
    genresText: {
        fontSize: 13,
        color: Colors.textMuted,
        textTransform: "capitalize",
        flexShrink: 1,
    },
    actionBar: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 8,
    },
    followButton: {
        flex: 1,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    followButtonActive: {
        backgroundColor: Colors.primary,
    },
    followButtonInactive: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    followButtonText: {
        fontSize: 14,
        fontWeight: "600",
    },
    followButtonTextActive: {
        color: "#FFFFFF",
    },
    followButtonTextInactive: {
        color: Colors.textPrimary,
    },
    sectionContainer: {
        paddingTop: 16,
        paddingBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: Colors.textPrimary,
        marginBottom: 12,
        paddingHorizontal: 16,
    },
    trackItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    trackIndexText: {
        fontSize: 15,
        fontWeight: "500",
        color: Colors.textMuted,
        width: 20,
        textAlign: "center",
        marginRight: 12,
    },
    trackImage: {
        width: 44,
        height: 44,
        borderRadius: 6,
        backgroundColor: Colors.surface,
    },
    trackInfo: {
        flex: 1,
        marginLeft: 12,
        justifyContent: "center",
    },
    trackTitle: {
        fontSize: 15,
        fontWeight: "500",
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    trackDuration: {
        fontSize: 13,
        color: Colors.textMuted,
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
});
