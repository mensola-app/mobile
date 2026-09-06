import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { MovieService } from "@/services/movie.service";
import { TrackService } from "@/services/track.service";
import { AlbumService } from "@/services/album.service";
import { PlaylistService } from "@/services/playlist.service";
import {
    InteractionItemResponse,
    InteractionsRequest,
    InteractionsResponse,
} from "@/types/interaction.types";

export type EntityType = "movie" | "track" | "album" | "playlist" | "movieList" | string;

export const getEntityInteractionFetcher = (
    type?: string,
): ((data: InteractionsRequest) => Promise<InteractionsResponse>) | null => {
    if (!type) return null;
    const normalized = type.toLowerCase();
    switch (normalized) {
        case "movie":
        case "movies":
            return MovieService.getMovieInteractions;
        case "track":
        case "tracks":
            return TrackService.getTrackInteractions;
        case "album":
        case "albums":
            return AlbumService.getAlbumInteractions;
        case "playlist":
        case "playlists":
            return PlaylistService.getPlaylistInteractions;
        case "movielist":
        case "movie-list":
        case "movie_list":
            return MovieService.getMovieListInteractions;
        default:
            return null;
    }
};

interface UseEntityInteractionsOptions {
    limit?: number;
}

export const useEntityInteractions = (
    type?: string,
    id?: string,
    options?: UseEntityInteractionsOptions,
) => {
    const limit = options?.limit ?? 18;
    const fetcher = getEntityInteractionFetcher(type);

    const {
        data,
        fetchNextPage,
        refetch,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isRefetching,
        isError,
        error,
    } = useInfiniteQuery({
        queryKey: ["entity-interactions", type?.toLowerCase(), id],
        queryFn: async ({ pageParam = 1 }) => {
            if (!id || !fetcher) {
                return { items: [], page: 1, limit, hasMore: false };
            }
            const response = await fetcher({
                targetId: id as any,
                page: pageParam,
                limit,
            });
            return response.data ?? { items: [], page: pageParam, limit, hasMore: false };
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            if (!lastPage || !lastPage.hasMore) {
                return undefined;
            }
            return (lastPage.page || 1) + 1;
        },
        enabled: Boolean(id && fetcher),
    });

    const interactions: InteractionItemResponse[] = useMemo(() => {
        if (!data?.pages) return [];
        return data.pages.flatMap((page) => page.items || []);
    }, [data]);

    return {
        interactions,
        isLoading,
        isFetchingNextPage,
        hasNextPage: Boolean(hasNextPage),
        isRefetching,
        isError,
        error,
        fetchNextPage,
        refetch,
    };
};
