import { SpotifyId, TrackId } from "@/types/common.types";
import { client } from "../api/client";
import {
    InteractionsRequest,
    InteractionsResponse,
    UpsertInteractionRequest,
    UpsertInteractionResponse,
} from "@/types/interaction.types";
import { TrackDetailsResponse, TrackLikeActionsResponse, FavoriteTracksResponse } from "@/types/track.types";
import { ApiResponse } from "@/types/api";

const TrackService = {
    getFavoriteTracks: async (page = 1, limit = 3): Promise<FavoriteTracksResponse> => {
        return await client.get<FavoriteTracksResponse>(`/v1/tracks/favorites`, {
            auth: true,
            params: { page, limit },
        });
    },
    getTrackDetails: async (trackId: TrackId): Promise<TrackDetailsResponse> => {
        return await client.get<TrackDetailsResponse>(`/v1/tracks/${trackId}`, { auth: true });
    },

    likeTrack: async (trackId: TrackId): Promise<TrackLikeActionsResponse> => {
        return await client.post<TrackLikeActionsResponse>(`/v1/tracks/${trackId}/like`, {}, { auth: true });
    },

    unlikeTrack: async (trackId: TrackId): Promise<TrackLikeActionsResponse> => {
        return await client.delete<TrackLikeActionsResponse>(`/v1/tracks/${trackId}/like`, { auth: true });
    },

    addToFavorites: async (data: {
        trackId?: TrackId;
        spotifyId?: string;
        replaceTrackId?: TrackId;
    }): Promise<ApiResponse> => {
        return await client.post<ApiResponse>(`/v1/tracks/favorites`, data, { auth: true });
    },

    removeFromFavorites: async (trackId: TrackId): Promise<ApiResponse> => {
        return await client.delete<ApiResponse>(`/v1/tracks/${trackId}/favorites`, { auth: true });
    },

    getTrackInteractions: async (data: InteractionsRequest): Promise<InteractionsResponse> => {
        const { targetId, page = 1, limit = 18 } = data;
        return await client.get<InteractionsResponse>(`/v1/tracks/${targetId}/interactions`, {
            auth: true,
            params: { page, limit },
        });
    },

    createOrUpdateInteraction: async (data: UpsertInteractionRequest): Promise<UpsertInteractionResponse> => {
        return await client.post<UpsertInteractionResponse>(
            `/v1/tracks/${data.targetId}/interactions`,
            data.interaction,
            { auth: true },
        );
    },

    findOrFetchSpotifyTrack: async (spotifyId: SpotifyId): Promise<TrackDetailsResponse> => {
        return await client.get<TrackDetailsResponse>(`/v1/tracks/by-spotify/${spotifyId}`, { auth: true });
    },
};

export { TrackService };
