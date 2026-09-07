import { Dimensions, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
export const CARD_WIDTH = Math.min(SCREEN_WIDTH - 44, 340);
export const ITEM_WIDTH = Math.min(Math.floor((CARD_WIDTH - 32 - 16) / 3), 88);

export const styles = StyleSheet.create({
    overlayContainer: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        justifyContent: "center",
        alignItems: "center",
    },
    backdrop: {
        ...StyleSheet.absoluteFill,
    },
    contentWrapper: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    topActionsRow: {
        width: CARD_WIDTH,
        flexDirection: "row",
        justifyContent: "flex-end",
        marginBottom: 10,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(255, 255, 255, 0.12)",
        justifyContent: "center",
        alignItems: "center",
    },
    cardOuterWrapper: {
        width: CARD_WIDTH,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 12,
    },
    cardContainer: {
        width: CARD_WIDTH,
        aspectRatio: 4 / 5,
        borderRadius: 22,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.12)",
    },
    squareCardContainer: {
        borderRadius: 0,
        borderWidth: 0,
    },
    hiddenCaptureContainer: {
        position: "absolute",
        left: -9999,
        top: -9999,
    },
    cardGradient: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 16,
        justifyContent: "space-between",
    },
    headerBlock: {
        gap: 6,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    userSection: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        flex: 1,
    },
    avatarBorder: {
        borderRadius: 999,
        padding: 2,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    userTextContainer: {
        flex: 1,
        justifyContent: "center",
    },
    userFullname: {
        color: Colors.textPrimary,
        fontSize: 14,
        fontWeight: "700",
        letterSpacing: -0.2,
    },
    userHandle: {
        color: Colors.textSecondary,
        fontSize: 12,
        fontWeight: "500",
    },
    appSection: {
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
        backgroundColor: "rgba(255, 255, 255, 0.06)",
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    appIcon: {
        width: 24,
        height: 24,
        borderRadius: 6,
    },
    appName: {
        color: Colors.textPrimary,
        fontSize: 12.5,
        fontWeight: "700",
        letterSpacing: -0.2,
    },
    headerDivider: {
        height: 1,
        backgroundColor: "rgba(255, 255, 255, 0.08)",
    },
    sectionContainer: {
        gap: 6,
    },
    sectionHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
    },
    sectionIconBadge: {
        width: 20,
        height: 20,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: "700",
        color: Colors.textPrimary,
        letterSpacing: 0.2,
    },
    itemsGrid: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 8,
    },
    gridItem: {
        width: ITEM_WIDTH,
    },
    shareActionContainer: {
        width: CARD_WIDTH,
        marginTop: 18,
    },
    shareButton: {
        width: "100%",
        borderRadius: 14,
        minHeight: 48,
        backgroundColor: Colors.primary,
        elevation: 6,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    shareButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
    },
});
