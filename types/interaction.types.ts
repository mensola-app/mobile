import { ApiResponse } from "./api";
import {
    AlbumId,
    CommentId,
    InteractionId,
    MovieId,
    MovieListId,
    PaginationQueries,
    PaginationResponse,
    PlaylistId,
    TrackId,
    UserId,
} from "./common.types";
import { IUser } from "./user.types";

export interface IComment {
    id: CommentId;
    userId: UserId;
    interactionId: InteractionId;
    parentId?: CommentId;
    content: string;
    createdAt?: Date | string;
}
export type CommentSummary = Pick<IComment, "id" | "content"> & { date: IComment["createdAt"] };
export type InteractionTargetId = MovieId | TrackId | PlaylistId | AlbumId | MovieListId;
export type InteractionTargetTypes = "movie" | "track" | "album" | "playlist" | "movieList";
export interface IInteraction {
    id: InteractionId;
    userId: UserId;
    targetId: InteractionTargetId;
    targetType: InteractionTargetTypes;
    isLiked?: boolean;
    rating?: number;
    comment?: CommentSummary;
    likesCount?: number;
    replyCount?: number;
    interactedAt?: Date | string;
    updatedAt?: Date | string;
}
export type InteractionSummary = Pick<
    IInteraction,
    "id" | "rating" | "isLiked" | "comment" | "likesCount" | "replyCount"
>;
export type UpsertInteractionSummary = { rating?: number; comment?: string; isLiked?: boolean };
export type UpsertInteractionRequest = {
    targetId: InteractionTargetId;
    interaction: UpsertInteractionSummary;
};
export type UpsertInteractionResponse = InteractionSummary & {
    interactedAt?: IInteraction["interactedAt"];
    updatedAt?: IInteraction["updatedAt"];
};
export type InteractionsRequest = PaginationQueries & { targetId: InteractionTargetId };
export type InteractionItemResponse = Pick<IInteraction, "id" | "rating" | "isLiked" | "likesCount" | "replyCount"> & {
    user: IUser;
    comment: CommentSummary;
    likeCount?: number;
    isLikedByMe?: boolean;
};
export type InteractionResponseData = PaginationResponse & { items: InteractionItemResponse[] };
export type InteractionsResponse = ApiResponse<InteractionResponseData>;

// ─── Comment Thread ───────────────────────────────────────────────────────────

export type CommentThreadUser = {
    id: UserId;
    username: string;
    avatar: string | null;
};

export type CommentThreadItem = {
    id: CommentId;
    interactionId: InteractionId;
    parentId: CommentId | null;
    content: string;
    createdAt: Date | string;
    user: CommentThreadUser;
    likeCount: number;
    isLiked: boolean;
};

export type CommentThreadPagination = {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
};

export type CommentThreadResponseData = {
    interactionId: InteractionId;
    comments: CommentThreadItem[];
    pagination: CommentThreadPagination;
};

export type CommentThreadResponse = ApiResponse<CommentThreadResponseData>;

// ─── Toggle Comment Like ──────────────────────────────────────────────────────

export type ToggleCommentLikeResponseData = {
    commentId: CommentId;
    isLiked: boolean;
    likeCount: number;
};

export type ToggleCommentLikeResponse = ApiResponse<ToggleCommentLikeResponseData>;

export type CreateReplyResponse = ApiResponse<CommentThreadItem>;


