import { ArtistService } from "@/services/artist.service";
import { ArtistAlbumItem } from "@/types/artist.types";
import { useInfiniteQuery } from "@tanstack/react-query";

interface UseArtistDiscographyOptions {
    artistId: string;
    limit?: number;
    enabled?: boolean;
}

export const useArtistDiscography = ({
    artistId,
    limit = 10,
    enabled = true,
}: UseArtistDiscographyOptions) => {
    const {
        data,
        fetchNextPage,
        refetch,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isRefetching,
        isError,
        error,
    } = useInfiniteQuery({
        queryKey: ["artist", artistId, "discography", limit],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await ArtistService.getArtistDiscography(artistId, {
                page: pageParam,
                limit,
            });
            const responseData = (res as any).data ? (res as any).data : res;
            return responseData;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            if (!lastPage?.hasMore) {
                return undefined;
            }
            return allPages.length + 1;
        },
        enabled: Boolean(artistId) && (enabled ?? true),
        staleTime: 1000 * 60 * 30, // 30 mins
    });

    const albums: ArtistAlbumItem[] =
        data?.pages.flatMap((page) => page?.items ?? []) ?? [];
    const totalResults = data?.pages[0]?.totalResults ?? 0;

    return {
        albums,
        totalResults,
        fetchNextPage,
        refetch,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isRefetching,
        isError,
        error,
    };
};
