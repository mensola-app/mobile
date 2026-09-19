import React from "react";
import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useArtistDiscography } from "../useArtistDiscography";
import { ArtistService } from "@/services/artist.service";

jest.mock("@/services/artist.service", () => ({
    ArtistService: {
        getArtistDiscography: jest.fn(),
    },
}));

describe("useArtistDiscography", () => {
    let queryClient: QueryClient;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const mockDiscographyResponse = {
        data: {
            items: [
                {
                    id: "album-1",
                    spotifyId: "album-1",
                    title: "Album 1",
                    name: "Album 1",
                    image: "https://example.com/album1.jpg",
                    releaseYear: 2024,
                    totalTracks: 10,
                    artists: [{ id: "artist-1", name: "Artist" }],
                },
            ],
            page: 1,
            limit: 10,
            hasMore: true,
            totalResults: 20,
            totalPages: 2,
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                    gcTime: 0,
                },
            },
        });
    });

    it("fetches first page of discography on mount", async () => {
        (ArtistService.getArtistDiscography as jest.Mock).mockResolvedValue(mockDiscographyResponse);

        const { result } = renderHook(() => useArtistDiscography({ artistId: "artist-1" }), {
            wrapper,
        });

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.albums).toHaveLength(1);
        expect(result.current.albums[0].title).toBe("Album 1");
        expect(result.current.totalResults).toBe(20);
        expect(result.current.hasNextPage).toBe(true);
        expect(ArtistService.getArtistDiscography).toHaveBeenCalledWith("artist-1", {
            page: 1,
            limit: 10,
        });
    });
});
