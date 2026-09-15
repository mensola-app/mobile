import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTrendingMovies } from "@/hooks/movie/useTrendingMovies";
import { useNewAlbums } from "@/hooks/album/useNewAlbums";
import DynamicList from "../DynamicList";
import MovieCard from "../MovieCard";
import MusicCard from "../MusicCard";
import { SearchEmptyStateProps } from "./types";
import { styles } from "./styles";
import { TmdbMovieItem } from "@/types/tmdb.types";
import { NewAlbumsItem } from "@/types/spotify.types";
import { Colors } from "@/constants/colors";
import { MovieService } from "@/services/movie.service";
import { TmdbId } from "@/types/common.types";
import { useTranslation } from "react-i18next";
import SearchEmptySkeleton from "./SearchEmptySkeleton";

export default function SearchEmptyState({ activeTab }: SearchEmptyStateProps) {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { t } = useTranslation();
    const isFavoriteMode = params.mode === "favorite";

    const isMoviesTab = activeTab === "movie";
    const isTrackTab = activeTab === "track";

    const movieQuery = useTrendingMovies({ enabled: isMoviesTab });
    const albumQuery = useNewAlbums({ limit: 9, enabled: isTrackTab });

    const currentQuery = isMoviesTab ? movieQuery : albumQuery;
    const { fetchNextPage, refetch, hasNextPage, isFetchingNextPage, isLoading, isError, error, totalResults } =
        currentQuery;

    const data = isMoviesTab ? movieQuery.movies : albumQuery.albums;
    const title = isMoviesTab ? `${t("search.emptyState.trendMovies")} (${totalResults}+)` : `${t("search.emptyState.newAlbums")} (${totalResults}+)`;

    const handleLoadMore = () => {
        if (isLoading || !hasNextPage || isFetchingNextPage) return;
        fetchNextPage();
    };

    const handleSelectMovie = async (movie: TmdbMovieItem) => {
        if (isFavoriteMode) {
            try {
                await MovieService.addToFavorites({ tmdbId: movie.tmdbId as TmdbId });
                Alert.alert(t("common.success"), t("search.history.movieAddedSuccess", { title: movie.title }), [
                    { text: t("common.ok"), onPress: () => router.push("/me") },
                ]);
            } catch (err: any) {
                const apiErrorMessage =
                    err?.error?.message || err?.message || t("search.history.movieAddedError");
                Alert.alert(t("common.error"), apiErrorMessage);
            }
        } else {
            router.push(`/movies/${movie.tmdbId}?type=tmdb`);
        }
    };

    const handleSelectAlbum = (album: NewAlbumsItem) => {
        router.push(`/albums/${album.spotifyId}`);
    };

    if (activeTab === "user") {
        return (
            <View style={[styles.errorContainer, { justifyContent: "center", flex: 1, alignItems: "center" }]}>
                <Text style={[styles.errorText, { color: Colors.textSecondary }]}>
                    {t("search.emptyState.userPrompt")}
                </Text>
            </View>
        );
    }

    if (isError) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error?.message}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
                    <Text style={styles.retryText}>{t("common.retry")}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // First load: data empty while fetching
    if (isLoading && data.length === 0) {
        return <SearchEmptySkeleton variant={isMoviesTab ? "movie" : "track"} />;
    }

    return (
        <DynamicList<TmdbMovieItem | NewAlbumsItem>
            data={data}
            title={title}
            renderItem={({ item }) =>
                isMoviesTab ? (
                    <MovieCard
                        title={(item as any).title}
                        poster={(item as any).poster}
                        interactions={{ rating: (item as any).rating }}
                        style={{ width: "31%" }}
                        onPress={() => handleSelectMovie(item as TmdbMovieItem)}
                    />
                ) : (
                    <MusicCard
                        type="album"
                        data={item}
                        style={{ width: "31%" }}
                        onPress={() => handleSelectAlbum(item as NewAlbumsItem)}
                    />
                )
            }
            variant="vertical"
            numColumns={3}
            columnWrapperStyle={styles.rowWrapper}
            onEndReached={handleLoadMore}
            refreshing={isLoading}
            onRefresh={() => refetch()}
            ListFooterComponent={
                isFetchingNextPage ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={Colors.primary} />
                    </View>
                ) : null
            }
            style={{ paddingBottom: 100 }}
        />
    );
}
