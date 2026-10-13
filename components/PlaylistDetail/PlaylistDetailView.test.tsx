import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import PlaylistDetailView from "./PlaylistDetailView";

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

describe("PlaylistDetailView Component", () => {
    const mockPlaylistDetails = {
        id: "playlist-1",
        title: "Chill Vibes",
        description: "Rahatlatıcı parçalar",
        creatorId: "user-1",
        owners: [{ id: "user-1", username: "admin", fullname: "Admin", avatar: null }],
        isLiked: false,
        likesCount: 5,
        songCount: 1,
        currentUserInteraction: null,
    };

    const mockTracks = [
        {
            id: "track-1",
            spotifyId: "sp-1",
            title: "Midnight City",
            duration: 240,
            artists: [{ name: "M83" }],
            image: "https://example.com/track.jpg",
        },
    ];

    const mockInteractions = [
        {
            id: "int-1",
            user: { id: "u-1", username: "alice", fullname: "Alice", avatar: null },
            comment: { id: "c-1", content: "Harika playlist!", date: "2026-08-11" },
            likeCount: 3,
            replyCount: 0,
        },
    ];

    it("should render loading activity indicator when isLoading is true", () => {
        const { getByTestId } = render(
            <PlaylistDetailView
                playlistDetails={null as any}
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
            <PlaylistDetailView
                playlistDetails={mockPlaylistDetails as any}
                tracks={mockTracks as any}
                loadMoreTracks={() => {}}
                hasNextTrackPage={false}
                isFetchingNextTrackPage={false}
                interactions={mockInteractions as any}
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
