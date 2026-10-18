import { client } from "@/lib/http/client";
import { SearchMovieRequest, TmdbhMoviesResponse } from "@/types/tmdb.types";

const tmdbService = {
    searchMovie: async (data: SearchMovieRequest): Promise<TmdbhMoviesResponse> => {
        const { query, page } = data;
        return client.get<TmdbhMoviesResponse>("/v1/tmdb/search/movie", { auth: true, params: { query, page } });
    },

    getTrendingMovies: async (page: number): Promise<TmdbhMoviesResponse> => {
        return client.get<TmdbhMoviesResponse>("/v1/tmdb/trending/movie", { auth: true, params: { page } });
    },
};

export { tmdbService };
