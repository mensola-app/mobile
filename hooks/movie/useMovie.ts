import { useState, useEffect, useCallback } from "react";

import { MovieService } from "../../services/movie.service";
import { MovieDetails } from "@/types/movie.types";
import { MovieId, TmdbId } from "@/types/common.types";

const useMovie = (movieId?: MovieId | TmdbId, type: "app" | "tmdb" = "app") => {
    const [movie, setMovie] = useState<MovieDetails | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const fetchMovie = useCallback(
        async (isRefresh = false) => {
            if (!movieId) {
                setMovie(null);
                setError("");
                return;
            }

            if (isRefresh) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }
            setError("");

            try {
                if (type === "tmdb") {
                    const response = await MovieService.findOrFetchMovie(movieId as TmdbId);
                    setMovie(response.data || null);
                } else {
                    const response = await MovieService.getMovie(movieId as MovieId);
                    setMovie(response.data || null);
                }
            } catch (fetchError: any) {
                if (fetchError && fetchError.success === false) {
                    const apiErrorMessage = fetchError.error?.message || fetchError?.message;
                    setError(apiErrorMessage || "Film bilgileri alınırken bir hata oluştu.");
                } else {
                    setError("Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.");
                }
            } finally {
                setIsLoading(false);
                setIsRefreshing(false);
            }
        },
        [movieId, type],
    );

    useEffect(() => {
        fetchMovie();
    }, [fetchMovie]);

    const refetch = useCallback(async () => {
        await fetchMovie(true);
    }, [fetchMovie]);

    return { movie, isLoading, isRefreshing, error, refetch, setMovie };
};

export { useMovie };
