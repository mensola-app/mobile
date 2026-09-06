import React from "react";
import { renderHook, waitFor, act } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
    useEntityInteractions,
    getEntityInteractionFetcher,
} from "./useEntityInteractions";
import { MovieService } from "@/services/movie.service";
import { TrackService } from "@/services/track.service";
import { AlbumService } from "@/services/album.service";
import { PlaylistService } from "@/services/playlist.service";

jest.mock("@/services/movie.service", () => ({
    MovieService: {
        getMovieInteractions: jest.fn(),
        getMovieListInteractions: jest.fn(),
    },
}));

jest.mock("@/services/track.service", () => ({
    TrackService: {
        getTrackInteractions: jest.fn(),
    },
}));

jest.mock("@/services/album.service", () => ({
    AlbumService: {
        getAlbumInteractions: jest.fn(),
    },
}));

jest.mock("@/services/playlist.service", () => ({
    PlaylistService: {
        getPlaylistInteractions: jest.fn(),
    },
}));

describe("useEntityInteractions hook", () => {
    let queryClient: QueryClient;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                    gcTime: 0,
                },
            },
        });
        jest.clearAllMocks();
    });

    describe("getEntityInteractionFetcher", () => {
        it("should return correct fetcher for movie", () => {
            expect(getEntityInteractionFetcher("movie")).toBe(MovieService.getMovieInteractions);
            expect(getEntityInteractionFetcher("movies")).toBe(MovieService.getMovieInteractions);
        });

        it("should return correct fetcher for track", () => {
            expect(getEntityInteractionFetcher("track")).toBe(TrackService.getTrackInteractions);
            expect(getEntityInteractionFetcher("tracks")).toBe(TrackService.getTrackInteractions);
        });

        it("should return correct fetcher for album", () => {
            expect(getEntityInteractionFetcher("album")).toBe(AlbumService.getAlbumInteractions);
        });

        it("should return correct fetcher for playlist", () => {
            expect(getEntityInteractionFetcher("playlist")).toBe(PlaylistService.getPlaylistInteractions);
        });

        it("should return null for undefined or unsupported type", () => {
            expect(getEntityInteractionFetcher(undefined)).toBeNull();
            expect(getEntityInteractionFetcher("unsupported")).toBeNull();
        });
    });

    describe("Fetching data", () => {
        it("should fetch movie interactions successfully", async () => {
            const mockInteractions = [
                {
                    id: "int-1",
                    user: { id: "u-1", username: "alice" },
                    comment: { id: "c-1", content: "Harika bir film!", date: "2026-09-06" },
                    rating: 9,
                    isLiked: true,
                    likesCount: 3,
                },
            ];

            (MovieService.getMovieInteractions as jest.Mock).mockResolvedValueOnce({
                status: "success",
                data: {
                    items: mockInteractions,
                    page: 1,
                    limit: 18,
                    hasMore: false,
                },
            });

            const { result } = renderHook(() => useEntityInteractions("movie", "movie-123"), {
                wrapper,
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(MovieService.getMovieInteractions).toHaveBeenCalledWith({
                targetId: "movie-123",
                page: 1,
                limit: 18,
            });
            expect(result.current.interactions).toHaveLength(1);
            expect(result.current.interactions[0].comment.content).toBe("Harika bir film!");
            expect(result.current.hasNextPage).toBe(false);
        });

        it("should fetch track interactions successfully and support pagination", async () => {
            const page1Items = [
                {
                    id: "int-track-1",
                    user: { id: "u-2", username: "bob" },
                    comment: { id: "c-2", content: "Muazzam melodi!", date: "2026-09-06" },
                    rating: 10,
                },
            ];

            const page2Items = [
                {
                    id: "int-track-2",
                    user: { id: "u-3", username: "charlie" },
                    comment: { id: "c-3", content: "Solo kısmı harika.", date: "2026-09-06" },
                    rating: 8,
                },
            ];

            (TrackService.getTrackInteractions as jest.Mock)
                .mockResolvedValueOnce({
                    status: "success",
                    data: {
                        items: page1Items,
                        page: 1,
                        limit: 18,
                        hasMore: true,
                    },
                })
                .mockResolvedValueOnce({
                    status: "success",
                    data: {
                        items: page2Items,
                        page: 2,
                        limit: 18,
                        hasMore: false,
                    },
                });

            const { result } = renderHook(() => useEntityInteractions("track", "track-456"), {
                wrapper,
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.interactions).toHaveLength(1);
            expect(result.current.hasNextPage).toBe(true);

            await act(async () => {
                await result.current.fetchNextPage();
            });

            await waitFor(() => {
                expect(result.current.interactions).toHaveLength(2);
            });

            expect(TrackService.getTrackInteractions).toHaveBeenCalledTimes(2);
            expect(result.current.interactions[1].comment.content).toBe("Solo kısmı harika.");
            expect(result.current.hasNextPage).toBe(false);
        });

        it("should return empty list when id is not provided", () => {
            const { result } = renderHook(() => useEntityInteractions("movie", undefined), {
                wrapper,
            });

            expect(result.current.interactions).toEqual([]);
            expect(MovieService.getMovieInteractions).not.toHaveBeenCalled();
        });
    });
});
