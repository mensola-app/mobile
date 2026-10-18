import { client } from "@/lib/http/client";
import { ApiResponse } from "@/types/api";

export interface HeroMovie {
    tmdbId: number;
    title: string;
    overview: string;
    backdropUrl: string;
    posterUrl: string;
    rating: number;
}

export interface NowPlayingMovie {
    tmdbId: number;
    title: string;
    posterUrl: string;
    rating: number;
    releaseDate: string;
}

export interface NewTrack {
    spotifyId: string;
    title: string;
    artistName: string;
    albumCoverUrl: string | undefined;
    previewUrl: string | null;
}

export interface HomeData {
    heroMovies: HeroMovie[];
    nowPlayingMovies: NowPlayingMovie[];
    newTracks: NewTrack[];
    hasPendingFollowRequest: boolean;
}

export type HomeResponse = ApiResponse<HomeData>;

const HomeService = {
    getHomeData: async (): Promise<HomeResponse> => {
        return await client.get<HomeResponse>("/v1/home", { auth: true });
    },
};

export { HomeService };
