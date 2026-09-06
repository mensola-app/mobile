import { CommentId } from "@/types/common.types";
import {
    CommentThreadResponse,
    CreateReplyResponse,
    ToggleCommentLikeResponse,
} from "@/types/interaction.types";
import { client } from "../api/client";

const CommentService = {
    /**
     * Fetches a paginated, flat comment thread for the given commentId.
     * The backend resolves the interactionId internally so the caller
     * only needs to pass any commentId that belongs to the thread.
     */
    getCommentThread: async (
        commentId: CommentId,
        page = 1,
        limit = 20,
    ): Promise<CommentThreadResponse> => {
        return await client.get<CommentThreadResponse>(`/v1/comments/${commentId}`, {
            auth: true,
            params: { page, limit },
        });
    },

    /**
     * Toggles the like state of a comment for the authenticated user.
     * Returns the fresh isLiked flag and likeCount.
     */
    toggleCommentLike: async (commentId: CommentId): Promise<ToggleCommentLikeResponse> => {
        const url = `/v1/comments/${commentId}/like`;
        try {
            return await client.post<ToggleCommentLikeResponse>(
                url,
                {},
                { auth: true },
            );
        } catch (error: any) {
            console.error("[CommentService.toggleCommentLike] Request failed:", {
                url,
                commentId,
                status: error?.status ?? error?.statusCode,
                response: error?.data ?? error?.response ?? error,
                message: error?.message,
            });
            throw error;
        }
    },

    /**
     * Adds a reply to the specified comment within the same thread.
     */
    createReply: async (
        commentId: CommentId,
        content: string,
    ): Promise<CreateReplyResponse> => {
        return await client.post<CreateReplyResponse>(
            `/v1/comments/${commentId}/replies`,
            { content },
            { auth: true },
        );
    },
};

export { CommentService };
