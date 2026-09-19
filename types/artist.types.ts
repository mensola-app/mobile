import { ArtistId, SpotifyArtistId } from "./common.types";

export interface IArtist {
    id: ArtistId;
    spotifyId?: SpotifyArtistId;
    name: string;
    avatar?: URL | string;
    followerCount?: number;
}

export interface ArtistTopTrack {
    spotifyId: string;
    title: string;
    duration: number;
    image?: string;
    artists: { spotifyId: string; name: string }[];
    album?: { spotifyId: string; title: string; image?: string };
}

export interface ArtistDetailResponse {
    id: string; // Internal DB UUID
    spotifyId: string;
    name: string;
    image?: string;
    genres?: string[];
    spotifyFollowers?: number;
    followerCount: number;
    isFollowing: boolean;
    topTracks: ArtistTopTrack[];
}

export interface ToggleArtistFollowResponse {
    artistId: string;
    isFollowing: boolean;
}
