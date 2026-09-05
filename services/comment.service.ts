import { CommentId } from "@/types/common.types";
import { CommentThreadResponse, ToggleCommentLikeResponse } from "@/types/interaction.types";
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
     * Returns the fresh isLikedByMe flag and likeCount.
     */
    toggleCommentLike: async (commentId: CommentId): Promise<ToggleCommentLikeResponse> => {
        return await client.post<ToggleCommentLikeResponse>(
            `/v1/comments/${commentId}/like`,
            {},
            { auth: true },
        );
    },
};

export { CommentService };
