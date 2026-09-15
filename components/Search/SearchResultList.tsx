import { ActivityIndicator, Text, TouchableOpacity, View, Alert } from "react-native";
import DynamicList from "../DynamicList";
import { styles } from "./styles";
import MusicCard from "../MusicCard";
import { SpotifyTrackItem } from "@/types/spotify.types";
import MovieCard from "../MovieCard";
import { TmdbMovieItem } from "@/types/tmdb.types";
import { SearchResultListProps } from "./types";
import SearchUserRow from "./SearchUserRow";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Colors } from "@/constants/colors";
import { MovieService } from "@/services/movie.service";
import { TrackService } from "@/services/track.service";
import { TmdbId, SpotifyId } from "@/types/common.types";
import { useTranslation } from "react-i18next";
import SearchNoResults from "./SearchNoResults";
import SearchSkeleton from "./SearchSkeleton";

export default function SearchResultList({
    activeTab,
    results,
    fetchNextPage,
    isLoading,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    isError,
    error,
    addSearch,
}: SearchResultListProps) {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { t } = useTranslation();
    const isFavoriteMode = params.mode === "favorite";

    const handleSelectMovie = async (movie: TmdbMovieItem) => {
        addSearch({ type: "movie", data: movie });
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

    const handleSelectTrack = async (track: SpotifyTrackItem) => {
        addSearch({ type: "track", data: track });
        if (isFavoriteMode) {
            try {
                await TrackService.addToFavorites({ spotifyId: track.spotifyId as unknown as SpotifyId });
                Alert.alert(t("common.success"), t("search.history.trackAddedSuccess", { title: track.title }), [
                    { text: t("common.ok"), onPress: () => router.push("/me") },
                ]);
            } catch (err: any) {
                const apiErrorMessage =
                    err?.error?.message || err?.message || t("search.history.trackAddedError");
                Alert.alert(t("common.error"), apiErrorMessage);
            }
        } else {
            router.push(`/tracks/${track.spotifyId}?type=spotify`);
        }
    };

    const handleSelectUser = (user: any) => {
        addSearch({
            type: "user",
            data: { id: user.id, username: user.username, fullname: user.fullname, avatar: user.avatar },
        });
        router.push(`/users/${user.id}`);
    };

    const renderSearchResults = ({ item }: { item: any }) => {
        switch (activeTab) {
            case "movie":
                const movie = item as TmdbMovieItem;
                return (
                    <MovieCard
                        layout="horizontal"
                        ratingAverage={movie.rating}
                        title={movie.title}
                        poster={movie.poster}
                        releaseDate={movie.releaseDate}
                        genres={movie.genres}
                        onPress={() => handleSelectMovie(movie)}
                    />
                );
            case "track":
                const track = item as SpotifyTrackItem;
                return (
                    <MusicCard<SpotifyTrackItem>
                        layout="horizontal"
                        type="track"
                        data={track}
                        onPress={() => handleSelectTrack(track)}
                    />
                );
            case "user":
                const user = item as any;
                return (
                    <SearchUserRow
                        user={{
                            id: user.id,
                            username: user.username,
                            fullname: user.fullname,
                            avatar: user.avatar,
                        }}
                        onPress={() => handleSelectUser(user)}
                    />
                );
        }
    };

    const handleLoadMore = () => {
        if (isLoading || !hasNextPage || isFetchingNextPage) return null;
        fetchNextPage();
    };

    const renderFooter = () => {
        if (!isFetchingNextPage) return null;
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
            </View>
        );
    };

    if (isError) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error?.message}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={refetch}>
                    <Text style={styles.retryText}>{t("common.retry")}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (isLoading && !isFetchingNextPage) {
        return <SearchSkeleton variant={activeTab} />;
    }

    if (!isLoading && results.length === 0) {
        return <SearchNoResults onRefresh={refetch} refreshing={isLoading} />;
    }

    return (
        <View style={styles.resultsContainer}>
            <DynamicList
                variant="vertical"
                data={results}
                renderItem={renderSearchResults}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                style={{ paddingBottom: 100 }}
                refreshing={isLoading}
                onRefresh={() => refetch()}
                ListFooterComponent={renderFooter}
            />
        </View>
    );
}
