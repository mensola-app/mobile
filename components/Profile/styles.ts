import { Colors } from "@/constants/colors";
import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: 120,
    },

    headerWrapper: {
        alignItems: "center",
        paddingTop: 12,
        paddingBottom: 20,
        paddingHorizontal: 20,
        gap: 12,
    },

    avatarRing: {
        padding: 3,
        borderRadius: 999,
        borderWidth: 2,
        borderColor: Colors.primary,
        shadowColor: Colors.primary,
        shadowOpacity: 0.4,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 0 },
        elevation: 8,
    },

    nameBlock: {
        alignItems: "center",
        gap: 4,
    },
    fullnameLabel: {
        fontSize: 20,
        fontWeight: "700",
        color: Colors.textPrimary,
        letterSpacing: -0.4,
    },
    usernameLabel: {
        fontSize: 13,
        color: Colors.textMuted,
        fontWeight: "400",
    },

    userBio: {
        color: Colors.textSecondary,
        fontSize: 13,
        textAlign: "center",
        lineHeight: 18,
        paddingHorizontal: 16,
    },

    actionButtonContainer: {
        flexDirection: "row",
        gap: 10,
        width: "100%",
    },
    actionButton: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 9,
        borderRadius: 10,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    actionSquareButton: {
        width: 38,
        height: 38,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 10,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    actionButtonPrimary: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    actionButtonFollowing: {
        backgroundColor: "transparent",
        borderColor: Colors.primary,
    },
    actionButtonText: {
        color: Colors.textPrimary,
        fontSize: 13,
        fontWeight: "600",
    },
    actionButtonTextPrimary: {
        color: "#fff",
    },

    statsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 8,
        width: "100%",
    },
    statItem: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: 2,
    },
    statValue: {
        fontSize: 16,
        fontWeight: "700",
        color: Colors.textPrimary,
        letterSpacing: -0.4,
    },
    statLabel: {
        fontSize: 10,
        color: Colors.textSecondary,
        textTransform: "uppercase",
        letterSpacing: 0.6,
    },

    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginHorizontal: 20,
        marginVertical: 4,
    },

    profileFooter: {
        paddingHorizontal: 20,
        marginTop: 8,
        gap: 6,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: "700",
        color: Colors.textMuted,
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: 4,
        marginTop: 8,
    },

    footerItemLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flex: 1,
    },
    footerItemLabel: {
        color: Colors.textPrimary,
        fontSize: 14,
        fontWeight: "400",
    },
    footerItemRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    footerItemValue: {
        color: Colors.textMuted,
        fontSize: 14,
    },
    privateContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
        gap: 12,
    },
    privateText: {
        fontSize: 16,
        color: Colors.textPrimary,
        fontWeight: "600",
    },
    privateSubText: {
        fontSize: 13,
        color: Colors.textSecondary,
        textAlign: "center",
        paddingHorizontal: 32,
    },
    followRequestBanner: {
        width: "100%",
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: 14,
        padding: 14,
        gap: 12,
        marginBottom: 8,
    },
    followRequestBannerContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    followRequestBannerIconWrapper: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "rgba(255, 128, 0, 0.12)",
        justifyContent: "center",
        alignItems: "center",
    },
    followRequestBannerText: {
        flex: 1,
        fontSize: 13,
        fontWeight: "600",
        color: Colors.textPrimary,
        lineHeight: 18,
    },
    followRequestBannerActions: {
        flexDirection: "row",
        gap: 10,
    },
    followRequestAcceptButton: {
        flex: 1,
        backgroundColor: Colors.primary,
        paddingVertical: 9,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    followRequestAcceptButtonText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "600",
    },
    followRequestDeclineButton: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingVertical: 9,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    followRequestDeclineButtonText: {
        color: Colors.textSecondary,
        fontSize: 13,
        fontWeight: "600",
    },
});

export { styles };
