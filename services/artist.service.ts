import { client } from "../api/client";
import { ArtistDetailResponse, ToggleArtistFollowResponse } from "@/types/artist.types";
import { ApiResponse } from "@/types/api";

const ArtistService = {
    getArtistDetails: async (artistId: string): Promise<ArtistDetailResponse> => {
        return await client.get<ArtistDetailResponse>(`/v1/artists/${artistId}`, { auth: true });
    },

    followArtist: async (artistId: string): Promise<ToggleArtistFollowResponse> => {
        return await client.post<ToggleArtistFollowResponse>(`/v1/artists/${artistId}/follow`, {}, { auth: true });
    },

    unfollowArtist: async (artistId: string): Promise<ToggleArtistFollowResponse> => {
        return await client.delete<ToggleArtistFollowResponse>(`/v1/artists/${artistId}/follow`, { auth: true });
    },
};

export { ArtistService };
