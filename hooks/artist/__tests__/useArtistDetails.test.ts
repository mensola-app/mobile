import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useArtistDetails } from "../useArtistDetails";
import { ArtistService } from "@/services/artist.service";

jest.mock("@/services/artist.service", () => ({
    ArtistService: {
        getArtistDetails: jest.fn(),
        followArtist: jest.fn(),
        unfollowArtist: jest.fn(),
    },
}));

jest.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string, defaultVal?: string) => defaultVal || key,
    }),
}));

describe("useArtistDetails", () => {
    const mockArtistData = {
        id: "artist-1",
        spotifyId: "spotify-artist-1",
        name: "Test Artist",
        image: "https://example.com/artist.jpg",
        genres: ["rock"],
        followerCount: 100,
        isFollowing: false,
        topTracks: [],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("fetches artist details on mount", async () => {
        (ArtistService.getArtistDetails as jest.Mock).mockResolvedValue(mockArtistData);

        const { result } = renderHook(() => useArtistDetails("artist-1"));

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.details).toEqual(mockArtistData);
        expect(result.current.error).toBeNull();
    });

    it("handles refetch with isRefreshing state without toggling isLoading", async () => {
        (ArtistService.getArtistDetails as jest.Mock).mockResolvedValue(mockArtistData);

        const { result } = renderHook(() => useArtistDetails("artist-1"));

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        const updatedData = { ...mockArtistData, followerCount: 101 };
        (ArtistService.getArtistDetails as jest.Mock).mockResolvedValue(updatedData);

        let refetchPromise: Promise<void>;
        act(() => {
            refetchPromise = result.current.refetch();
        });

        // While refreshing, isRefreshing is true and isLoading stays false
        expect(result.current.isRefreshing).toBe(true);
        expect(result.current.isLoading).toBe(false);

        await act(async () => {
            await refetchPromise;
        });

        expect(result.current.isRefreshing).toBe(false);
        expect(result.current.details?.followerCount).toBe(101);
    });

    it("toggles follow with optimistic update", async () => {
        (ArtistService.getArtistDetails as jest.Mock).mockResolvedValue(mockArtistData);
        (ArtistService.followArtist as jest.Mock).mockResolvedValue({ success: true });

        const { result } = renderHook(() => useArtistDetails("artist-1"));

        await waitFor(() => {
            expect(result.current.details).toBeTruthy();
        });

        await act(async () => {
            await result.current.toggleFollow();
        });

        expect(result.current.details?.isFollowing).toBe(true);
        expect(result.current.details?.followerCount).toBe(101);
        expect(ArtistService.followArtist).toHaveBeenCalledWith("spotify-artist-1");
    });
});
