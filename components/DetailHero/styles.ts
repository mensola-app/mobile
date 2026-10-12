import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";

export const styles = StyleSheet.create({
    heroBanner: {
        minHeight: 320,
        height: 320,
        width: "100%",
        position: "relative",
    },
    bannerGradient: {
        ...StyleSheet.absoluteFill,
    },
    bannerBackgroundImg: {
        width: "100%",
        height: "100%",
    },
    bannerContent: {
        position: "absolute",
        bottom: 10,
        left: 16,
        right: 16,
        flexDirection: "row",
        alignItems: "flex-end",
    },
    posterWrapper: {
        // Width will be injected dynamically based on screen size (e.g. 106 or 120)
    },
    poster: {
        width: "100%",
        borderRadius: 16,
        marginBottom: 8,
        backgroundColor: Colors.surfaceLight,
        overflow: "hidden",
    },
    posterPlaceholder: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.surfaceLight,
    },
    infoContainer: {
        flex: 1,
        gap: 2,
        minWidth: 0,
    },
    titleWrapper: {
        flexDirection: "row",
        alignItems: "baseline",
        flexWrap: "wrap",
        gap: 6,
        width: "100%",
    },
    title: {
        color: Colors.textPrimary,
        fontSize: 20,
        fontWeight: "bold",
        flexShrink: 1,
    },
    titleRight: {
        color: Colors.textSecondary,
        fontSize: 14,
        fontWeight: "normal",
        flexShrink: 0,
    },
    subtitleWrapper: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        width: "100%",
    },
    stats: {
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
});
