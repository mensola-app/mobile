import { useCallback } from "react";
import { TrackService } from "@/services/track.service";
import { useDetailBase } from "../shared/useDetailBase";
import { useInteracion } from "../shared/useInteraction";
import { SpotifyId, TrackId } from "@/types/common.types";
import { TrackDetails } from "@/types/track.types";

export const useTrackDetails = (trackId?: TrackId | SpotifyId, type: "app" | "spotify" = "app") => {
    const {
        details: trackDetails,
        setDetails,
        fetchData,
        ...rest
    } = useDetailBase<TrackDetails, TrackId | SpotifyId>({
        id: trackId,
        fetcher: (id) => {
            if (type === "spotify") {
                return TrackService.findOrFetchSpotifyTrack(id as SpotifyId);
            }
            return TrackService.getTrackDetails(id as TrackId);
        },
        onLike: (id) => TrackService.likeTrack(id as TrackId),
        onUnlike: (id) => TrackService.unlikeTrack(id as TrackId),
        getIsLiked: (d) => !!d.isLiked,
        getLikesCount: (d) => d.likesCount ?? 0,
        updateLike: (d, isLiked, count) => ({ ...d, isLiked, likesCount: count }),
    });

    const refetchAll = useCallback(async () => {
        await Promise.all([fetchData(true)]);
    }, [fetchData]);

    const dbTrackId = trackDetails?.id;
    const { submitInteraction } = useInteracion({
        targetId: dbTrackId,
        createOrUpdateInteraction: async (data) => {
            await TrackService.createOrUpdateInteraction(data);
        },
        refreshFn: refetchAll,
    });

    return { trackDetails, submitInteraction, refetchAll, ...rest };
};
