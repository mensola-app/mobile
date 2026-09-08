import { useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import DynamicList from "@/components/DynamicList";
import MovieCard from "@/components/MovieCard";
import InteractionView, { InteractionSheet } from "@/components/Interaction";
import MovieListHero from "./MovieListHero";
import { styles } from "./styles";
import { IMovieListDetailViewProps } from "./types";
import { MovieSummaryViaInteraction } from "@/types/movie.types";
import { InteractionItemResponse } from "@/types/interaction.types";
import { MovieListId } from "@/types/common.types";

export default function MovieListDetailView({
    listDetails,
    movies,
    loadMoreMovies,
    hasNextMoviePage,
    isFetchingNextMoviePage,
    interactions,
    loadMoreInteractions,
    hasNextInteractionsPage,
    isFetchingNextInteractionPage,
    isLoading,
    isRefetching,
    error,
    refetchAll,
    toggleLike,
    toggleSave,
    submitInteraction,
}: IMovieListDetailViewProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"movies" | "comments">("movies");
    const [isInteractionSheetOpen, setIsInteractionSheetOpen] = useState<boolean>(false);

    const renderMovieItem = ({ item }: { item: MovieSummaryViaInteraction }) => {
        return (
            <MovieCard
                title={item.title}
                poster={item.poster}
                interactions={{
                    rating: item.rating,
                    isLiked: item.isLiked,
                    hasReview: item.hasReview,
                }}
                style={{ width: "31%" }}
                onPress={() => router.push(`/movies/${item.id}`)}
            />
        );
    };

    const renderCommentItem = ({ item }: { item: InteractionItemResponse }) => {
        return (
            <View style={{ paddingHorizontal: 16 }}>
                <InteractionView
                    data={{
                        id: item.id,
                        rating: item.rating,
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
        if (!isFetchingNextInteractionPage || !isFetchingNextMoviePage || !isLoading) return null;
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#1DB954" />
            </View>
        );
    };

    const handleLoadMore = () => {
        if (activeTab === "movies") {
            if (!isFetchingNextMoviePage && hasNextMoviePage) loadMoreMovies();
        } else if (activeTab === "comments") {
            if (!isFetchingNextInteractionPage && hasNextInteractionsPage) loadMoreInteractions();
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1DB954" />
            </View>
        );
    }

    if (error && !listDetails) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={refetchAll}>
                    <Text style={styles.retryText}>Tekrar Deneyin</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const isMoviesTab = activeTab === "movies";

    return (
        <View style={styles.container}>
            <DynamicList
                style={{ paddingHorizontal: 0 }}
                key={activeTab}
                data={isMoviesTab ? (movies as any[]) : (interactions as any[])}
                variant="vertical"
                numColumns={isMoviesTab ? 3 : 1}
                columnWrapperStyle={isMoviesTab ? styles.rowWrapper : undefined}
                renderItem={isMoviesTab ? (renderMovieItem as any) : (renderCommentItem as any)}
                ListHeaderComponent={
                    <>
                        <MovieListHero
                            listDetails={listDetails}
                            moviesCount={movies.length}
                            movies={movies}
                            commentsCount={interactions.length}
                            toggleLike={toggleLike}
                            toggleSave={toggleSave}
                            onCommentPress={() => setIsInteractionSheetOpen(true)}
                        />
                        <View style={styles.tabContainer}>
                            <TouchableOpacity
                                style={[styles.tabButton, isMoviesTab && styles.activeTabButton]}
                                onPress={() => setActiveTab("movies")}
                                activeOpacity={0.7}>
                                <Ionicons name="film-outline" size={18} color={isMoviesTab ? "#1DB954" : "#8c8c8c"} />
                                <Text style={[styles.tabText, isMoviesTab && styles.activeTabText]}>
                                    Filmler ({movies.length})
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.tabButton, !isMoviesTab && styles.activeTabButton]}
                                onPress={() => setActiveTab("comments")}
                                activeOpacity={0.7}>
                                <Ionicons
                                    name="chatbubble-ellipses-outline"
                                    size={18}
                                    color={!isMoviesTab ? "#1DB954" : "#8c8c8c"}
                                />
                                <Text style={[styles.tabText, !isMoviesTab && styles.activeTabText]}>
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
                            name={isMoviesTab ? "film-outline" : "chatbubble-ellipses-outline"}
                            size={48}
                            color="#444"
                        />
                        <Text style={styles.emptyText}>
                            {isMoviesTab ? "Bu listede henüz film bulunmuyor." : "Bu listeye henüz yorum yapılmamış."}
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
                targetType="movieList"
                targetId={listDetails?.id as MovieListId}
                mediaTitle={listDetails?.title || "Film Listesi"}
                mediaTypeTitle="Film Listesi"
                mediaPoster={listDetails?.image}
                initialRating={listDetails?.currentUserInteraction?.rating || 0}
                initialComment={listDetails?.currentUserInteraction?.comment?.content || ""}
                initialIsLiked={listDetails?.isLiked || false}
                onSubmit={async ({ rating, comment, isLiked }) => {
                    await submitInteraction({ rating, comment, isLiked });
                }}
            />
        </View>
    );
}
