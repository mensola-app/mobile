import React from "react";
import { render } from "@testing-library/react-native";
import MovieCard from "./index";

describe("MovieCard Bileşeni Bütünsel Testleri", () => {
    it("should render image, rating, and icon names for profile variant but must not display any interaction counts", () => {
        const profileMovie = {
            title: "Movie Name",
            poster: "https://example.com/posster.jpg",
            interactions: {
                rating: "4.8",
                isLiked: true
            }
        };

        const { getByText, getByLabelText, queryByText } = render(
            <MovieCard {...profileMovie} variant="profile" />
        );

        expect(getByLabelText("Movie Name")).toBeTruthy();

        expect(getByText("4.8")).toBeTruthy();

        expect(getByText("heart")).toBeTruthy();
        expect(queryByText("text")).toBeNull();
    });

    it("should render all interaction metrics as numbers when variant is set to feed", () => {
        const feedMovie = {
            title: "Movie Name",
            poster: "https://example.com/poster.jpg",
            interactions: {
                rating: "4.8",
                totalLikes: 1500,
                totalReviews: 240
            }
        };

        const { getByText, getByLabelText } = render(
            <MovieCard {...feedMovie} variant="feed" />
        );

        expect(getByLabelText("Movie Name")).toBeTruthy();

        expect(getByText("4.8")).toBeTruthy();
        expect(getByText("1500")).toBeTruthy();
        expect(getByText("240")).toBeTruthy();
    });

    it("should render successfully without crashing when interactions prop is undefined", () => {
        const { queryByText, getByLabelText } = render(
            <MovieCard
                title="Movie Name"
                poster="https://example.com/poster.jpg"
            />
        );

        expect(getByLabelText("Movie Name")).toBeTruthy();

        expect(queryByText("4.8")).toBeNull();
    });

    it("should safely hide interaction sub-components when numerical values are zero", () => {
        const zeroMovie = {
            title: "Movie Name",
            poster: "https://example.com/poster.jpg",
            interactions: {
                rating: "5.0",
                totalReviews: 0,
                totalReviews: 0
            }
        };

        const { getByText, queryByText, getByLabelText } = render(
            <MovieCard {...zeroMovie} variant="feed" />
        );

        expect(getByLabelText("Movie Name")).toBeTruthy();

        expect(getByText("5")).toBeTruthy();
        expect(queryByText("0")).toBeNull();
    });

    describe("type prop ('movie' and 'movie-list') tests", () => {
        it("should render movie list with cover image, creator, and movie count", () => {
            const movieListData = {
                listId: "list-1",
                listTitle: "Favorite Sci-Fi",
                image: "https://example.com/cover.jpg",
                movieCount: 12,
                creator: { id: "u1", username: "cinephile" },
                previewMovies: [],
            };

            const { getByText, getByLabelText } = render(
                <MovieCard type="movie-list" data={movieListData as any} />
            );

            expect(getByText("Favorite Sci-Fi")).toBeTruthy();
            expect(getByLabelText("Favorite Sci-Fi")).toBeTruthy();
            expect(getByText("@cinephile • 12 common.movie")).toBeTruthy();
        });

        it("should fallback to preview movie poster when cover image is absent", () => {
            const movieListData = {
                listId: "list-2",
                listTitle: "Drama Collection",
                previewMovies: [
                    { id: "m1", title: "The Godfather", poster: "https://example.com/godfather.jpg" },
                ],
            };

            const { getByText, getByLabelText } = render(
                <MovieCard type="movie-list" data={movieListData as any} />
            );

            expect(getByText("Drama Collection")).toBeTruthy();
            expect(getByLabelText("Drama Collection")).toBeTruthy();
        });

        it("should hide creator when hideCreator is true", () => {
            const movieListData = {
                listId: "list-3",
                listTitle: "My Personal List",
                movieCount: 5,
                creator: { id: "u1", username: "enes" },
                previewMovies: [],
            };

            const { getByText, queryByText } = render(
                <MovieCard type="movie-list" data={movieListData as any} hideCreator />
            );

            expect(getByText("My Personal List")).toBeTruthy();
            expect(getByText("5 common.movie")).toBeTruthy();
            expect(queryByText("@enes")).toBeNull();
        });

        it("should render movie data object when type is 'movie'", () => {
            const movieData = {
                id: "m-123",
                title: "Inception",
                poster: "https://example.com/inception.jpg",
                releaseDate: "2010-07-16",
                rating: 4.9,
                isLiked: true,
            };

            const { getByText, getByLabelText } = render(
                <MovieCard type="movie" data={movieData as any} />
            );

            expect(getByText("Inception • 2010")).toBeTruthy();
            expect(getByLabelText("Inception • 2010")).toBeTruthy();
            expect(getByText("4.9")).toBeTruthy();
        });
    });
});

