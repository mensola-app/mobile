import {
    AlbumDetailsResponse,
    AlbumLikeActionsResponse,
    AlbumTracksRequest,
    AlbumTracksResponse,
    LikedAlbumsRequest,
    LikedAlbumsResponse,
} from "@/types/album.types";
import { client } from "@/lib/http/client";
import {
    InteractionsRequest,
    InteractionsResponse,
    UpsertInteractionRequest,
    UpsertInteractionResponse,
} from "@/types/interaction.types";
import { AlbumId, SpotifyId } from "@/types/common.types";

const AlbumService = {
    getLikedAlbums: async (data: LikedAlbumsRequest): Promise<LikedAlbumsResponse> => {
        const { userId, page = 1, limit = 18 } = data;
        return client.get<LikedAlbumsResponse>(`/v1/albums/likes`, {
            auth: true,
            params: { userId, page, limit },
        });
    },

    getAlbumDetails: async (albumId: AlbumId): Promise<AlbumDetailsResponse> => {
        return client.get<AlbumDetailsResponse>(`/v1/albums/${albumId}`, { auth: true });
    },

    findOrFetchSpotifyAlbum: async (spotifyId: SpotifyId): Promise<AlbumDetailsResponse> => {
        return client.get<AlbumDetailsResponse>(`/v1/albums/by-spotify/${spotifyId}`, { auth: true });
    },

    getAlbumTracks: async (data: AlbumTracksRequest): Promise<AlbumTracksResponse> => {
        const { albumId, page = 1, limit = 15 } = data;
        return client.get<AlbumTracksResponse>(`/v1/albums/${albumId}/tracks`, {
            auth: true,
            params: { page, limit },
        });
    },

    getAlbumInteractions: async (data: InteractionsRequest): Promise<InteractionsResponse> => {
        const { targetId, page = 1, limit = 15 } = data;
        return client.get<InteractionsResponse>(`/v1/albums/${targetId}/interactions`, {
            auth: true,
            params: { page, limit },
        });
    },

    likeAlbum: async (albumId: AlbumId): Promise<AlbumLikeActionsResponse> => {
        return client.post<AlbumLikeActionsResponse>(`/v1/albums/${albumId}/like`, {}, { auth: true });
    },

    unlikeAlbum: async (albumId: AlbumId): Promise<AlbumLikeActionsResponse> => {
        return client.delete<AlbumLikeActionsResponse>(`/v1/albums/${albumId}/like`, { auth: true });
    },

    createOrUpdateInteraction: async (data: UpsertInteractionRequest): Promise<UpsertInteractionResponse> => {
        return client.post<UpsertInteractionResponse>(`/v1/albums/${data.targetId}/interactions`, data.interaction, {
            auth: true,
        });
    },
};

export { AlbumService };
