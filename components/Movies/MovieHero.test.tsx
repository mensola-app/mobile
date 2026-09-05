import React from "react";
import { render } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MovieHero from "./MovieHero";

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

describe("MovieHero Component", () => {
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
    };

    it("should render movie title, release year, duration, and genres", () => {
        const { getByText } = renderWithQueryClient(<MovieHero movie={mockMovie as any} />);

        expect(getByText("Interstellar")).toBeTruthy();
        expect(getByText("(2014)")).toBeTruthy();
        expect(getByText("169 dk")).toBeTruthy();
        expect(getByText("Sci-Fi, Drama")).toBeTruthy();
    });

    it("should render stats badges for rating, likesCount, and commentsCount", () => {
        const { getByText } = renderWithQueryClient(<MovieHero movie={mockMovie as any} />);

        expect(getByText("8.7")).toBeTruthy();
        expect(getByText("1250")).toBeTruthy();
        expect(getByText("340")).toBeTruthy();
    });

    it("should render null when movie prop is not provided", () => {
        const { queryByText } = renderWithQueryClient(<MovieHero movie={undefined} />);

        expect(queryByText("Interstellar")).toBeNull();
    });

    it("increments comments badge directly when a new comment is submitted", async () => {
        const { getByText, UNSAFE_getByType } = renderWithQueryClient(
            <MovieHero movie={mockMovie as any} isInteractionSheetOpen={true} />
        );

        expect(getByText("340")).toBeTruthy();

        const InteractionSheetComponent = require("../Interaction/InteractionSheet").default;
        const sheet = UNSAFE_getByType(InteractionSheetComponent);

        const { act } = require("@testing-library/react-native");
        await act(async () => {
            await sheet.props.onSubmit({ rating: 9, comment: "Harika bir film!", isLiked: false });
        });

        expect(getByText("341")).toBeTruthy();
    });
});

