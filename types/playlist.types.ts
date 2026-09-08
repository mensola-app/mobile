import { ApiResponse } from "./api";
import { PaginationQueries, PaginationResponse, PlaylistId, SpotifyId, TrackId, UserId } from "./common.types";
import { InteractionSummary } from "./interaction.types";
import { ITrack } from "./track.types";
import { FollowUsersResponseDataItem, IUser } from "./user.types";

export interface IPlaylist {
    id: PlaylistId;
    spotifyId?: SpotifyId;
    title: string;
    description?: string;
    image?: URL | string;
    creatorId?: UserId;
    creator?: IUser;
    songCount?: number;
    isPrivate?: boolean;
}
export type PlaylistDetails = IPlaylist & {
    owners?: FollowUsersResponseDataItem[];
    isSaved?: boolean;
    isLiked?: boolean;
    savesCount?: number;
    likesCount?: number;
    currentUserInteraction?: InteractionSummary;
};
export type PlaylistItem = {
    playlistId: PlaylistId;
    trackId: TrackId;
    addedBy: UserId;
    addetAt?: Date | string;
};
export type PlaylistDetailsResponse = ApiResponse<PlaylistDetails>;
export type PlaylistItemsRequest = PaginationQueries & { playlistId: PlaylistId };
export type PlaylistItemsResponseDataItem = ITrack & { isLiked?: boolean };
export type PLaylistItemsResponseData = PaginationResponse & { items: PlaylistItemsResponseDataItem[] };
export type PlaylistItemsResponse = ApiResponse<PLaylistItemsResponseData>;
export type PlaylistLikeActionsResponseData = { playlistId: PlaylistId; isLiked: boolean };
export type PlaylistLikeActionsResponse = ApiResponse<PlaylistLikeActionsResponseData>;
export type GetPlaylistsResponseDataItem = IPlaylist & { containsTrack?: boolean };
export type GetPlaylistsResponseData = PaginationResponse & { items: GetPlaylistsResponseDataItem[] };
export type GetPlaylistsResponse = ApiResponse<GetPlaylistsResponseData>;
export type AddToPlaylistResponse = ApiResponse<PlaylistItem>;
export type GetPlaylistsRequest = PaginationQueries & { trackId?: TrackId };
