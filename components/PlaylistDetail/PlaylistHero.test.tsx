import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import PlaylistHero from "./PlaylistHero";

jest.mock("@/utils/share", () => ({
    sharePlaylist: jest.fn(),
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

describe("PlaylistHero Component", () => {
    const mockPlaylistDetails = {
        id: "playlist-123",
        title: "Favori Şarkılarım",
        description: "En sevdiğim şarkıların listesi.",
        image: "https://example.com/playlist.jpg",
        creatorId: "user-1",
        creator: { id: "user-1", username: "enesc", fullname: "Enes C", avatar: "https://example.com/avatar.jpg" },
        owners: [
            { id: "user-1", username: "enesc", fullname: "Enes C", avatar: "https://example.com/avatar.jpg" },
        ],
        isLiked: true,
        isSaved: false,
        likesCount: 25,
        savesCount: 10,
        songCount: 45,
        currentUserInteraction: null,
    };

    it("should render playlist title, creator name, description, and badges", () => {
        const { getByText } = render(
            <PlaylistHero
                playlistDetails={mockPlaylistDetails as any}
                tracksCount={18}
                commentsCount={5}
                toggleLike={() => {}}
                toggleSave={() => {}}
            />
        );

        expect(getByText("Favori Şarkılarım")).toBeTruthy();
        expect(getByText("Enes C")).toBeTruthy();
        expect(getByText("En sevdiğim şarkıların listesi.")).toBeTruthy();

        // Should prioritize songCount (45) over tracksCount (18)
        expect(getByText("45")).toBeTruthy();
        expect(getByText("25")).toBeTruthy();
        expect(getByText("5")).toBeTruthy();
        expect(getByText("10")).toBeTruthy();
    });

    it("should fallback to tracksCount prop when songCount is undefined", () => {
        const detailsWithoutSongCount = { ...mockPlaylistDetails, songCount: undefined };
        const { getByText } = render(
            <PlaylistHero
                playlistDetails={detailsWithoutSongCount as any}
                tracksCount={12}
                commentsCount={5}
                toggleLike={() => {}}
                toggleSave={() => {}}
            />
        );

        expect(getByText("12")).toBeTruthy();
    });

    it("should trigger toggleSave and toggleLike when action buttons are pressed", () => {
        const toggleLikeMock = jest.fn();
        const toggleSaveMock = jest.fn();
        const onCommentPressMock = jest.fn();

        const { getAllByText, getByText } = render(
            <PlaylistHero
                playlistDetails={mockPlaylistDetails as any}
                tracksCount={18}
                commentsCount={5}
                toggleLike={toggleLikeMock}
                toggleSave={toggleSaveMock}
                onCommentPress={onCommentPressMock}
            />
        );

        // ActionButton icons
        fireEvent.press(getAllByText("bookmark-outline")[0]);
        expect(toggleSaveMock).toHaveBeenCalledTimes(1);

        fireEvent.press(getAllByText("heart")[1]);
        expect(toggleLikeMock).toHaveBeenCalledTimes(1);

        fireEvent.press(getByText("star"));
        expect(onCommentPressMock).toHaveBeenCalledTimes(1);
    });

    it("should return null when playlistDetails is null", () => {
        const { queryByText } = render(
            <PlaylistHero
                playlistDetails={null as any}
                tracksCount={0}
                toggleLike={() => {}}
            />
        );

        expect(queryByText("Favori Şarkılarım")).toBeNull();
    });
});
