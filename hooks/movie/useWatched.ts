import { useState } from "react";

import { MovieService } from "@/services/movie.service";
import { MovieId } from "@/types/common.types";
import { WatchedMovie } from "@/types/movie.types";
import { WatchedMovieId } from "@/types/common.types";

const useWatched = (defaultMovieId?: MovieId) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const markAsWatched = async (
        targetMovieId?: MovieId | (() => void),
        onSuccess?: (record: WatchedMovie) => void,
        watchedAt?: string | null,
    ) => {
        let id = defaultMovieId;
        let callback = onSuccess;

        if (typeof targetMovieId === "function") {
            callback = targetMovieId as any;
        } else if (typeof targetMovieId === "string") {
            id = targetMovieId;
        }

        if (!id) return;

        setIsLoading(true);
        setError("");

        try {
            const response = await MovieService.markAsWatched(id, watchedAt);
            callback?.(response.data as WatchedMovie);
            return response;
        } catch (err: any) {
            if (err && err.success === false) {
                const apiErrorMessage = err.error?.message || err?.message;
                setError(apiErrorMessage || "Film izlendi olarak işaretlenirken bir hata oluştu.");
            } else {
                setError("Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edip tekrar deneyiniz.");
            }
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const unmarkAsWatched = async (targetMovieId?: MovieId | (() => void), onSuccess?: () => void) => {
        let id = defaultMovieId;
        let callback = onSuccess;

        if (typeof targetMovieId === "function") {
            callback = targetMovieId;
        } else if (typeof targetMovieId === "string") {
            id = targetMovieId;
        }

        if (!id) return;

        setIsLoading(true);
        setError("");

        try {
            const response = await MovieService.unmarkAsWatched(id);
            callback?.();
            return response;
        } catch (err: any) {
            if (err && err.success === false) {
                const apiErrorMessage = err.error?.message || err?.message;
                setError(apiErrorMessage || "Film izlenenlerden kaldırılırken bir hata oluştu.");
            } else {
                setError("Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edip tekrar deneyiniz.");
            }
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updateWatchedAt = async (watchedMovieId: WatchedMovieId, watchedAt: string, onSuccess?: () => void) => {
        setIsLoading(true);
        setError("");

        try {
            const response = await MovieService.updateWatchedAt(watchedMovieId, watchedAt);
            onSuccess?.();
            return response;
        } catch (err: any) {
            if (err && err.success === false) {
                const apiErrorMessage = err.error?.message || err?.message;
                setError(apiErrorMessage || "İzleme tarihi güncellenirken bir hata oluştu.");
            } else {
                setError("Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edip tekrar deneyiniz.");
            }
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteWatchedEntry = async (watchedMovieId: WatchedMovieId, onSuccess?: () => void) => {
        setIsLoading(true);
        setError("");

        try {
            const response = await MovieService.deleteWatchedEntry(watchedMovieId);
            onSuccess?.();
            return response;
        } catch (err: any) {
            if (err && err.success === false) {
                const apiErrorMessage = err.error?.message || err?.message;
                setError(apiErrorMessage || "İzleme kaydı silinirken bir hata oluştu.");
            } else {
                setError("Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edip tekrar deneyiniz.");
            }
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const getWatchedHistoryByMovieId = async (movieId: MovieId) => {
        setIsLoading(true);
        setError("");

        try {
            const response = await MovieService.getWatchedHistoryByMovieId(movieId);
            return response.data ?? [];
        } catch (err: any) {
            console.error("fetchHistory error:", err);
            if (err && err.success === false) {
                const apiErrorMessage = err.error?.message || err?.message;
                setError(apiErrorMessage || "İzleme geçmişi alınırken bir hata oluştu.");
            } else {
                setError("Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edip tekrar deneyiniz.");
            }
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    return {
        markAsWatched,
        unmarkAsWatched,
        updateWatchedAt,
        deleteWatchedEntry,
        getWatchedHistoryByMovieId,
        isLoading,
        error,
    };
};

export { useWatched };
