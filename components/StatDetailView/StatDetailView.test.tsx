import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import StatDetailView from "./StatDetailView";
import { usePreferences } from "@/hooks/usePreferences";

describe("StatDetailView Component Unit Tests", () => {
    const mockRefetch = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        usePreferences.setState({ "shelf-layout": "grid" });
    });

    it("renders empty state correctly when items array is empty", () => {
        const { getByText } = render(
            <StatDetailView
                currentUserId="user-1"
                statType="watchlist"
                items={[]}
                isLoading={false}
                isError={false}
                refetch={mockRefetch}
            />
        );

        // In the jest mock environment, t(key) returns the key
        expect(getByText("statDetails.empty.watchlist")).toBeTruthy();
    });

    it("renders fallback empty message when statType is not set", () => {
        const { getByText } = render(
            <StatDetailView
                currentUserId="user-1"
                statType={"" as any}
                items={[]}
                isLoading={false}
                isError={false}
            />
        );

        expect(getByText("statDetails.emptyMessage")).toBeTruthy();
    });

    it("renders error state and handles retry button click", () => {
        const { getByText } = render(
            <StatDetailView
                currentUserId="user-1"
                statType="watchlist"
                items={[]}
                isLoading={false}
                isError={true}
                refetch={mockRefetch}
            />
        );

        expect(getByText("statDetails.errorMessage")).toBeTruthy();
        const retryButton = getByText("statDetails.retry");
        expect(retryButton).toBeTruthy();

        fireEvent.press(retryButton);
        expect(mockRefetch).toHaveBeenCalledTimes(1);
    });

    it("renders loading activity indicator when isLoading is true", () => {
        const { UNSAFE_getByType } = render(
            <StatDetailView
                currentUserId="user-1"
                statType="watchlist"
                items={[]}
                isLoading={true}
                isError={false}
            />
        );

        const spinner = UNSAFE_getByType(require("react-native").ActivityIndicator);
        expect(spinner).toBeTruthy();
    });

    it("renders movie-lists as grid items using MovieCard", () => {
        const mockLists = [
            {
                listId: "list-1",
                listTitle: "My Christopher Nolan List",
                image: "https://example.com/nolan.jpg",
                movieCount: 7,
                creator: { id: "u1", username: "filmfan" },
                previewMovies: [],
            },
        ];

        const { getByText } = render(
            <StatDetailView
                currentUserId="user-1"
                statType="movie-lists"
                items={mockLists as any}
                isLoading={false}
                isError={false}
            />
        );

        expect(getByText("My Christopher Nolan List")).toBeTruthy();
    });

    it("renders movies with horizontal layout when layout prop is horizontal", () => {
        const mockMovies = [
            {
                id: "m-1",
                title: "Inception",
                releaseDate: "2010-07-16",
                poster: "https://example.com/inception.jpg",
                ratingAverage: 8.8,
                genres: ["Sci-Fi", "Action"],
            },
        ];

        const { getByText } = render(
            <StatDetailView
                currentUserId="user-1"
                statType="watchlist"
                items={mockMovies as any}
                isLoading={false}
                isError={false}
                layout="horizontal"
            />
        );

        expect(getByText("Inception • 2010")).toBeTruthy();
        expect(getByText("Sci-Fi, Action")).toBeTruthy();
    });

    it("renders tracks with horizontal layout when shelf-layout preference is set to list", () => {
        usePreferences.setState({ "shelf-layout": "list" });

        const mockTracks = [
            {
                id: "t-1",
                title: "Blinding Lights",
                artists: [{ name: "The Weeknd" }],
                album: { title: "After Hours" },
                duration: 200000,
                image: "https://example.com/afterhours.jpg",
            },
        ];

        const { getByText } = render(
            <StatDetailView
                currentUserId="user-1"
                statType="liked-tracks"
                items={mockTracks as any}
                isLoading={false}
                isError={false}
            />
        );

        expect(getByText("Blinding Lights")).toBeTruthy();
        expect(getByText("After Hours")).toBeTruthy();
        expect(getByText(/The Weeknd/)).toBeTruthy();
    });

    it("renders tracks with vertical layout when shelf-layout preference is set to grid", () => {
        usePreferences.setState({ "shelf-layout": "grid" });

        const mockTracks = [
            {
                id: "t-1",
                title: "Blinding Lights",
                artists: [{ name: "The Weeknd" }],
                album: { title: "After Hours" },
                duration: 200000,
                image: "https://example.com/afterhours.jpg",
            },
        ];

        const { getByText, queryByText } = render(
            <StatDetailView
                currentUserId="user-1"
                statType="liked-tracks"
                items={mockTracks as any}
                isLoading={false}
                isError={false}
            />
        );

        expect(getByText("Blinding Lights")).toBeTruthy();
        // In vertical layout, albumTitle is not shown in MusicCard (albumTitle only shows if isHorizontal && type === 'track')
        expect(queryByText("After Hours")).toBeNull();
    });
});

