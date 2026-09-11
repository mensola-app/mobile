import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import NotificationRow from "./NotificationRow";
import { NotificationItem } from "./types";

describe("NotificationRow Component", () => {
    const mockItem: NotificationItem = {
        id: "notif-1",
        type: "like",
        actor: {
            id: "user-456",
            username: "janedoe",
            fullName: "Jane Doe",
        },
        createdAt: "1h ago",
        isRead: false,
    };

    it("renders actor name and default action text", () => {
        const { getByText } = render(<NotificationRow item={mockItem} />);

        expect(getByText("Jane Doe ")).toBeTruthy();
        expect(getByText(/notifications\.likedYourReview/)).toBeTruthy();
        expect(getByText("1h ago")).toBeTruthy();
    });

    it("triggers onPress when pressed", () => {
        const onPress = jest.fn();
        const { getByTestId } = render(<NotificationRow item={mockItem} onPress={onPress} />);

        fireEvent.press(getByTestId("notification-row-notif-1"));
        expect(onPress).toHaveBeenCalledWith(mockItem);
    });

    it("renders custom message if provided", () => {
        const customItem: NotificationItem = {
            ...mockItem,
            message: "custom message arrived",
        };
        const { getByText } = render(<NotificationRow item={customItem} />);

        expect(getByText(/custom message arrived/)).toBeTruthy();
    });

    it("renders appropriate message for playlist like", () => {
        const playlistItem: NotificationItem = {
            ...mockItem,
            target: { id: "pl-1", type: "playlist" },
        };
        const { getByText } = render(<NotificationRow item={playlistItem} />);
        expect(getByText(/notifications\.likedYourPlaylist/)).toBeTruthy();
    });

    it("renders appropriate message for movie_list like", () => {
        const movieListItem: NotificationItem = {
            ...mockItem,
            target: { id: "ml-1", type: "movie_list" },
        };
        const { getByText } = render(<NotificationRow item={movieListItem} />);
        expect(getByText(/notifications\.likedYourMovieList/)).toBeTruthy();
    });

    it("renders appropriate message for comment like", () => {
        const commentItem: NotificationItem = {
            ...mockItem,
            target: { id: "c-1", type: "comment" },
        };
        const { getByText } = render(<NotificationRow item={commentItem} />);
        expect(getByText(/notifications\.likedYourComment/)).toBeTruthy();
    });
});
