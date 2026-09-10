import { ApiResponse } from "./api";
import { MovieId, MovieListId, PaginationQueries, PaginationResponse, UserId, WatchedMovieId } from "./common.types";
import { InteractionItemResponse, InteractionSummary } from "./interaction.types";
import { FollowUsersResponseDataItem, IUser } from "./user.types";

export interface IMovie {
    id: MovieId;
    title: string;
    poster: string;
    releaseDate?: string;
    ratingAverage?: number;
    genres?: string[];
    duration?: number;
    overview?: string;
}
export type MovieSummary = Pick<IMovie, "id" | "title" | "poster">;
export type MovieSummaryViaInteraction = IMovie & {
    rating?: number;
    isLiked?: boolean;
    hasReview?: boolean;
    watchedAt?: string;
    watchCount?: number;
};
export type MovieDetails = IMovie & {
    isWatched?: boolean;
    isInList?: boolean;
    isWatchlisted?: boolean;
    isFavorite?: boolean;
    likesCount?: number;
    commentsCount?: number;
    interactions: InteractionItemResponse[];
    currentUserInteraction: InteractionSummary;
    rating?: number;
    isLiked?: boolean;
    hasReview?: boolean;
};
export type WatchedMovie = { id: WatchedMovieId; userId: UserId; movieId: MovieId; watchedAt: Date | string };
export interface IMovieList {
    id: MovieListId;
    title: string;
    description?: string;
    image?: URL | string;
    creatorId?: UserId;
    items?: MovieSummaryViaInteraction;
    owners?: FollowUsersResponseDataItem[];
    listType?: MovieListType;
    isPrivate?: boolean;
    previewImages?: string[];
}
export type MovieListType = "custom" | "favorites" | "watchlist";
export type MovieListDetails = IMovieList & {
    isLiked?: boolean;
    isSaved?: boolean;
    likesCount?: number;
    savesCount?: number;
    currentUserInteraction?: InteractionSummary;
};
export type MovieListItem = {
    movieListId: MovieListId;
    movieId: MovieId;
    addedBy: UserId;
    addedAt?: Date | string;
};
export type GetMovieInteractionsItem = InteractionSummary & { user: IUser };
export type GetMovieRequest = { movieId: MovieId };
export type GetListsRequest = PaginationQueries & { movieId?: MovieId };
export type MovieDetailsResponse = ApiResponse<MovieDetails>;
export type MarkAsWatchedResponse = ApiResponse<WatchedMovie>;
export type MovieLikeActionsResponseData = { movieId: MovieId; isLiked: boolean };
export type MovieLikeActionsResponse = ApiResponse<MovieLikeActionsResponseData>;
export type MovieListLikeActionsResponseData = { listId: MovieListId; isLiked: boolean };
export type MovieListLikeActionsResponse = ApiResponse<MovieLikeActionsResponseData>;
export type AddToListResponse = ApiResponse<MovieListItem>;
export type GetListsResponseDataItem = {
    listId: MovieListId;
    listTitle: IMovieList["title"];
    image?: string | null;
    movieCount?: number;
    creator?: Pick<IUser, "id" | "username" | "avatar">;
    containsMovie?: boolean;
    previewImages?: string[];
    previewMovies?: MovieSummaryViaInteraction[];
};
export type GetListsResponseData = PaginationResponse & { items: GetListsResponseDataItem[] };
export type GetListsResponse = ApiResponse<GetListsResponseData>;
export type MovieListDetailsResponse = ApiResponse<MovieListDetails>;
export type MovieListItemsResponseData = PaginationResponse & {
    items: MovieSummaryViaInteraction[];
};
export type MovieListItemsResponse = ApiResponse<MovieListItemsResponseData>;
export type FavoriteMovies = MovieSummaryViaInteraction[];
export type FavoriteMoviesResponseData = PaginationResponse & { items: FavoriteMovies };
export type FavoriteMoviesResponse = ApiResponse<FavoriteMoviesResponseData>;
