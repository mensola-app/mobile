import React, { memo, useCallback } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Avatar from "@/components/Avatar";
import { Colors } from "@/constants/colors";
import { formatRelativeTime } from "@/utils/date.utils";
import { threadStyles as styles } from "./styles";
import { LocalCommentItem, ReplyTarget } from "./types";
import { CommentThreadItem } from "@/types/interaction.types";

interface ThreadCommentCardProps {
    item: LocalCommentItem;
    /** All comments in the thread – used to look up parent's username */
    allComments: CommentThreadItem[];
    /** The top-level root commentId (parentId IS NULL) */
    rootCommentId: string;
    onReply: (target: ReplyTarget) => void;
    onToggleLike: (commentId: string) => void;
    isLikeLoading?: boolean;
}

const ThreadCommentCard = memo(function ThreadCommentCard({
    item,
    allComments,
    rootCommentId,
    onReply,
    onToggleLike,
    isLikeLoading,
}: ThreadCommentCardProps) {
    const router = useRouter();
    const { t, i18n } = useTranslation();

    const likeCount = item._localLikeCount ?? item.likeCount;
    const isLiked = item._localIsLiked ?? item.isLiked ?? false;

    /** Resolve parent's username for the → @mention indicator */
    const replyToUsername: string | null = (() => {
        if (!item.parentId) return null;
        // Only show if it's a reply to someone other than the root
        if ((item.parentId as string) === rootCommentId) return null;
        const parent = allComments.find((c) => (c.id as string) === (item.parentId as string));
        return parent?.user.username ?? null;
    })();

    const handleUserPress = useCallback(() => {
        router.push({ pathname: "/users/[userId]", params: { userId: item.user.id as string } });
    }, [item.user.id, router]);

    const handleReply = useCallback(() => {
        onReply({ commentId: item.id, username: item.user.username });
    }, [item.id, item.user.username, onReply]);

    const handleLike = useCallback(() => {
        onToggleLike(item.id as string);
    }, [item.id, onToggleLike]);

    return (
        <View style={styles.commentCard}>
            <View style={styles.commentHeader}>
                {/* Avatar – tappable */}
                <TouchableOpacity onPress={handleUserPress} activeOpacity={0.8}>
                    <Avatar
                        user={{ id: item.user.id, username: item.user.username, avatar: item.user.avatar ?? undefined }}
                        size={34}
                    />
                </TouchableOpacity>

                <View style={styles.commentBody}>
                    {/* Username + optional reply-to */}
                    <View style={styles.commentUserRow}>
                        <TouchableOpacity onPress={handleUserPress} activeOpacity={0.8}>
                            <Text style={styles.commentUsername}>{item.user.username}</Text>
                        </TouchableOpacity>
                        {replyToUsername ? (
                            <Text style={styles.commentReplyTo}>
                                {" → "}
                                <Text style={styles.commentReplyToName}>@{replyToUsername}</Text>
                            </Text>
                        ) : null}
                    </View>

                    {/* Comment text inside surface box */}
                    <View style={styles.commentTextContainer}>
                        <Text style={styles.commentText}>{item.content}</Text>
                    </View>

                    {/* Footer: date + actions */}
                    <View style={styles.commentFooter}>
                        <Text style={styles.commentDate}>{formatRelativeTime(item.createdAt, i18n.language)}</Text>

                        <View style={styles.commentActionsRow}>
                            {/* Reply button */}
                            <TouchableOpacity
                                style={styles.commentActionBtn}
                                activeOpacity={0.75}
                                onPress={handleReply}>
                                <Ionicons name="chatbubble-outline" size={13} color={Colors.primary} />
                                <Text style={styles.commentActionText}>{t("comments.reply", "Yanıtla")}</Text>
                            </TouchableOpacity>

                            {/* Like button */}
                            <TouchableOpacity
                                style={[styles.commentActionBtn, isLiked && styles.commentActionLiked]}
                                activeOpacity={0.75}
                                onPress={handleLike}
                                disabled={isLikeLoading}>
                                <Ionicons
                                    name={isLiked ? "heart" : "heart-outline"}
                                    size={13}
                                    color={isLiked ? Colors.danger : Colors.primary}
                                />
                                {likeCount > 0 ? (
                                    <Text
                                        style={[styles.commentActionText, isLiked && styles.commentActionTextLiked]}>
                                        {likeCount}
                                    </Text>
                                ) : null}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
});

export default ThreadCommentCard;
