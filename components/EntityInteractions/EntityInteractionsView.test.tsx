import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import EntityInteractionsView from "./EntityInteractionsView";
import { InteractionItemResponse } from "@/types/interaction.types";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

describe("EntityInteractionsView Component", () => {
    const mockInteractions: InteractionItemResponse[] = [
        {
            id: "interaction-1",
            user: {
                id: "user-1",
                username: "alice",
                fullname: "Alice Wonderland",
                avatar: "https://example.com/alice.jpg",
            },
            comment: {
                id: "comment-1",
                content: "Bu film bir başyapıt!",
                date: "2026-09-06T12:00:00Z",
            },
            rating: 10,
            isLiked: true,
            likesCount: 5,
            replyCount: 2,
        },
        {
            id: "interaction-2",
            user: {
                id: "user-2",
                username: "bob",
                fullname: "Bob Marley",
                avatar: "https://example.com/bob.jpg",
            },
            comment: {
                id: "comment-2",
                content: "Görsel efektler çok iyiydi.",
                date: "2026-09-06T13:00:00Z",
            },
            rating: 8,
            isLiked: false,
            likesCount: 1,
            replyCount: 0,
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render initial loader when isLoading is true and interactions is empty", () => {
        const { getByTestId, queryByTestId } = render(
            <EntityInteractionsView
                type="movie"
                id="movie-1"
                interactions={[]}
                isLoading={true}
            />,
        );

        expect(getByTestId("entity-interactions-initial-loader")).toBeTruthy();
        expect(queryByTestId("entity-interactions-view")).toBeNull();
    });

    it("should render error state and trigger onRefresh when retry button is pressed", () => {
        const onRefresh = jest.fn();
        const { getByTestId, getByText } = render(
            <EntityInteractionsView
                type="movie"
                id="movie-1"
                interactions={[]}
                error={new Error("Network failure")}
                onRefresh={onRefresh}
            />,
        );

        expect(getByTestId("entity-interactions-error")).toBeTruthy();
        expect(getByText("comments.loadError")).toBeTruthy();

        fireEvent.press(getByTestId("entity-interactions-retry-button"));
        expect(onRefresh).toHaveBeenCalledTimes(1);
    });

    it("should render empty state when interactions array is empty and not loading", () => {
        const { getByTestId, getByText } = render(
            <EntityInteractionsView
                type="track"
                id="track-1"
                interactions={[]}
                isLoading={false}
            />,
        );

        expect(getByTestId("entity-interactions-empty")).toBeTruthy();
        expect(getByText("comments.emptyInteractionsTitle")).toBeTruthy();
        expect(getByText("comments.emptyInteractionsSubtitle")).toBeTruthy();
    });

    it("should render items correctly using DynamicList", () => {
        const { getByText } = render(
            <EntityInteractionsView
                type="movie"
                id="movie-1"
                interactions={mockInteractions}
            />,
        );

        expect(getByText("Bu film bir başyapıt!")).toBeTruthy();
        expect(getByText("Görsel efektler çok iyiydi.")).toBeTruthy();
        expect(getByText("Alice Wonderland")).toBeTruthy();
        expect(getByText("Bob Marley")).toBeTruthy();
    });

    it("should render footer loader when isFetchingNextPage is true", () => {
        const { getByTestId } = render(
            <EntityInteractionsView
                type="movie"
                id="movie-1"
                interactions={mockInteractions}
                isFetchingNextPage={true}
            />,
        );

        expect(getByTestId("entity-interactions-footer-loader")).toBeTruthy();
    });
});
