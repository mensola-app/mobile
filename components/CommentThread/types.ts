import { CommentId } from "@/types/common.types";
import { CommentThreadItem } from "@/types/interaction.types";
import { UseCommentDetailReturn } from "@/hooks/comment/useCommentDetail";

/**
 * Navigation params passed to /comments/[commentId]
 */
export type CommentDetailParams = {
    commentId: string;
    /** Serialized InteractionItemResponse (the hero interaction) */
    interactionData?: string;
    /** Media context: poster/cover URL */
    mediaPoster?: string;
    /** Media title */
    mediaTitle?: string;
    /** Target type label: "movie" | "track" | "playlist" | "album" | "movieList" */
    mediaType?: string;
};

/** A comment item with optimistic like state for the local UI */
export type LocalCommentItem = CommentThreadItem & {
    _localLikeCount?: number;
    _localIsLiked?: boolean;
};

/** Reply target state – which comment the user is replying to */
export type ReplyTarget = {
    commentId: CommentId;
    username: string;
} | null;

/**
 * Props for the CommentThreadView presentation component
 */
export interface CommentThreadViewProps {
    mediaPoster?: string;
    mediaTitle?: string;
    mediaType?: string;
    thread: UseCommentDetailReturn;
}
