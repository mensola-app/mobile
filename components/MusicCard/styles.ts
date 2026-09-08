import { Colors } from "@/constants/colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    horizontalCard: { height: 70, flexDirection: "row", gap: 12, alignItems: "center" },
    verticalCard: { width: 140 },
    infoWrapper: { flex: 1, justifyContent: "center" },
    verticalInfoWrapper: { flex: 0, width: "100%" },
    imageWrapper: {
        aspectRatio: 1,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    horizontalImageWrapper: { width: 70 },
    verticalImageWrapper: { width: "100%" },
    fullImage: { width: "100%", height: "100%", objectFit: "cover" },
    mainTitle: { color: Colors.textPrimary, fontSize: 14, fontWeight: "bold", marginTop: 10 },
    compactMainTitle: { fontSize: 11.5, fontWeight: "600", marginTop: 5, lineHeight: 15 },
    albumTitle: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
    subTitle: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
    compactSubTitle: { fontSize: 10, marginTop: 1, lineHeight: 13 },
    placeholderContainer: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.surface,
    },
    gridContainer: {
        width: "100%",
        height: "100%",
        flexDirection: "row",
        flexWrap: "wrap",
    },
    gridImage: {
        width: "50%",
        height: "50%",
    },
});
