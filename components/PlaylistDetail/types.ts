import { InteractionItemResponse, UpsertInteractionRequest, UpsertInteractionSummary } from "@/types/interaction.types";
import { PlaylistDetails } from "@/types/playlist.types";
import { ITrack } from "@/types/track.types";
import { FollowUsersResponseDataItem } from "@/types/user.types";

export interface IPlaylistHeroProps {
    playlistDetails: PlaylistDetails;
    tracksCount: number;
    tracks?: ITrack[];
    commentsCount?: number;
    toggleLike: () => void;
    onCommentPress?: () => void;
    onSharePress?: () => void;
}
export interface IPlaylistDetailViewProps {
    playlistDetails: PlaylistDetails;
    tracks: ITrack[];
    loadMoreTracks: () => void;
    hasNextTrackPage: boolean;
    isFetchingNextTrackPage: boolean;
    interactions: InteractionItemResponse[];
    submitInteraction: (data: UpsertInteractionSummary) => Promise<void>;
    loadMoreInteractions: () => void;
    hasNextInteractionsPage: boolean;
    isFetchingNextInteractionPage: boolean;
    isLoading: boolean;
    isRefetching: boolean;
    error: string;
    refetchAll: () => void;
    toggleLike: () => void;
}
export interface IPlaylistOwnersBottomSheetProps {
    isVisible: boolean;
    onClose: () => void;
    owners: FollowUsersResponseDataItem[];
}
