import React from "react";
import { render, act } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TrackDetailView from "./TrackDetailView";

jest.mock("@/services/track.service", () => ({
    TrackService: {
        getUserPlaylists: jest.fn().mockResolvedValue({ data: { items: [] } }),
        createOrUpdateInteraction: jest.fn().mockResolvedValue({ success: true }),
    },
}));

const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

const renderWithQueryClient = (ui: React.ReactElement) => {
    const queryClient = createTestQueryClient();
    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe("TrackDetailView Component", () => {
    const mockTrack = {
        id: "track-123",
        spotifyId: "spotify-123",
        title: "Starboy",
        image: "https://example.com/starboy.jpg",
        artists: [{ id: "artist-1", name: "The Weeknd" }],
        likesCount: 500,
        commentsCount: 25,
        isLiked: false,
        isFavorite: false,
        currentUserInteraction: null,
        interactions: [],
    };

    const mockRefetchAll = jest.fn();
    const mockToggleLike = jest.fn();
    const mockSubmitInteraction = jest.fn().mockResolvedValue(undefined);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders TrackDetailView with RefreshControl on ScrollView", async () => {
        const { UNSAFE_getByType } = renderWithQueryClient(
            <TrackDetailView
                trackDetails={mockTrack as any}
                isLoading={false}
                error=""
                refetchAll={mockRefetchAll}
                toggleLike={mockToggleLike}
                submitInteraction={mockSubmitInteraction}
            />
        );

        const refreshControl = UNSAFE_getByType(require("react-native").RefreshControl);
        expect(refreshControl).toBeTruthy();

        // Trigger onRefresh
        await act(async () => {
            await refreshControl.props.onRefresh();
        });

        expect(mockRefetchAll).toHaveBeenCalledTimes(1);
    });

    it("increments commentsCount badge directly when a new comment is submitted", async () => {
        const { getByText, UNSAFE_getByType } = renderWithQueryClient(
            <TrackDetailView
                trackDetails={mockTrack as any}
                isLoading={false}
                error=""
                refetchAll={mockRefetchAll}
                toggleLike={mockToggleLike}
                submitInteraction={mockSubmitInteraction}
            />
        );

        // Initial comment count badge is 25
        expect(getByText("25")).toBeTruthy();

        const InteractionSheet = require("@/components/Interaction").InteractionSheet;
        const sheet = UNSAFE_getByType(InteractionSheet);

        await act(async () => {
            await sheet.props.onSubmit({ rating: 8, comment: "Amazing track!", isLiked: true });
        });

        // Directly incremented to 26
        expect(getByText("26")).toBeTruthy();
        expect(mockSubmitInteraction).toHaveBeenCalledWith({
            rating: 8,
            comment: "Amazing track!",
            isLiked: true,
        });
    });
});
