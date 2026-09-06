import { IPlaylistItemOption } from "@/hooks/playlist/useUserPlaylists";
import { PlaylistId, TrackId } from "@/types/common.types";
import { InteractionItemResponse, UpsertInteractionSummary } from "@/types/interaction.types";
import { TrackDetails } from "@/types/track.types";

export interface ITrackHeroProps {
    trackDetails: TrackDetails | null;
    toggleLike: () => void;
    onCommentPress?: () => void;
    onAddPress?: () => void;
    onPlayPress?: () => void;
    commentsCount?: number;
}

export interface ITrackDetailViewProps {
    trackDetails: TrackDetails | null;
    isLoading: boolean;
    error: string;
    refetchAll?: () => void;
    toggleLike: () => void;
    submitInteraction: (data: UpsertInteractionSummary) => Promise<void>;
}

export interface AddToPlaylistBottomSheetProps {
    isVisible: boolean;
    onClose: () => void;
    trackId?: TrackId;
}

export interface AddToPlaylistSheetItemProps {
    item: IPlaylistItemOption;
    onToggle: (playlistId: PlaylistId) => void;
    isLoading?: boolean;
}

export interface LatestCommentsProps {
    targetId?: string;
    trackTitle?: string;
    interactions: InteractionItemResponse[];
    commentsCount?: number;
    onRateReviewPress?: () => void;
}
