import { useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { styles } from "./styles";
import { IInteractionViewProps } from "./types";
import Badge from "../Badge";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Avatar from "../Avatar";
import { Colors } from "@/constants/colors";
import { useTranslation } from "react-i18next";
import { useGlobalUser } from "@/context/AuthContext";
import { CommentService } from "@/services/comment.service";
import { CommentId } from "@/types/common.types";

export default function InteractionView({ data, disabled = false, onLike }: IInteractionViewProps) {
    const { user, comment, ...interaction } = data;
    const router = useRouter();
    const { t } = useTranslation();

    let currentUser: any = undefined;
    let token: string | null = null;
    try {
        const auth = useGlobalUser();
        currentUser = auth.user;
        token = auth.token;
    } catch {
        // Fallback when rendered outside AuthProvider (e.g. isolated component unit tests)
    }

    /**
     * data.isLiked represents whether the review author liked the target item (movie, track, etc.).
     * This is displayed as an author badge at the top and must NOT be mutated by current user's comment likes.
     */
    const authorLikedTarget = Boolean(data.isLiked);

    /**
     * Local state for the comment's like status by the current logged-in user.
     */
    const [isCommentLiked, setIsCommentLiked] = useState<boolean>(Boolean(data.isLikedByMe));
    const [commentLikesCount, setCommentLikesCount] = useState<number>(data.likesCount ?? 0);
    const [isLikeLoading, setIsLikeLoading] = useState<boolean>(false);

    const replyCount = data.replyCount ?? 0;

    useEffect(() => {
        setIsCommentLiked(Boolean(data.isLikedByMe));
        setCommentLikesCount(data.likesCount ?? 0);
    }, [data.isLikedByMe, data.likesCount]);

    const formatDate = (date: Date | string): string => {
        const parsedDate = typeof date === "string" ? new Date(date) : date;

        if (Number.isNaN(parsedDate.getTime())) {
            return "Bilinmiyor";
        }

        return parsedDate.toLocaleDateString("tr-TR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const hasRating = typeof interaction.rating === "number" && interaction.rating > 0;

    const handleUserPress = () => {
        router.push({
            pathname: "/users/[userId]",
            params: { userId: user.id },
        });
    };

    /** Navigate to the comment thread screen passing the interaction data as context */
    const handleInteractionPress = () => {
        if (!comment?.id) return;
        router.push({
            pathname: "/comments/[commentId]",
            params: {
                commentId: comment.id as string,
                interactionData: JSON.stringify(data),
            },
        });
    };

    const handleReplyPress = () => {
        handleInteractionPress();
    };

    const handleLikePress = async () => {
        if (onLike) {
            onLike(comment?.id as string);
            return;
        }

        const targetCommentId = comment?.id;
        if (!targetCommentId) return;

        if (!token || !currentUser) {
            Alert.alert(
                t("common.loginRequired", "Giriş Yapmalısınız"),
                t("common.loginRequiredMessage", "Beğeni yapmak için lütfen giriş yapın."),
                [
                    { text: t("common.cancel", "İptal"), style: "cancel" },
                    {
                        text: t("common.login", "Giriş Yap"),
                        onPress: () => router.push("/(auth)/login"),
                    },
                ],
            );
            return;
        }

        if (isLikeLoading) return;

        const previousLiked = isCommentLiked;
        const previousCount = commentLikesCount;
        const nextLiked = !previousLiked;
        const nextCount = Math.max(0, previousCount + (nextLiked ? 1 : -1));

        setIsCommentLiked(nextLiked);
        setCommentLikesCount(nextCount);
        setIsLikeLoading(true);

        try {
            const res = await CommentService.toggleCommentLike(targetCommentId as CommentId);
            const freshLiked = res.data?.isLiked ?? (res as any)?.isLiked;
            const freshCount = res.data?.likeCount ?? (res as any)?.likeCount;

            if (typeof freshLiked === "boolean") setIsCommentLiked(freshLiked);
            if (typeof freshCount === "number") setCommentLikesCount(freshCount);
        } catch (error) {
            console.error("[InteractionView.handleLikePress] Error:", error);
            setIsCommentLiked(previousLiked);
            setCommentLikesCount(previousCount);
            Alert.alert(t("common.error", "Hata"), t("common.genericError", "Beğeni işlemi gerçekleştirilemedi."));
        } finally {
            setIsLikeLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.cardContent}
                disabled={disabled}
                onPress={disabled ? undefined : handleInteractionPress}
                activeOpacity={0.7}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity style={styles.userInfoContainer} onPress={handleUserPress} activeOpacity={0.8}>
                        <Avatar size={38} user={user} />
                        <View style={styles.nameWrapper}>
                            <Text style={styles.fullname}>{user.fullname || user.username}</Text>
                            <Text style={styles.username}>@{user.username}</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.interactionInfo}>
                        <Text style={styles.date}>{comment.date && formatDate(comment.date)}</Text>
                        <View style={styles.badges}>
                            {hasRating ? (
                                <Badge
                                    icon={<Ionicons name="star" color="#FF8000" />}
                                    value={interaction.rating}
                                    style={styles.badgeItem}
                                />
                            ) : null}
                            {/* Author's like on target media */}
                            {authorLikedTarget ? (
                                <Badge icon={<Ionicons name="heart" color="#FF8000" />} style={styles.badgeItem} />
                            ) : null}
                        </View>
                    </View>
                </View>

                <View style={styles.commentContainer}>
                    <Text style={styles.comment}>{comment.content}</Text>
                </View>

                {/* Action buttons (Comment like and reply count) */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, isCommentLiked && styles.actionButtonLiked]}
                        activeOpacity={0.8}
                        onPress={handleLikePress}
                        disabled={isLikeLoading}>
                        <Ionicons
                            name={isCommentLiked ? "heart" : "heart-outline"}
                            size={14}
                            color={isCommentLiked ? Colors.danger : Colors.primary}
                        />
                        <Text style={[styles.actionButtonText, isCommentLiked && styles.actionButtonTextLiked]}>
                            {commentLikesCount}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} activeOpacity={0.8} onPress={handleReplyPress}>
                        <Ionicons name="chatbubble-outline" size={14} color={Colors.primary} />
                        <Text style={styles.actionButtonText}>{replyCount}</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </View>
    );
}

export { default as InteractionSheet } from "./InteractionSheet";
