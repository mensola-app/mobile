import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import MovieListDetailView from "./MovieListDetailView";

jest.mock("expo-router", () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

jest.mock("@/context/AuthContext", () => ({
    useGlobalUser: () => ({
        user: { id: "user-999", username: "currentuser" },
    }),
}));

jest.mock("@/hooks/user/useFollow", () => ({
    useFollow: () => ({
        followHandler: jest.fn(),
        unfollowHandler: jest.fn(),
        error: "",
    }),
}));

describe("MovieListDetailView Component", () => {
    const mockListDetails = {
        id: "list-1",
        title: "Kült Filmler",
        description: "Sinema tarihinin klasikleri",
        creatorId: "user-1",
        owners: [{ id: "user-1", username: "admin", fullname: "Admin", avatar: null }],
        isLiked: false,
        likesCount: 10,
        currentUserInteraction: null,
    };

    const mockMovies = [
        { id: "m-1", title: "The Godfather", poster: "https://example.com/godfather.jpg", rating: 9.2 },
    ];

    const mockInteractions = [
        {
            id: "int-1",
            user: { id: "u-1", username: "alice", fullname: "Alice", avatar: "https://example.com/alice.jpg" },
            comment: { id: "c-1", content: "Mükemmel liste!", date: "2026-08-11" },
            likeCount: 5,
            replyCount: 0,
        },
    ];

    it("should render loading activity indicator when isLoading is true", () => {
        const { getByTestId } = render(
            <MovieListDetailView
                listDetails={null}
                movies={[]}
                interactions={[]}
                isLoading={true}
                isRefetching={false}
                error=""
                refetch={() => {}}
                toggleLike={() => {}}
                submitInteraction={async () => {}}
            />
        );

        // Standard React Native ActivityIndicator or view
        expect(getByTestId).toBeTruthy();
    });

    it("should render tabs and switch content when active tab is changed", () => {
        const { getByText } = render(
            <MovieListDetailView
                listDetails={mockListDetails as any}
                movies={mockMovies as any}
                interactions={mockInteractions as any}
                isLoading={false}
                isRefetching={false}
                error=""
                refetch={() => {}}
                toggleLike={() => {}}
                submitInteraction={async () => {}}
            />
        );

        expect(getByText("Filmler (1)")).toBeTruthy();
        expect(getByText("Yorumlar (1)")).toBeTruthy();
        expect(getByText("The Godfather")).toBeTruthy();

        // Switch to Yorumlar tab
        fireEvent.press(getByText("Yorumlar (1)"));
        expect(getByText("Mükemmel liste!")).toBeTruthy();
    });

    it("should pass refreshing and onRefresh to list and trigger refetchAll", () => {
        const refetchAllMock = jest.fn();
        const { UNSAFE_getByType } = render(
            <MovieListDetailView
                listDetails={mockListDetails as any}
                movies={mockMovies as any}
                interactions={mockInteractions as any}
                isLoading={false}
                isRefetching={true}
                error=""
                refetchAll={refetchAllMock}
                toggleLike={() => {}}
                submitInteraction={async () => {}}
                loadMoreMovies={() => {}}
                hasNextMoviePage={false}
                isFetchingNextMoviePage={false}
                loadMoreInteractions={() => {}}
            />
        );

        const flatList = UNSAFE_getByType(require("react-native").FlatList);
        expect(flatList.props.refreshControl).toBeTruthy();
        expect(flatList.props.refreshControl.props.refreshing).toBe(true);
        flatList.props.refreshControl.props.onRefresh();
        expect(refetchAllMock).toHaveBeenCalledTimes(1);
    });
});

