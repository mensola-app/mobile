import { MovieId, MovieListId, TmdbId } from "@/types/common.types";
import { client } from "../api/client";
import {
    InteractionsRequest,
    InteractionsResponse,
    UpsertInteractionRequest,
    UpsertInteractionResponse,
} from "@/types/interaction.types";
import {
    AddToListResponse,
    GetListsRequest,
    GetListsResponse,
    MarkAsWatchedResponse,
    MovieDetailsResponse,
    MovieLikeActionsResponse,
    MovieListDetailsResponse,
    MovieListItemsResponse,
    MovieListLikeActionsResponse,
    FavoriteMoviesResponse,
} from "@/types/movie.types";
import { ApiResponse } from "@/types/api";
const MovieService = {
    getFavoriteMovies: async (page = 1, limit = 3): Promise<FavoriteMoviesResponse> => {
        return await client.get<FavoriteMoviesResponse>(`/v1/movies/favorites`, {
            auth: true,
            params: { page, limit },
        });
    },
    getMovie: async (movieId: MovieId): Promise<MovieDetailsResponse> => {
        return await client.get<MovieDetailsResponse>(`/v1/movies/${movieId}`, { auth: true });
    },

    markAsWatched: async (movieId: MovieId): Promise<MarkAsWatchedResponse> => {
        return await client.post<MarkAsWatchedResponse>(`/v1/movies/${movieId}/watched`, {}, { auth: true });
    },

    unmarkAsWatched: async (movieId: MovieId): Promise<ApiResponse> => {
        return await client.delete<ApiResponse>(`/v1/movies/${movieId}/watched`, { auth: true });
    },

    likeMovie: async (movieId: MovieId): Promise<MovieLikeActionsResponse> => {
        return await client.post<MovieLikeActionsResponse>(`/v1/movies/${movieId}/like`, {}, { auth: true });
    },

    unlikeMovie: async (movieId: MovieId): Promise<MovieLikeActionsResponse> => {
        return await client.delete<MovieLikeActionsResponse>(`/v1/movies/${movieId}/like`, { auth: true });
    },

    addToWatchlist: async (movieId: MovieId): Promise<AddToListResponse> => {
        return await client.post<AddToListResponse>(`/v1/movies/${movieId}/watchlist`, {}, { auth: true });
    },

    removeFromWatchlist: async (movieId: MovieId): Promise<ApiResponse> => {
        return await client.delete<ApiResponse>(`/v1/movies/${movieId}/watchlist`, { auth: true });
    },

    addToFavorites: async (data: {
        movieId?: MovieId;
        tmdbId?: number;
        replaceMovieId?: MovieId;
    }): Promise<ApiResponse> => {
        return await client.post<ApiResponse>(`/v1/movies/favorites`, data, { auth: true });
    },

    removeFromFavorites: async (movieId: MovieId): Promise<ApiResponse> => {
        return await client.delete<ApiResponse>(`/v1/movies/${movieId}/favorites`, { auth: true });
    },

    addMovieToList: async (listId: MovieListId, movieId: MovieId): Promise<AddToListResponse> => {
        return await client.post<AddToListResponse>(`/v1/movies/lists/${listId}/items/${movieId}`, {}, { auth: true });
    },

    removeMovieFromList: async (listId: MovieListId, movieId: MovieId): Promise<ApiResponse> => {
        return await client.delete<ApiResponse>(`/v1/movies/lists/${listId}/items/${movieId}`, { auth: true });
    },

    getUserLists: async (data: GetListsRequest): Promise<GetListsResponse> => {
        const { movieId, page = 1, limit = 20 } = data;
        return await client.get<GetListsResponse>(`/v1/movies/lists`, { auth: true, params: { movieId, page, limit } });
    },

    getMovieInteractions: async (data: InteractionsRequest): Promise<InteractionsResponse> => {
        const { targetId, page = 1, limit = 18 } = data;
        return await client.get<InteractionsResponse>(`/v1/movies/${targetId}/interactions`, {
            auth: true,
            params: { page, limit },
        });
    },

    createOrUpdateInteraction: async (data: UpsertInteractionRequest): Promise<UpsertInteractionResponse> => {
        return await client.post<UpsertInteractionResponse>(
            `/v1/movies/${data.targetId}/interactions`,
            data.interaction,
            {
                auth: true,
            },
        );
    },

    getMovieListDetails: async (listId: MovieListId): Promise<MovieListDetailsResponse> => {
        return await client.get<MovieListDetailsResponse>(`/v1/movies/lists/${listId}`, { auth: true });
    },

    getMovieListItems: async (listId: string, page = 1, limit = 18): Promise<MovieListItemsResponse> => {
        return await client.get<MovieListItemsResponse>(`/v1/movies/lists/${listId}/items`, {
            auth: true,
            params: { page, limit },
        });
    },

    getMovieListInteractions: async (data: InteractionsRequest): Promise<InteractionsResponse> => {
        const { targetId, page = 1, limit = 15 } = data;
        return await client.get<InteractionsResponse>(`/v1/movies/lists/${targetId}/interactions`, {
            auth: true,
            params: { page, limit },
        });
    },

    createOrUpdateListInteraction: async (data: UpsertInteractionRequest): Promise<UpsertInteractionResponse> => {
        return await client.post<UpsertInteractionResponse>(
            `/v1/movies/lists/${data.targetId}/interaction`,
            data.interaction,
            { auth: true },
        );
    },

    likeMovieList: async (listId: MovieListId): Promise<MovieListLikeActionsResponse> => {
        return await client.post<MovieListLikeActionsResponse>(`/v1/movies/lists/${listId}/like`, {}, { auth: true });
    },

    unlikeMovieList: async (listId: MovieListId): Promise<MovieListLikeActionsResponse> => {
        return await client.delete<MovieListLikeActionsResponse>(`/v1/movies/lists/${listId}/like`, { auth: true });
    },

    findOrFetchMovie: async (tmdbId: TmdbId): Promise<MovieDetailsResponse> => {
        return await client.get<MovieDetailsResponse>(`/v1/movies/by-tmdb/${tmdbId}`, { auth: true });
    },

    createList: async (data: {
        title: string;
        description?: string;
        image?: string | null;
        isPrivate?: boolean;
    }): Promise<ApiResponse> => {
        return await client.post<ApiResponse>(`/v1/movies/lists`, data, { auth: true });
    },
};

export { MovieService };
