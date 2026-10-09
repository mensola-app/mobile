import { useCallback } from "react";
import { PlaylistService } from "@/services/playlist.service";
import { useInteracion } from "../shared/useInteraction";
import { useDetailBase } from "../shared/useDetailBase";
import { useListItems } from "../shared/useListItems";
import { useBookmark } from "../shared/useBookmark";
import { PlaylistDetails, PlaylistItemsResponseDataItem } from "@/types/playlist.types";
import { PlaylistId } from "@/types/common.types";

export const usePlaylistDetails = (playlistId?: PlaylistId) => {
    const {
        details: playlistDetails,
        setDetails,
        fetchData,
        ...rest
    } = useDetailBase<PlaylistDetails, PlaylistId>({
        id: playlistId,
        fetcher: (id) => PlaylistService.getPlaylistDetails(id),
        onLike: (id) => PlaylistService.likePlaylist(id),
        onUnlike: (id) => PlaylistService.unlikePlaylist(id),
        getIsLiked: (d) => !!d.isLiked,
        getLikesCount: (d) => d.likesCount ?? 0,
        updateLike: (d, isLiked, count) => ({ ...d, isLiked, likesCount: count }),
    });

    const { toggleSave } = useBookmark<PlaylistDetails>({
        targetId: playlistId,
        targetType: "playlist",
        targetDetails: playlistDetails || undefined,
        setTargetDetails: (newIsSaved, newSavesCount) =>
            setDetails((prev) =>
                prev
                    ? {
                          ...prev,
                          isSaved: newIsSaved,
                          savesCount: typeof newSavesCount === "number" ? newSavesCount : prev.savesCount,
                      }
                    : prev,
            ),
    });

    const {
        items: tracks,
        fetchNextPage: loadMoreTracks,
        refetch: refetchMovies,
        hasNextPage: hasNextTrackPage,
        isFetchingNextPage: isFetchingNextTrackPage,
    } = useListItems<PlaylistItemsResponseDataItem, PlaylistId>({
        listId: playlistId,
        itemType: "track",
        getFn: async (id, page, limit) => await PlaylistService.getPlaylistItems({ playlistId: id, page, limit }),
        limit: 18,
    });

    const {
        submitInteraction,
        interactions,
        loadMoreInteractions,
        refetchInteractions,
        hasNextPage: hasNextInteractionsPage,
        isFetchingNextPage: isFetchingNextInteractionPage,
    } = useInteracion({
        targetId: playlistId,
        targetType: "playlist",
        createOrUpdateInteraction: async (data) => {
            await PlaylistService.createOrUpdateInteraction(data);
        },
        refreshFn: async (isRefreshing) => {
            await fetchData(isRefreshing);
        },
        getFn: async (data) => await PlaylistService.getPlaylistInteractions(data),
        limit: 20,
    });

    const refetchAll = useCallback(async () => {
        await Promise.all([fetchData(true), refetchInteractions(), refetchMovies()]);
    }, [fetchData, refetchInteractions, refetchMovies]);

    return {
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
        toggleSave,
        ...rest,
    };
};
