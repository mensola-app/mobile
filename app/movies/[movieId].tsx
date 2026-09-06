import { useEffect, useState } from "react";
import { StyleSheet, View, Alert } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";

import MovieDetailView from "@/components/Movies/MovieDetailView";
import { useMovie } from "@/hooks/movie/useMovie";
import { useFavoriteMovies } from "@/hooks/movie/useFavoriteMovies";
import { MovieId, TmdbId } from "@/types/common.types";
import { Colors } from "@/constants/colors";
import ReplaceFavoriteBottomSheet from "@/components/ReplaceFavoriteBottomSheet";

export default function MoviePage() {
    const { t } = useTranslation();
    const { movieId, type } = useLocalSearchParams<{
        movieId: string;
        type?: "tmdb" | "app";
    }>();

    const parsedMovieId = type === "tmdb" ? (Number(movieId) as TmdbId) : (movieId as MovieId);

    const { movie, isLoading, isRefreshing, error, refetch } = useMovie(parsedMovieId, type ?? "app");
    const { addFavorite, removeFavorite, isLoading: isFavoriteLoading } = useFavoriteMovies();

    const [isFavorite, setIsFavorite] = useState(false);
    const [isReplaceSheetVisible, setIsReplaceSheetVisible] = useState(false);

    useEffect(() => {
        if (movie?.isFavorite !== undefined) {
            setIsFavorite(movie.isFavorite);
        }
    }, [movie?.isFavorite]);

    const handleToggleFavorite = async () => {
        if (!movie?.id) return;

        const previousState = isFavorite;
        setIsFavorite(!previousState);

        try {
            if (previousState) {
                await removeFavorite(movie.id);
            } else {
                await addFavorite(movie.id);
            }
        } catch (error: any) {
            if (error?.error?.code === "MAX_FAVORITES_FILM_REACHED") {
                setIsReplaceSheetVisible(true);
            } else {
                const apiMessage =
                    error?.error?.message || error?.message || t("search.history.movieAddedError");
                Alert.alert(t("common.error"), apiMessage);
            }
            setIsFavorite(previousState);
        }
    };

    return (
        <>
            <Stack.Screen
                options={
                    {
                        headerTransparent: true,
                        title: movie?.title,
                        headerRightActions: [
                            {
                                id: "add-favorite",
                                icon: "sparkles",
                                size: 22,
                                color: isFavorite ? "#FFD700" : Colors.textMuted,
                                onPress: handleToggleFavorite,
                            },
                        ],
                    } as any
                }
            />
            <View style={styles.container}>
                <MovieDetailView
                    movie={movie}
                    isLoading={isLoading}
                    isRefreshing={isRefreshing}
                    error={error}
                    refetch={refetch}
                />
            </View>
            {movie?.id && (
                <ReplaceFavoriteBottomSheet
                    isVisible={isReplaceSheetVisible}
                    onClose={() => setIsReplaceSheetVisible(false)}
                    type="movie"
                    newItemId={movie.id}
                    onSuccess={() => {
                        setIsFavorite(true);
                    }}
                />
            )}
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
});
