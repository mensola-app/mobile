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

export interface ArtistAlbumItem {
    id: string;
    spotifyId: string;
    title: string;
    name: string;
    image?: string;
    images?: Array<{ url: string; height: number; width: number }>;
    releaseDate?: string;
    releaseYear?: number;
    totalTracks?: number;
    type?: string;
    album_type?: string;
    album_group?: string;
    artists?: Array<{ id: string; spotifyId?: string; name: string }>;
}

export interface ArtistDiscographyResponseData {
    items: ArtistAlbumItem[];
    page: number;
    limit: number;
    hasMore: boolean;
    totalResults: number;
    totalPages: number;
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
    albums?: ArtistAlbumItem[];
}

export interface ToggleArtistFollowResponse {
    artistId: string;
    isFollowing: boolean;
}
