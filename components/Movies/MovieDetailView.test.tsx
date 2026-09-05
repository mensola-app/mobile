import React from "react";
import { render, act } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MovieDetailView from "./MovieDetailView";

jest.mock("@/hooks/movie/useWatched", () => ({
    useWatched: () => ({
        markAsWatched: jest.fn(),
        unmarkAsWatched: jest.fn(),
        isLoading: false,
    }),
}));

jest.mock("@/hooks/movie/useLike", () => ({
    useLike: () => ({
        likeMovie: jest.fn(),
        unlikeMovie: jest.fn(),
        isLoading: false,
    }),
}));

jest.mock("@/services/movie.service", () => ({
    MovieService: {
        getUserLists: jest.fn().mockResolvedValue({ data: { items: [], hasMore: false } }),
        createOrUpdateInteraction: jest.fn().mockResolvedValue({ success: true }),
    },
}));

const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

const renderWithQueryClient = (ui: React.ReactElement) => {
    const queryClient = createTestQueryClient();
    return render(
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
};

describe("MovieDetailView Component", () => {
    const mockMovie = {
        id: "movie-123",
        tmdbId: "tmdb-456",
        title: "Interstellar",
        poster: "https://example.com/poster.jpg",
        bannerUrl: "https://example.com/banner.jpg",
        releaseDate: "2014-11-07T00:00:00Z",
        duration: 169,
        genres: ["Sci-Fi", "Drama"],
        rating: 8.7,
        likesCount: 1250,
        commentsCount: 340,
        isWatched: false,
        isInList: false,
        isWatchlisted: false,
        currentUserInteraction: null,
        interactions: [],
    };

    it("renders with RefreshControl and calls refetch on refresh", async () => {
        const mockRefetch = jest.fn().mockResolvedValue(undefined);

        const { UNSAFE_getByType } = renderWithQueryClient(
            <MovieDetailView
                movie={mockMovie as any}
                isLoading={false}
                error=""
                refetch={mockRefetch}
                isRefreshing={false}
            />
        );

        const refreshControl = UNSAFE_getByType(require("react-native").RefreshControl);
        expect(refreshControl).toBeTruthy();

        await act(async () => {
            await refreshControl.props.onRefresh();
        });

        expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
});
