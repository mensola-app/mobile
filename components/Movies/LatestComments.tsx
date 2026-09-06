import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import InteractionView from "../Interaction";
import { InteractionItemResponse } from "@/types/interaction.types";
import { Colors } from "@/constants/colors";
import { useTranslation } from "react-i18next";

interface LatestCommentsProps {
    targetId?: string;
    movieTitle?: string;
    interactions: InteractionItemResponse[];
    onRateReviewPress?: () => void;
}

export default function LatestComments({ targetId, movieTitle, interactions, onRateReviewPress }: LatestCommentsProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const { movieId } = useLocalSearchParams<{ movieId?: string }>();

    const handleSeeAllPress = () => {
        const effectiveId = targetId || movieId;
        if (effectiveId) {
            router.push({
                pathname: "/comments/[type]/[id]",
                params: { type: "movie", id: effectiveId, title: movieTitle },
            } as any);
        }
    };

    const commentInteractions = interactions.filter((item) => !!item.comment?.content);

    if (commentInteractions.length === 0) {
        return (
            <View style={styles.emptyContainer} testID="movies-empty-reviews">
                <Ionicons name="chatbubble-ellipses-outline" size={32} color={Colors.textMuted} style={styles.emptyIcon} />
                <Text style={styles.emptyText}>
                    {t("movies.detail.emptyReviewsText")}
                </Text>
                {onRateReviewPress && (
                    <TouchableOpacity
                        style={styles.rateButton}
                        onPress={onRateReviewPress}
                        activeOpacity={0.8}
                        testID="movies-rate-review-button">
                        <Ionicons name="star" size={16} color="#FFCC00" />
                        <Text style={styles.rateButtonText}>{t("movies.detail.rateAndReview")}</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{t("movies.detail.latestComments")}</Text>
                <TouchableOpacity onPress={handleSeeAllPress} activeOpacity={0.7} testID="movies-see-all-button">
                    <Text style={styles.seeAll}>{t("movies.detail.seeAll")}</Text>
                </TouchableOpacity>
            </View>

            {commentInteractions.map((item) => (
                <View key={item.id} style={styles.commentItem}>
                    <InteractionView data={item} />
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 10,
        paddingTop: 14,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    title: {
        color: Colors.textPrimary,
        fontSize: 16,
        fontWeight: "700",
    },
    seeAll: {
        color: Colors.primary,
        fontSize: 13,
        fontWeight: "600",
    },
    commentItem: {
        marginBottom: 8,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 28,
        paddingHorizontal: 24,
        marginHorizontal: 16,
        marginTop: 14,
        backgroundColor: Colors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    emptyIcon: {
        marginBottom: 10,
        opacity: 0.8,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 16,
    },
    rateButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "rgba(255, 204, 0, 0.12)",
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(255, 204, 0, 0.3)",
    },
    rateButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#FFCC00",
    },
});
