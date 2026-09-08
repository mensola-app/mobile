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

        it("should render 2x2 grid when movie list has no cover and 4 or more movies", () => {
            const movieListData = {
                listId: "list-4",
                listTitle: "Action Movies",
                movieCount: 10,
                previewMovies: [
                    { id: "m1", title: "M1", poster: "https://example.com/p1.jpg" },
                    { id: "m2", title: "M2", poster: "https://example.com/p2.jpg" },
                    { id: "m3", title: "M3", poster: "https://example.com/p3.jpg" },
                    { id: "m4", title: "M4", poster: "https://example.com/p4.jpg" },
                ],
            };

            const { getByText, UNSAFE_getAllByType } = render(
                <MovieCard type="movie-list" data={movieListData as any} />
            );

            expect(getByText("Action Movies")).toBeTruthy();
            const images = UNSAFE_getAllByType("Image");
            expect(images.length).toBe(4);
            expect(images[0].props.source).toEqual({ uri: "https://example.com/p1.jpg" });
            expect(images[3].props.source).toEqual({ uri: "https://example.com/p4.jpg" });
        });

        it("should render 2x2 grid using previewImages string array", () => {
            const movieListData = {
                listId: "list-preview-images",
                listTitle: "Sci-Fi Favorites",
                movieCount: 4,
                previewImages: [
                    "https://example.com/sci1.jpg",
                    "https://example.com/sci2.jpg",
                    "https://example.com/sci3.jpg",
                    "https://example.com/sci4.jpg",
                ],
            };

            const { getByText, UNSAFE_getAllByType } = render(
                <MovieCard type="movie-list" data={movieListData as any} />
            );

            expect(getByText("Sci-Fi Favorites")).toBeTruthy();
            expect(getByText("4 common.movie")).toBeTruthy();
            const images = UNSAFE_getAllByType("Image");
            expect(images.length).toBe(4);
            expect(images[0].props.source).toEqual({ uri: "https://example.com/sci1.jpg" });
            expect(images[3].props.source).toEqual({ uri: "https://example.com/sci4.jpg" });
        });

        it("should render placeholder icon when movie list has no cover and 0 movies", () => {
            const movieListData = {
                listId: "list-5",
                listTitle: "Empty Movie List",
                movieCount: 0,
                previewMovies: [],
            };

            const { getByText, UNSAFE_queryByType } = render(
                <MovieCard type="movie-list" data={movieListData as any} />
            );

            expect(getByText("Empty Movie List")).toBeTruthy();
            expect(getByText("0 common.movie")).toBeTruthy();
            expect(UNSAFE_queryByType("Image")).toBeNull();
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

