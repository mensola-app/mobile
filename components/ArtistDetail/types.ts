import { ArtistDetailResponse } from "@/types/artist.types";

export interface IArtistDetailViewProps {
    artistDetails: ArtistDetailResponse | null;
    isLoading: boolean;
    isRefreshing?: boolean;
    error: Error | null;
    isFollowLoading: boolean;
    onToggleFollow: () => void;
    onRefetch: () => void | Promise<void>;
}
