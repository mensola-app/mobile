import { client } from "../api/client";
import {
    ArtistDetailResponse,
    ToggleArtistFollowResponse,
    ArtistDiscographyResponseData,
} from "@/types/artist.types";
import { ApiResponse } from "@/types/api";

const ArtistService = {
    getArtistDetails: async (artistId: string): Promise<ArtistDetailResponse> => {
        return await client.get<ArtistDetailResponse>(`/v1/artists/${artistId}`, { auth: true });
    },

    getArtistDiscography: async (
        artistId: string,
        params?: { page?: number; limit?: number },
    ): Promise<ApiResponse<ArtistDiscographyResponseData>> => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.limit) queryParams.append("limit", params.limit.toString());
        const qs = queryParams.toString() ? `?${queryParams.toString()}` : "";

        return await client.get<ApiResponse<ArtistDiscographyResponseData>>(
            `/v1/artists/${artistId}/discography${qs}`,
            { auth: true },
        );
    },

    followArtist: async (artistId: string): Promise<ToggleArtistFollowResponse> => {
        return await client.post<ToggleArtistFollowResponse>(`/v1/artists/${artistId}/follow`, {}, { auth: true });
    },

    unfollowArtist: async (artistId: string): Promise<ToggleArtistFollowResponse> => {
        return await client.delete<ToggleArtistFollowResponse>(`/v1/artists/${artistId}/follow`, { auth: true });
    },
};

export { ArtistService };
