import { useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import DynamicList from "@/components/DynamicList";
import MusicCard from "@/components/MusicCard";
import InteractionView, { InteractionSheet } from "@/components/Interaction";
import PlaylistHero from "./PlaylistHero";
import { styles } from "./styles";
import { IPlaylistDetailViewProps } from "./types";
import { ITrack } from "@/types/track.types";
import { InteractionItemResponse } from "@/types/interaction.types";
import { PlaylistId } from "@/types/common.types";
import { Colors } from "@/constants/colors";

export default function PlaylistDetailView({
    refetchAll,
    playlistDetails,
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
    toggleLike,
}: IPlaylistDetailViewProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"tracks" | "comments">("tracks");
    const [isInteractionSheetOpen, setIsInteractionSheetOpen] = useState<boolean>(false);

    const renderTrackItem = ({ item }: { item: ITrack }) => {
        return (
            <MusicCard
                type="track"
                data={item}
                style={{ width: "31%" }}
                onPress={() => router.push(`/tracks/${item.id}` as any)}
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
                <ActivityIndicator size="small" color={Colors.primary} />
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
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (error && !playlistDetails) {
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
            <DynamicList
                style={{ paddingHorizontal: 0 }}
                key={activeTab}
                data={isTracksTab ? (tracks as any[]) : (interactions as any[])}
                variant="vertical"
                numColumns={isTracksTab ? 3 : 1}
                columnWrapperStyle={isTracksTab ? styles.rowWrapper : undefined}
                renderItem={isTracksTab ? (renderTrackItem as any) : (renderCommentItem as any)}
                ListHeaderComponent={
                    <>
                        <PlaylistHero
                            playlistDetails={playlistDetails}
                            tracksCount={tracks.length}
                            tracks={tracks}
                            commentsCount={interactions.length}
                            toggleLike={toggleLike}
                            onCommentPress={() => setIsInteractionSheetOpen(true)}
                        />
                        <View style={styles.tabContainer}>
                            <TouchableOpacity
                                style={[styles.tabButton, isTracksTab && styles.activeTabButton]}
                                onPress={() => setActiveTab("tracks")}
                                activeOpacity={0.7}>
                                <Ionicons
                                    name="musical-note-outline"
                                    size={18}
                                    color={isTracksTab ? "#1DB954" : "#8c8c8c"}
                                />
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
                            name={isTracksTab ? "musical-note-outline" : "chatbubble-ellipses-outline"}
                            size={48}
                            color="#444"
                        />
                        <Text style={styles.emptyText}>
                            {isTracksTab
                                ? "Bu playlist'te henüz şarkı bulunmuyor."
                                : "Bu playlist'e henüz yorum yapılmamış."}
                        </Text>
                    </View>
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
            />

            <InteractionSheet
                isVisible={isInteractionSheetOpen}
                onClose={() => setIsInteractionSheetOpen(false)}
                targetType="playlist"
                targetId={playlistDetails?.id as PlaylistId}
                mediaTitle={playlistDetails?.title || "Playlist"}
                mediaTypeTitle="Playlist"
                mediaPoster={playlistDetails?.image}
                initialRating={
                    playlistDetails?.currentUserInteraction?.rating
                        ? Number(playlistDetails.currentUserInteraction.rating)
                        : 0
                }
                initialComment={playlistDetails?.currentUserInteraction?.comment?.content || ""}
                initialIsLiked={playlistDetails?.currentUserInteraction?.isLiked ?? playlistDetails?.isLiked ?? false}
                onSubmit={async ({ rating, comment, isLiked }) => {
                    await submitInteraction({ rating, comment, isLiked });
                }}
            />
        </View>
    );
}
