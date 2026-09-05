import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import StatDetailView from "./StatDetailView";

describe("StatDetailView Component Unit Tests", () => {
    const mockRefetch = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
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
});
