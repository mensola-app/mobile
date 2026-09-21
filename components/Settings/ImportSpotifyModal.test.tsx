import React from "react";
import { render, fireEvent, waitFor, act, cleanup } from "@testing-library/react-native";
import { Animated } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ImportSpotifyModal from "./ImportSpotifyModal";
import { ImportService } from "@/services/import.service";

jest.mock("expo-keep-awake", () => ({
    activateKeepAwakeAsync: jest.fn().mockResolvedValue(undefined),
    deactivateKeepAwake: jest.fn().mockResolvedValue(undefined),
}));

const mockInvalidateQueries = jest.fn();
jest.mock("@tanstack/react-query", () => ({
    useQueryClient: () => ({
        invalidateQueries: mockInvalidateQueries,
    }),
}));

jest.mock("@/services/import.service", () => ({
    ImportService: {
        importSpotifyPlaylists: jest.fn(),
        getImportProgress: jest.fn(),
    },
}));

describe("ImportSpotifyModal", () => {
    const mockOnClose = jest.fn();
    const mockOnSuccess = jest.fn();

    beforeEach(async () => {
        jest.clearAllMocks();
        await AsyncStorage.clear();
        jest.spyOn(Animated, "timing").mockReturnValue({
            start: jest.fn((cb) => cb && cb({ finished: true })),
            stop: jest.fn(),
            reset: jest.fn(),
        } as any);
    });

    afterEach(() => {
        cleanup();
        jest.clearAllTimers();
    });

    it("renders input area and allows adding a valid playlist URL", async () => {
        const { getByPlaceholderText, getByText } = render(
            <ImportSpotifyModal
                isVisible={true}
                onClose={mockOnClose}
                onSuccess={mockOnSuccess}
            />,
        );

        const input = getByPlaceholderText("settings.spotifyImport.inputPlaceholder");
        const addButton = getByText("settings.spotifyImport.addButton");

        fireEvent.changeText(input, "https://open.spotify.com/playlist/5XzIwoEzc7KWg250ua37Ew");
        fireEvent.press(addButton);

        await waitFor(() => {
            expect(getByText("https://open.spotify.com/playlist/5XzIwoEzc7KWg250ua37Ew")).toBeTruthy();
        });
    });

    it("shows error when non-playlist Spotify URL is entered", async () => {
        const { getByPlaceholderText, getByText } = render(
            <ImportSpotifyModal
                isVisible={true}
                onClose={mockOnClose}
                onSuccess={mockOnSuccess}
            />,
        );

        const input = getByPlaceholderText("settings.spotifyImport.inputPlaceholder");
        const addButton = getByText("settings.spotifyImport.addButton");

        fireEvent.changeText(input, "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT");
        fireEvent.press(addButton);

        await waitFor(() => {
            expect(getByText("settings.spotifyImport.inputNotPlaylist")).toBeTruthy();
        });
    });

    it("starts import and transitions to progress screen", async () => {
        (ImportService.importSpotifyPlaylists as jest.Mock).mockResolvedValueOnce({
            jobId: "mock-spotify-job",
            status: "queued",
            totalItems: 1,
            type: "spotify",
        });

        (ImportService.getImportProgress as jest.Mock).mockResolvedValue({
            jobId: "mock-spotify-job",
            userId: "user-1",
            status: "processing",
            totalItems: 1,
            processedItems: 0,
            successCount: 0,
            failedCount: 0,
            playlistsCount: 0,
            tracksCount: 50,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        const { getByPlaceholderText, getByText } = render(
            <ImportSpotifyModal
                isVisible={true}
                onClose={mockOnClose}
                onSuccess={mockOnSuccess}
            />,
        );

        const input = getByPlaceholderText("settings.spotifyImport.inputPlaceholder");
        const addButton = getByText("settings.spotifyImport.addButton");

        fireEvent.changeText(input, "5XzIwoEzc7KWg250ua37Ew");
        fireEvent.press(addButton);

        const importButton = getByText("settings.spotifyImport.importButton");
        fireEvent.press(importButton);

        await waitFor(() => {
            expect(ImportService.importSpotifyPlaylists).toHaveBeenCalledWith(["5XzIwoEzc7KWg250ua37Ew"]);
        });
    });

    it("handles completed job status and calls onSuccess", async () => {
        jest.useFakeTimers();

        (ImportService.importSpotifyPlaylists as jest.Mock).mockResolvedValueOnce({
            jobId: "mock-completed-job",
            status: "queued",
            totalItems: 1,
            type: "spotify",
        });

        (ImportService.getImportProgress as jest.Mock).mockResolvedValue({
            jobId: "mock-completed-job",
            userId: "user-1",
            status: "completed",
            totalItems: 1,
            processedItems: 1,
            successCount: 1,
            failedCount: 0,
            playlistsCount: 1,
            tracksCount: 136,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        const { getByPlaceholderText, getByText, getAllByText } = render(
            <ImportSpotifyModal
                isVisible={true}
                onClose={mockOnClose}
                onSuccess={mockOnSuccess}
            />,
        );

        const input = getByPlaceholderText("settings.spotifyImport.inputPlaceholder");
        const addButton = getByText("settings.spotifyImport.addButton");

        fireEvent.changeText(input, "5XzIwoEzc7KWg250ua37Ew");
        fireEvent.press(addButton);

        const importButton = getByText("settings.spotifyImport.importButton");
        fireEvent.press(importButton);

        await waitFor(() => {
            expect(ImportService.importSpotifyPlaylists).toHaveBeenCalled();
        });

        act(() => {
            jest.advanceTimersByTime(2500);
        });

        await waitFor(() => {
            expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ["playlists"] });
            expect(mockOnSuccess).toHaveBeenCalled();
            expect(getAllByText("settings.spotifyImport.successTitle").length).toBeGreaterThan(0);
        });

        jest.useRealTimers();
    });
});
