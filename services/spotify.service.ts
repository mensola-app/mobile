import { client } from "@/lib/http/client";
import { PaginationQueries } from "@/types/common.types";
import { GetAlbumsResponse, SearchTrackRequest, SearchTrackResponse } from "@/types/spotify.types";

const spotifyService = {
    searchTrack: async (data: SearchTrackRequest): Promise<SearchTrackResponse> => {
        const { query, page, limit } = data;
        return client.get<SearchTrackResponse>("/v1/spotify/search/track", {
            auth: true,
            params: { query, page, limit },
        });
    },

    getNewAlbums: async (data: PaginationQueries): Promise<GetAlbumsResponse> => {
        const { page, limit } = data;
        return client.get<GetAlbumsResponse>("/v1/spotify/albums/new", { auth: true, params: { page, limit } });
    },
};

export { spotifyService };
