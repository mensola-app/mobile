import { Colors } from "@/constants/colors";
import { StyleSheet } from "react-native";

export const threadStyles = StyleSheet.create({
    // ─── Screen ──────────────────────────────────────────────────────────────
    screen: {
        flex: 1,
        backgroundColor: Colors.background,
    },

    // ─── Hero Header ─────────────────────────────────────────────────────────
    heroCard: {
        backgroundColor: Colors.surfaceLight,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 14,
    },
    heroContextRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    heroPosterWrapper: {
        width: 40,
        height: 56,
        borderRadius: 6,
        overflow: "hidden",
        backgroundColor: Colors.surface,
    },
    heroPoster: {
        width: 40,
        height: 56,
    },
    heroContextInfo: {
        flex: 1,
        gap: 2,
    },
    heroMediaType: {
        fontSize: 10,
        fontWeight: "700",
        color: Colors.primary,
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    heroMediaTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: Colors.textPrimary,
        lineHeight: 18,
    },

    // ─── Hero Interaction Card ────────────────────────────────────────────────
    heroInteractionCard: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 12,
        gap: 10,
    },
    heroUserRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    heroUserLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 8,
    },
    heroUserName: {
        fontSize: 13,
        fontWeight: "700",
        color: Colors.textPrimary,
    },
    heroUserHandle: {
        fontSize: 11,
        color: Colors.textSecondary,
        marginTop: 1,
    },
    heroBadgesRow: {
        flexDirection: "row",
        gap: 6,
        alignItems: "center",
    },
    heroBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 7,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: "rgba(255,128,0,0.15)",
    },
    heroBadgeText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#FF8000",
    },
    heroComment: {
        fontSize: 13,
        color: Colors.textPrimary,
        lineHeight: 20,
    },
    heroActionsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    heroDate: {
        fontSize: 11,
        color: Colors.textMuted,
    },
    heroLikeBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 999,
        backgroundColor: "rgba(74,158,255,0.10)",
    },
    heroLikeBtnActive: {
        backgroundColor: "rgba(239,68,68,0.14)",
    },
    heroLikeText: {
        fontSize: 12,
        fontWeight: "600",
        color: Colors.textSecondary,
    },
    heroLikeTextActive: {
        color: Colors.danger,
    },

    // ─── Thread List ──────────────────────────────────────────────────────────
    listContent: {
        paddingTop: 8,
        paddingBottom: 120,
    },
    separator: {
        height: 1,
        backgroundColor: Colors.border,
        marginHorizontal: 16,
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 60,
        gap: 8,
    },
    emptyText: {
        fontSize: 15,
        fontWeight: "600",
        color: Colors.textSecondary,
    },
    emptySubtext: {
        fontSize: 12,
        color: Colors.textMuted,
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: "center",
    },

    // ─── Thread Comment Card ──────────────────────────────────────────────────
    commentCard: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    commentHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
    },
    commentBody: {
        flex: 1,
        gap: 6,
    },
    commentUserRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    commentUsername: {
        fontSize: 13,
        fontWeight: "700",
        color: Colors.textPrimary,
    },
    commentReplyTo: {
        fontSize: 12,
        color: Colors.textMuted,
    },
    commentReplyToName: {
        fontSize: 12,
        color: Colors.primary,
        fontWeight: "600",
    },
    commentText: {
        fontSize: 13.5,
        color: Colors.textPrimary,
        lineHeight: 20,
    },
    commentFooter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 2,
    },
    commentDate: {
        fontSize: 11,
        color: Colors.textMuted,
    },
    commentActionsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    commentActionBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: "rgba(74,158,255,0.08)",
    },
    commentActionLiked: {
        backgroundColor: "rgba(239,68,68,0.10)",
    },
    commentActionText: {
        fontSize: 11,
        fontWeight: "600",
        color: Colors.textSecondary,
    },
    commentActionTextLiked: {
        color: Colors.danger,
    },

    // ─── Reply Input Bar ──────────────────────────────────────────────────────
    inputWrapper: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.surfaceLight,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    replyingToBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: "rgba(74,158,255,0.08)",
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    replyingToText: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    replyingToName: {
        fontWeight: "700",
        color: Colors.primary,
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 10,
    },
    textInput: {
        flex: 1,
        minHeight: 40,
        maxHeight: 100,
        backgroundColor: Colors.surface,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 14,
        color: Colors.textPrimary,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    sendBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    sendBtnDisabled: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
    },
});
