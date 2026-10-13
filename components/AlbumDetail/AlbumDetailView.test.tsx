import React from "react";
import { render } from "@testing-library/react-native";
import AlbumDetailView from "./AlbumDetailView";

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

describe("AlbumDetailView Component", () => {
    const mockAlbumDetails = {
        id: "album-1",
        title: "Random Access Memories",
        artists: [{ name: "Daft Punk" }],
        coverImage: "https://example.com/ram.jpg",
        releaseDate: "2013-05-17",
        totalTracks: 1,
        isLiked: false,
    };

    const mockTracks = [
        {
            id: "track-1",
            spotifyId: "sp-1",
            title: "Get Lucky",
            duration: 248,
            artists: [{ name: "Daft Punk" }],
            image: "https://example.com/ram.jpg",
        },
    ];

    it("should render loading activity indicator when isLoading is true", () => {
        const { getByTestId } = render(
            <AlbumDetailView
                albumDetails={null as any}
                tracks={[]}
                loadMoreTracks={() => {}}
                hasNextTrackPage={false}
                isFetchingNextTrackPage={false}
                interactions={[]}
                submitInteraction={async () => {}}
                loadMoreInteractions={() => {}}
                hasNextInteractionsPage={false}
                isFetchingNextInteractionPage={false}
                isLoading={true}
                isRefetching={false}
                error=""
                refetchAll={() => {}}
                toggleLike={() => {}}
            />
        );

        expect(getByTestId).toBeTruthy();
    });

    it("should pass refreshing and onRefresh to list and trigger refetchAll", () => {
        const refetchAllMock = jest.fn();
        const { UNSAFE_getByType, getByText } = render(
            <AlbumDetailView
                albumDetails={mockAlbumDetails as any}
                tracks={mockTracks as any}
                loadMoreTracks={() => {}}
                hasNextTrackPage={false}
                isFetchingNextTrackPage={false}
                interactions={[]}
                submitInteraction={async () => {}}
                loadMoreInteractions={() => {}}
                hasNextInteractionsPage={false}
                isFetchingNextInteractionPage={false}
                isLoading={false}
                isRefetching={true}
                error=""
                refetchAll={refetchAllMock}
                toggleLike={() => {}}
            />
        );

        expect(getByText("Şarkılar (1)")).toBeTruthy();
        const flatList = UNSAFE_getByType(require("react-native").FlatList);
        expect(flatList.props.refreshControl).toBeTruthy();
        expect(flatList.props.refreshControl.props.refreshing).toBe(true);
        flatList.props.refreshControl.props.onRefresh();
        expect(refetchAllMock).toHaveBeenCalledTimes(1);
    });
});
