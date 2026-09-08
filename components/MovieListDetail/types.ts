import { InteractionItemResponse } from "@/types/interaction.types";
import { IMovie, MovieListDetails } from "@/types/movie.types";
import { FollowUsersResponseDataItem } from "@/types/user.types";

export interface IMovieListHeroProps {
    listDetails: MovieListDetails | null;
    moviesCount: number;
    movies?: IMovie[];
    commentsCount?: number;
    toggleLike: () => void;
    toggleSave?: () => void;
    onCommentPress?: () => void;
    onSharePress?: () => void;
}

export type IMovieListHeaderProps = IMovieListHeroProps;

export interface IMovieListDetailViewProps {
    listDetails: MovieListDetails | null;
    movies: IMovie[];
    loadMoreMovies: () => void;
    hasNextMoviePage: boolean;
    isFetchingNextMoviePage: boolean;
    interactions: InteractionItemResponse[];
    isLoading: boolean;
    isRefetching: boolean;
    error: string;
    refetchAll: () => void;
    loadMoreInteractions: () => void;
    hasNextInteractionsPage?: boolean;
    isFetchingNextInteractionPage?: boolean;
    toggleLike: () => void;
    toggleSave?: () => void;
    submitInteraction: (data: { rating?: number; comment?: string; isLiked?: boolean }) => Promise<void>;
}

export interface IMovieListOwnersBottomSheetProps {
    isVisible: boolean;
    onClose: () => void;
    owners: FollowUsersResponseDataItem[];
    creatorId?: string;
}
