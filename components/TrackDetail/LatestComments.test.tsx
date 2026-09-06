import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import LatestComments from "./LatestComments";

const mockRouterPush = jest.fn();

jest.mock("expo-router", () => ({
    useRouter: () => ({
        push: mockRouterPush,
    }),
    useLocalSearchParams: () => ({ trackId: "track-123" }),
}));

describe("TrackDetail LatestComments Component", () => {
    beforeEach(() => {
        mockRouterPush.mockClear();
    });

    it("should render empty state and trigger onRateReviewPress when interaction array is empty", () => {
        const onRateReviewPress = jest.fn();
        const { getByText, getByTestId } = render(
            <LatestComments interactions={[]} onRateReviewPress={onRateReviewPress} />
        );

        expect(getByText("tracks.detail.emptyReviewsText")).toBeTruthy();
        expect(getByText("tracks.detail.rateAndReview")).toBeTruthy();

        fireEvent.press(getByTestId("tracks-rate-review-button"));
        expect(onRateReviewPress).toHaveBeenCalledTimes(1);
    });

    it("should render comments, show See All button, and navigate on press", () => {
        const mockInteractions = [
            {
                id: "int-1",
                user: { id: "user-1", username: "bob", fullname: "Bob", avatar: "https://example.com/avatar.jpg" },
                comment: { id: "c-1", content: "Harika bir parça!", date: "2026-08-11T10:00:00Z" },
                rating: 8,
                isLiked: true,
            },
        ];

        const { getByText, getByTestId } = render(
            <LatestComments interactions={mockInteractions as any} commentsCount={1} />
        );

        expect(getByText("tracks.detail.latestComments")).toBeTruthy();
        expect(getByText("Harika bir parça!")).toBeTruthy();
        expect(getByText("tracks.detail.seeAll")).toBeTruthy();

        fireEvent.press(getByTestId("tracks-see-all-button"));
        expect(mockRouterPush).toHaveBeenCalledWith({
            pathname: "/comments/[type]/[id]",
            params: { type: "track", id: "track-123" },
        });
    });
});
