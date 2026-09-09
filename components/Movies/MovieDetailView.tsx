import { useState, useEffect } from "react";
import { ScrollView, RefreshControl, View, StyleSheet } from "react-native";
import MovieHero from "./MovieHero";
import MovieOverview from "./MovieOverview";
import LatestComments from "./LatestComments";
import { MovieDetailViewProps } from "./types";
import { Colors } from "@/constants/colors";
import WatchedToast from "./WatchedToast";
import WatchedMovieBottomSheet from "./WatchedMovieBottomSheet";
import { WatchedMovie } from "@/types/movie.types";
import { WatchedMovieId } from "@/types/common.types";

export default function MovieDetailView({
    movie,
    isLoading,
    isRefreshing,
    error,
    refetch,
}: MovieDetailViewProps) {
    const [isInteractionSheetOpen, setIsInteractionSheetOpen] = useState<boolean>(false);
    const [localRefreshing, setLocalRefreshing] = useState<boolean>(false);

    // Watched states hoisted to render outside ScrollView
    const [isWatchedSheetOpen, setIsWatchedSheetOpen] = useState<boolean>(false);
    const [showWatchedToast, setShowWatchedToast] = useState<boolean>(false);
    const [isWatched, setIsWatched] = useState<boolean>(movie?.isWatched ?? false);

    useEffect(() => {
        if (movie?.isWatched !== undefined) {
            setIsWatched(movie.isWatched);
        }
    }, [movie?.isWatched]);

    const handleRefresh = async () => {
        if (!refetch) return;
        setLocalRefreshing(true);
        try {
            await refetch();
        } finally {
            setLocalRefreshing(false);
        }
    };

    const isRefreshActive = isRefreshing ?? localRefreshing;

    const handleWatchedSheetAdd = (record: WatchedMovie) => {
        setIsWatched(true);
    };

    const handleWatchedSheetDelete = (watchedMovieId: WatchedMovieId, remainingCount: number) => {
        if (remainingCount === 0) {
            setIsWatched(false);
            setIsWatchedSheetOpen(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24 }}
                refreshControl={
                    refetch ? (
                        <RefreshControl
                            refreshing={isRefreshActive}
                            onRefresh={handleRefresh}
                            tintColor={Colors.primary}
                            colors={[Colors.primary]}
                        />
                    ) : undefined
                }
            >
                <MovieHero
                    movie={movie}
                    isLoading={isLoading}
                    error={error}
                    isInteractionSheetOpen={isInteractionSheetOpen}
                    onInteractionSheetOpenChange={setIsInteractionSheetOpen}
                    isWatched={isWatched}
                    setIsWatched={setIsWatched}
                    onShowWatchedToast={() => setShowWatchedToast(true)}
                    onOpenWatchedSheet={() => setIsWatchedSheetOpen(true)}
                />
                <MovieOverview movie={movie} />
                <LatestComments
                    targetId={movie?.id}
                    movieTitle={movie?.title}
                    interactions={movie?.interactions ?? []}
                    onRateReviewPress={() => setIsInteractionSheetOpen(true)}
                />
            </ScrollView>

            {/* Watched History Bottom Sheet - izlediyse geçmişi göster */}
            {movie?.id && (
                <WatchedMovieBottomSheet
                    isVisible={isWatchedSheetOpen}
                    onClose={() => setIsWatchedSheetOpen(false)}
                    movieId={movie.id}
                    movieTitle={movie?.title}
                    onAdded={handleWatchedSheetAdd}
                    onDeleted={handleWatchedSheetDelete}
                />
            )}

            {/* Toast - sayfanın en altında sabit durur */}
            <WatchedToast
                visible={showWatchedToast}
                onEdit={() => {
                    setShowWatchedToast(false);
                    setIsWatchedSheetOpen(true);
                }}
                onHide={() => setShowWatchedToast(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});