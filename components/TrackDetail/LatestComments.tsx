import { Text, TouchableOpacity, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import InteractionView from "../Interaction";
import { Colors } from "@/constants/colors";

import { LatestCommentsProps } from "./types";
import { styles } from "./styles";

export default function LatestComments({
    targetId,
    trackTitle,
    interactions,
    commentsCount,
    onRateReviewPress,
}: LatestCommentsProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const { trackId } = useLocalSearchParams<{ trackId?: string }>();

    const handleSeeAllPress = () => {
        const effectiveId = targetId || trackId;
        if (effectiveId) {
            router.push({
                pathname: "/comments/[type]/[id]",
                params: { type: "track", id: effectiveId, title: trackTitle },
            } as any);
        }
    };

    const commentInteractions = interactions.filter((item) => !!item.comment?.content);

    if (commentInteractions.length === 0) {
        return (
            <View style={styles.emptyCommentsContainer} testID="tracks-empty-reviews">
                <Ionicons name="chatbubble-ellipses-outline" size={32} color={Colors.textMuted} style={styles.emptyIcon} />
                <Text style={styles.emptyCommentsText}>
                    {t("tracks.detail.emptyReviewsText")}
                </Text>
                {onRateReviewPress && (
                    <TouchableOpacity
                        style={styles.rateButton}
                        onPress={onRateReviewPress}
                        activeOpacity={0.8}
                        testID="tracks-rate-review-button">
                        <Ionicons name="star" size={16} color="#FFCC00" />
                        <Text style={styles.rateButtonText}>{t("tracks.detail.rateAndReview")}</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    return (
        <View style={styles.commentsContainer}>
            <View style={styles.commentsHeader}>
                <Text style={styles.commentsTitle}>{t("tracks.detail.latestComments")}</Text>
                <TouchableOpacity onPress={handleSeeAllPress} activeOpacity={0.7} testID="tracks-see-all-button">
                    <Text style={styles.seeAll}>{t("tracks.detail.seeAll", { count: commentsCount || 0 })}</Text>
                </TouchableOpacity>
            </View>

            {commentInteractions.map((item) => (
                <View key={item.id} style={styles.commentItem}>
                    <InteractionView
                        data={{
                            id: item.id,
                            rating: typeof item.rating === "string" ? parseFloat(item.rating) : item.rating,
                            isLiked: item.isLiked,
                            user: {
                                id: item.user.id,
                                username: item.user.username,
                                fullname: item.user.fullname || item.user.username,
                                avatar: item.user.avatar || "",
                            },
                            comment: {
                                id: item.comment.id,
                                content: item.comment.content,
                                date: item.comment.date,
                            },
                            likesCount: item.likesCount ?? 0,
                            replyCount: item.replyCount ?? 0,
                            isLikedByMe: item.isLikedByMe,
                        }}
                    />
                </View>
            ))}
        </View>
    );
}
