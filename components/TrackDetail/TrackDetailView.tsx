import { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView, RefreshControl } from "react-native";

import { InteractionSheet } from "@/components/Interaction";
import TrackHero from "./TrackHero";
import LatestComments from "./LatestComments";
import AddToPlaylistBottomSheet from "./AddToPlaylistBottomSheet";
import { styles } from "./styles";
import { ITrackDetailViewProps } from "./types";
import { TrackId } from "@/types/common.types";
import { Colors } from "@/constants/colors";
import { useTranslation } from "react-i18next";

export default function TrackDetailView({
    trackDetails,
    isLoading,
    error,
    refetchAll,
    toggleLike,
    submitInteraction,
}: ITrackDetailViewProps) {
    const { t } = useTranslation();
    const [isInteractionSheetOpen, setIsInteractionSheetOpen] = useState<boolean>(false);
    const [isAddToPlaylistSheetOpen, setIsAddToPlaylistSheetOpen] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [commentsCount, setCommentsCount] = useState<number>(trackDetails?.commentsCount || 0);
    const [userComment, setUserComment] = useState<string>(
        trackDetails?.currentUserInteraction?.comment?.content || "",
    );

    useEffect(() => {
        if (trackDetails?.commentsCount !== undefined) {
            setCommentsCount(trackDetails.commentsCount);
        }
    }, [trackDetails?.commentsCount]);

    useEffect(() => {
        if (trackDetails?.currentUserInteraction?.comment?.content !== undefined) {
            setUserComment(trackDetails.currentUserInteraction.comment.content);
        }
    }, [trackDetails?.currentUserInteraction?.comment?.content]);

    const onRefresh = async () => {
        if (!refetchAll) return;
        setRefreshing(true);
        try {
            await refetchAll();
        } finally {
            setRefreshing(false);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (error && !trackDetails) {
        console.log(error);
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={refetchAll}>
                    <Text style={styles.retryText}>{t("tracks.detail.retryText")}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    refetchAll ? (
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={Colors.primary}
                            colors={[Colors.primary]}
                        />
                    ) : undefined
                }
            >
                <TrackHero
                    trackDetails={trackDetails}
                    toggleLike={toggleLike}
                    onCommentPress={() => setIsInteractionSheetOpen(true)}
                    onPlayPress={() => console.log("Play pressed")}
                    onAddPress={() => setIsAddToPlaylistSheetOpen(true)}
                    commentsCount={commentsCount}
                />

                <LatestComments
                    interactions={trackDetails?.interactions ?? []}
                    commentsCount={commentsCount}
                    onRateReviewPress={() => setIsInteractionSheetOpen(true)}
                />
            </ScrollView>

            <InteractionSheet
                isVisible={isInteractionSheetOpen}
                onClose={() => setIsInteractionSheetOpen(false)}
                targetType="track"
                targetId={trackDetails?.id as TrackId}
                mediaTitle={trackDetails?.title || t("common.track")}
                mediaTypeTitle={t("common.track")}
                mediaPoster={trackDetails?.image}
                initialRating={
                    trackDetails?.currentUserInteraction?.rating
                        ? Number(trackDetails.currentUserInteraction.rating)
                        : 0
                }
                initialComment={userComment}
                initialIsLiked={trackDetails?.currentUserInteraction?.isLiked ?? trackDetails?.isLiked ?? false}
                onSubmit={async ({ rating, comment, isLiked }) => {
                    const hadExistingComment = typeof userComment === "string" && userComment.trim().length > 0;
                    const hasNewComment = typeof comment === "string" && comment.trim().length > 0;

                    if (hasNewComment && !hadExistingComment) {
                        setCommentsCount((prev) => prev + 1);
                    } else if (!hasNewComment && hadExistingComment) {
                        setCommentsCount((prev) => Math.max(0, prev - 1));
                    }

                    setUserComment(comment ?? "");

                    await submitInteraction({ rating, comment, isLiked });
                }}
            />

            <AddToPlaylistBottomSheet
                isVisible={isAddToPlaylistSheetOpen}
                onClose={() => setIsAddToPlaylistSheetOpen(false)}
                trackId={trackDetails?.id}
            />
        </View>
    );
}
