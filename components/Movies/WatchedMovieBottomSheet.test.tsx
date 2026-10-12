import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import WatchedMovieBottomSheet from "./WatchedMovieBottomSheet";

const mockHistory = [
    { id: "wm-1", movieId: "movie-1", userId: "user-1", watchedAt: "2026-10-10T12:00:00Z" },
    { id: "wm-2", movieId: "movie-1", userId: "user-1", watchedAt: "2026-09-01T12:00:00Z" },
];

const mockMarkAsWatched = jest.fn();
const mockUpdateWatchedAt = jest.fn();
const mockDeleteWatchedEntry = jest.fn();
const mockGetWatchedHistory = jest.fn();

jest.mock("@/hooks/movie/useWatched", () => ({
    useWatched: () => ({
        markAsWatched: mockMarkAsWatched,
        updateWatchedAt: mockUpdateWatchedAt,
        deleteWatchedEntry: mockDeleteWatchedEntry,
        getWatchedHistoryByMovieId: mockGetWatchedHistory,
        isLoading: false,
    }),
}));

describe("WatchedMovieBottomSheet Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetWatchedHistory.mockResolvedValue(mockHistory);
    });

    it("renders watched history list and add section by default", async () => {
        const { getByText } = render(
            <WatchedMovieBottomSheet
                isVisible={true}
                onClose={jest.fn()}
                movieId="movie-1"
                movieTitle="Inception"
                onAdded={jest.fn()}
                onDeleted={jest.fn()}
            />
        );

        await waitFor(() => {
            expect(mockGetWatchedHistory).toHaveBeenCalledWith("movie-1");
        });

        // Add section should be visible
        expect(getByText("Inception")).toBeTruthy();
    });

    it("enters edit mode automatically when initialEditingRecordId is provided", async () => {
        const { getByText } = render(
            <WatchedMovieBottomSheet
                isVisible={true}
                onClose={jest.fn()}
                movieId="movie-1"
                movieTitle="Inception"
                initialEditingRecordId="wm-1"
                onAdded={jest.fn()}
                onDeleted={jest.fn()}
            />
        );

        await waitFor(() => {
            expect(mockGetWatchedHistory).toHaveBeenCalled();
        });

        // Update button should be present in edit mode
        await waitFor(() => {
            const updateBtn = getByText("movies.detail.watchedHistory.update");
            expect(updateBtn).toBeTruthy();
        });
    });

    it("updates record date when update is submitted", async () => {
        mockUpdateWatchedAt.mockResolvedValue({
            data: { id: "wm-1", movieId: "movie-1", userId: "user-1", watchedAt: "2026-10-12T12:00:00Z" },
        });
        const onUpdatedMock = jest.fn();

        const { getByText } = render(
            <WatchedMovieBottomSheet
                isVisible={true}
                onClose={jest.fn()}
                movieId="movie-1"
                movieTitle="Inception"
                initialEditingRecordId="wm-1"
                onAdded={jest.fn()}
                onUpdated={onUpdatedMock}
                onDeleted={jest.fn()}
            />
        );

        await waitFor(() => {
            expect(getByText("movies.detail.watchedHistory.update")).toBeTruthy();
        });

        fireEvent.press(getByText("movies.detail.watchedHistory.update"));

        await waitFor(() => {
            expect(mockUpdateWatchedAt).toHaveBeenCalledWith("wm-1", expect.any(String));
            expect(onUpdatedMock).toHaveBeenCalled();
        });
    });
});
