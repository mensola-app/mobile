import { useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import DynamicList from "@/components/DynamicList";
import MusicCard from "@/components/MusicCard";
import InteractionView, { InteractionSheet } from "@/components/Interaction";
import AlbumHero from "./AlbumHero";
import AlbumDetailSkeleton from "./AlbumDetailSkeleton";
import { styles } from "./styles";
import { IAlbumDetailViewProps } from "./types";
import { ITrack } from "@/types/track.types";
import { InteractionItemResponse, UpsertInteractionRequest, UpsertInteractionSummary } from "@/types/interaction.types";
import { AlbumId } from "@/types/common.types";

export default function AlbumDetailView({
    albumDetails,
    tracks,
    loadMoreTracks,
    hasNextTrackPage,
    isFetchingNextTrackPage,
    interactions,
    submitInteraction,
    loadMoreInteractions,
    hasNextInteractionsPage,
    isFetchingNextInteractionPage,
    isLoading,
    isRefetching,
    error,
    refetchAll,
    toggleLike,
}: IAlbumDetailViewProps) {
    const router = useRouter();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<"tracks" | "comments">("tracks");
    const [isInteractionSheetOpen, setIsInteractionSheetOpen] = useState<boolean>(false);

    const renderTrackItem = ({ item }: { item: ITrack }) => {
        const trackIdentifier = item.spotifyId || item.id;
        const typeQuery = item.spotifyId ? "?type=spotify" : "?type=app";

        return (
            <MusicCard
                type="track"
                data={item}
                style={{ width: "31%" }}
                onPress={() => router.push(`/tracks/${trackIdentifier}${typeQuery}` as any)}
            />
        );
    };

    const renderCommentItem = ({ item }: { item: InteractionItemResponse }) => {
        return (
            <View style={{ paddingHorizontal: 16 }}>
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
                        likesCount: item.likesCount || 0,
                        replyCount: item.replyCount || 0,
                    }}
                />
            </View>
        );
    };

    const renderFooter = () => {
        if (!isFetchingNextInteractionPage || !isFetchingNextTrackPage || !isLoading) return null;
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#1DB954" />
            </View>
        );
    };

    const handleLoadMore = () => {
        if (activeTab === "tracks") {
            if (!isFetchingNextTrackPage && hasNextTrackPage) loadMoreTracks();
        } else if (activeTab === "comments") {
            if (!isFetchingNextInteractionPage && hasNextInteractionsPage) loadMoreInteractions();
        }
    };

    if (isLoading) {
        return <AlbumDetailSkeleton />;
    }

    if (error && !albumDetails) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={refetchAll}>
                    <Text style={styles.retryText}>Tekrar Deneyin</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const isTracksTab = activeTab === "tracks";

    return (
        <View style={styles.container}>
            <DynamicList<ITrack | InteractionItemResponse>
                style={{ paddingHorizontal: 0 }}
                key={activeTab}
                data={isTracksTab ? (tracks as ITrack[]) : (interactions as InteractionItemResponse[])}
                variant="vertical"
                numColumns={isTracksTab ? 3 : 1}
                columnWrapperStyle={isTracksTab ? styles.rowWrapper : undefined}
                renderItem={isTracksTab ? (renderTrackItem as any) : (renderCommentItem as any)}
                ListHeaderComponent={
                    <>
                        <AlbumHero
                            albumDetails={albumDetails}
                            tracksCount={tracks.length}
                            commentsCount={interactions.length}
                            toggleLike={toggleLike}
                            onCommentPress={() => setIsInteractionSheetOpen(true)}
                        />
                        <View style={styles.tabContainer}>
                            <TouchableOpacity
                                style={[styles.tabButton, isTracksTab && styles.activeTabButton]}
                                onPress={() => setActiveTab("tracks")}
                                activeOpacity={0.7}>
                                <Ionicons name="disc-outline" size={18} color={isTracksTab ? "#1DB954" : "#8c8c8c"} />
                                <Text style={[styles.tabText, isTracksTab && styles.activeTabText]}>
                                    Şarkılar ({tracks.length})
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.tabButton, !isTracksTab && styles.activeTabButton]}
                                onPress={() => setActiveTab("comments")}
                                activeOpacity={0.7}>
                                <Ionicons
                                    name="chatbubble-ellipses-outline"
                                    size={18}
                                    color={!isTracksTab ? "#1DB954" : "#8c8c8c"}
                                />
                                <Text style={[styles.tabText, !isTracksTab && styles.activeTabText]}>
                                    Yorumlar ({interactions.length})
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </>
                }
                onRefresh={refetchAll}
                refreshing={isRefetching}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons
                            name={isTracksTab ? "disc-outline" : "chatbubble-ellipses-outline"}
                            size={isTracksTab ? 48 : 32}
                            color="#444"
                        />
                        <Text style={styles.emptyText}>
                            {isTracksTab
                                ? t("albums.detail.emptyTracksText", { defaultValue: "Bu albümde henüz şarkı bulunmuyor." })
                                : t("albums.detail.emptyReviewsText", { defaultValue: "No reviews yet. Be the first to share your thoughts on this album!" })}
                        </Text>
                        {!isTracksTab && (
                            <TouchableOpacity
                                style={styles.rateButton}
                                onPress={() => setIsInteractionSheetOpen(true)}
                                activeOpacity={0.8}
                                testID="albums-rate-review-button">
                                <Ionicons name="star" size={16} color="#FFCC00" />
                                <Text style={styles.rateButtonText}>{t("movies.detail.rateAndReview")}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
            />

            <InteractionSheet
                isVisible={isInteractionSheetOpen}
                onClose={() => setIsInteractionSheetOpen(false)}
                targetType="album"
                targetId={albumDetails?.id as AlbumId}
                mediaTitle={albumDetails?.title || t("common.album")}
                mediaTypeTitle={t("common.album")}
                mediaPoster={albumDetails?.image}
                initialRating={
                    albumDetails?.currentUserInteraction?.rating
                        ? Number(albumDetails.currentUserInteraction.rating)
                        : 0
                }
                initialComment={albumDetails?.currentUserInteraction?.comment?.content || ""}
                initialIsLiked={albumDetails?.currentUserInteraction?.isLiked ?? albumDetails?.isLiked ?? false}
                onSubmit={async (data: UpsertInteractionSummary) => {
                    await submitInteraction(data);
                }}
            />
        </View>
    );
}
