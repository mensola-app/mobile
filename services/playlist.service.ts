import {
    InteractionsRequest,
    InteractionsResponse,
    UpsertInteractionRequest,
    UpsertInteractionResponse,
} from "@/types/interaction.types";
import { client } from "../api/client";
import { PlaylistId, TrackId } from "@/types/common.types";
import {
    AddToPlaylistResponse,
    GetPlaylistsRequest,
    GetPlaylistsResponse,
    PlaylistDetailsResponse,
    PlaylistItemsRequest,
    PlaylistItemsResponse,
    PlaylistLikeActionsResponse,
} from "@/types/playlist.types";
import { ApiResponse } from "@/types/api";

const PlaylistService = {
    getPlaylistDetails: async (playlistId: PlaylistId): Promise<PlaylistDetailsResponse> => {
        return client.get<PlaylistDetailsResponse>(`/v1/playlists/${playlistId}`, { auth: true });
    },

    getPlaylistItems: async (data: PlaylistItemsRequest): Promise<PlaylistItemsResponse> => {
        const { playlistId, page, limit } = data;
        return client.get<PlaylistItemsResponse>(`/v1/playlists/${playlistId}/items`, {
            auth: true,
            params: { page, limit },
        });
    },

    getPlaylistInteractions: async (data: InteractionsRequest): Promise<InteractionsResponse> => {
        const { targetId, page, limit } = data;
        return client.get<InteractionsResponse>(`/v1/playlists/${targetId}/interactions`, {
            auth: true,
            params: { page, limit },
        });
    },

    likePlaylist: async (playlistId: PlaylistId): Promise<PlaylistLikeActionsResponse> => {
        return client.post<PlaylistLikeActionsResponse>(`/v1/playlists/${playlistId}/like`, {}, { auth: true });
    },

    unlikePlaylist: async (playlistId: PlaylistId): Promise<PlaylistLikeActionsResponse> => {
        return client.delete<PlaylistLikeActionsResponse>(`/v1/playlists/${playlistId}/like`, { auth: true });
    },

    createOrUpdateInteraction: async (data: UpsertInteractionRequest): Promise<UpsertInteractionResponse> => {
        return client.post<UpsertInteractionResponse>(`/v1/playlists/${data.targetId}/interactions`, data.interaction, {
            auth: true,
        });
    },

    getUserPlaylists: async (data: GetPlaylistsRequest): Promise<GetPlaylistsResponse> => {
        const { trackId, page, limit } = data;
        return client.get<GetPlaylistsResponse>(`/v1/playlists`, { auth: true, params: { trackId, page, limit } });
    },

    addTrackToPlaylist: async (playlistId: PlaylistId, trackId: TrackId): Promise<AddToPlaylistResponse> => {
        return client.post<AddToPlaylistResponse>(`/v1/playlists/${playlistId}/items/${trackId}`, {}, { auth: true });
    },

    removeTrackFromPlaylist: async (playlistId: PlaylistId, trackId: TrackId): Promise<ApiResponse> => {
        return client.delete<ApiResponse>(`/v1/playlists/${playlistId}/items/${trackId}`, { auth: true });
    },

    createPlaylist: async (data: {
        title: string;
        description?: string;
        image?: string | null;
        isPrivate?: boolean;
    }): Promise<ApiResponse> => {
        return client.post<ApiResponse>(`/v1/playlists`, data, { auth: true });
    },

    updatePlaylist: async (
        playlistId: PlaylistId,
        data: {
            title?: string;
            description?: string | null;
            image?: string | null;
            isPrivate?: boolean;
        },
    ): Promise<ApiResponse> => {
        return client.patch<ApiResponse>(`/v1/playlists/${playlistId}`, data, { auth: true });
    },

    deletePlaylist: async (playlistId: PlaylistId): Promise<ApiResponse> => {
        return client.delete<ApiResponse>(`/v1/playlists/${playlistId}`, { auth: true });
    },
};

export { PlaylistService };
