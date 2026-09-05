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
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 12,
        gap: 10,
    },
    heroContextRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        padding: 10,
        backgroundColor: Colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    heroPosterWrapper: {
        width: 36,
        height: 50,
        borderRadius: 6,
        overflow: "hidden",
        backgroundColor: Colors.surfaceLight,
    },
    heroPoster: {
        width: 36,
        height: 50,
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
        letterSpacing: 0.8,
    },
    heroMediaTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: Colors.textPrimary,
        lineHeight: 18,
    },

    // ─── Hero Interaction Card (Matches InteractionView exactly) ─────────────
    heroInteractionCard: {
        backgroundColor: Colors.surfaceLight,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 12,
        gap: 8,
        shadowColor: "#000",
        shadowOpacity: 0.16,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
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
        fontSize: 14,
        fontWeight: "700",
        color: Colors.textPrimary,
    },
    heroUserHandle: {
        fontSize: 12,
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
    heroCommentContainer: {
        backgroundColor: Colors.surface,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginVertical: 2,
    },
    heroComment: {
        fontSize: 13,
        color: Colors.textPrimary,
        lineHeight: 19,
    },
    heroActionsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 2,
    },
    heroDate: {
        fontSize: 11,
        color: Colors.textSecondary,
    },
    heroLikeBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: "rgba(74, 158, 255, 0.15)",
    },
    heroLikeBtnActive: {
        backgroundColor: "rgba(239, 68, 68, 0.15)",
    },
    heroLikeText: {
        fontSize: 12,
        fontWeight: "600",
        color: Colors.primary,
    },
    heroLikeTextActive: {
        color: Colors.danger,
    },

    // ─── Thread List ──────────────────────────────────────────────────────────
    listContent: {
        paddingTop: 4,
        paddingBottom: 110,
    },
    separator: {
        height: 8,
    },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 32,
    },
    errorContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingTop: 60,
        gap: 12,
    },
    errorText: {
        fontSize: 15,
        fontWeight: "600",
        color: Colors.textSecondary,
        textAlign: "center",
    },
    retryButton: {
        paddingHorizontal: 18,
        paddingVertical: 9,
        backgroundColor: Colors.surfaceLight,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        marginTop: 4,
    },
    retryText: {
        color: Colors.primary,
        fontSize: 13,
        fontWeight: "600",
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 40,
        paddingBottom: 20,
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
        textAlign: "center",
        paddingHorizontal: 32,
    },
    footerLoader: {
        paddingVertical: 16,
        alignItems: "center",
    },

    // ─── Thread Comment Card ──────────────────────────────────────────────────
    commentCard: {
        marginHorizontal: 16,
        backgroundColor: Colors.surfaceLight,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 12,
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
        flexWrap: "wrap",
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
    commentTextContainer: {
        backgroundColor: Colors.surface,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    commentText: {
        fontSize: 13,
        color: Colors.textPrimary,
        lineHeight: 18,
    },
    commentFooter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 2,
    },
    commentDate: {
        fontSize: 11,
        color: Colors.textSecondary,
    },
    commentActionsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    commentActionBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 999,
        backgroundColor: "rgba(74, 158, 255, 0.12)",
    },
    commentActionLiked: {
        backgroundColor: "rgba(239, 68, 68, 0.12)",
    },
    commentActionText: {
        fontSize: 11,
        fontWeight: "600",
        color: Colors.primary,
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
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "rgba(74, 158, 255, 0.08)",
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
