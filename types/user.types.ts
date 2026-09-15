import { ApiResponse } from "./api";
import { PaginationResponse, UserId } from "./common.types";
import { FavoriteMovies } from "./movie.types";
import { StatTypeKey } from "./stat.types";
import { FavoriteTracks } from "./track.types";

export interface IUser {
    id: UserId;
    username: string;
    fullname?: string;
    avatar?: URL | string;
    bio?: string;
    email?: string;
    isPrivate?: boolean;
    hasAccess?: boolean;
    isPending?: boolean;
    subscriptionTier?: string;
}
export type UserFavorites = { favoriteMovies: FavoriteMovies; favoriteTracks: FavoriteTracks };
export type UserStats = Record<StatTypeKey, number>;
export type UserRelationships = {
    mutualFollowers?: Pick<IUser, "id" | "username" | "fullname">[];
    isFollowingByMe?: boolean;
    isPendingByMe?: boolean;
    hasPendingRequestFromUser?: boolean;
};
export type UserProfile = IUser & UserStats & UserFavorites & UserRelationships;
export type GetProfileRequest = { userId: UserId | "me" };
export type GetProfileResponse = ApiResponse<{ profile: UserProfile }>;
export type FollowActionResponseData = { userId: UserId; isFollowing: boolean; isPending?: boolean; status?: "pending" | "accepted" };
export type FollowActionResponse = ApiResponse<FollowActionResponseData>;
export type FollowUsersResponseDataItem = IUser & { isFollowing: boolean; isFollower: boolean; isPending?: boolean };
export type FollowUsersResponseData = PaginationResponse & { items: FollowUsersResponseDataItem[] };
export type FollowUsersResponse = ApiResponse<FollowUsersResponseData>;
export type UpdateProfileResponse = ApiResponse<{ user: IUser }>;
export type UpdateUsernameResponse = ApiResponse<{ user: { id: string; username: string; usernameChangedAt: string } }>;
