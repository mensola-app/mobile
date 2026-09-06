import React from "react";
import { renderHook, waitFor, act } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCommentDetail } from "./useCommentDetail";
import { CommentService } from "@/services/comment.service";
import { CommentId } from "@/types/common.types";

jest.mock("@/services/comment.service", () => ({
    CommentService: {
        getCommentThread: jest.fn(),
        toggleCommentLike: jest.fn(),
        createReply: jest.fn(),
    },
}));

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

const mockGlobalUser = {
    user: { id: "user-me", username: "tester" },
    token: "valid-token",
};
jest.mock("@/context/AuthContext", () => ({
    useGlobalUser: () => mockGlobalUser,
}));

describe("useCommentDetail hook", () => {
    let queryClient: QueryClient;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const mockRootComment = {
        id: "comment-1",
        interactionId: "interaction-100",
        parentId: null,
        content: "Root discussion point",
        createdAt: "2026-09-06T10:00:00Z",
        likeCount: 5,
        isLiked: false,
        user: { id: "user-1", username: "alice", avatar: null },
    };

    const mockReply = {
        id: "comment-2",
        interactionId: "interaction-100",
        parentId: "comment-1",
        content: "First reply to root",
        createdAt: "2026-09-06T10:05:00Z",
        likeCount: 2,
        isLiked: false,
        user: { id: "user-2", username: "bob", avatar: null },
    };

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        });
        jest.clearAllMocks();
    });

    it("fetches comment thread and properly separates rootComment and replies", async () => {
        (CommentService.getCommentThread as jest.Mock).mockResolvedValueOnce({
            success: true,
            data: {
                interactionId: "interaction-100",
                comments: [mockRootComment, mockReply],
                pagination: { total: 2, page: 1, limit: 20, hasMore: false },
            },
        });

        const { result } = renderHook(
            () => useCommentDetail("comment-1" as CommentId),
            { wrapper },
        );

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(CommentService.getCommentThread).toHaveBeenCalledWith("comment-1", 1, 20);
        expect(result.current.rootComment?.id).toBe("comment-1");
        expect(result.current.rootCommentId).toBe("comment-1");
        // Replies must not include root comment (duplication fix)
        expect(result.current.replies).toHaveLength(1);
        expect(result.current.replies[0].id).toBe("comment-2");
        expect(result.current.hasMore).toBe(false);
    });

    it("handles optimistic toggleLike correctly", async () => {
        (CommentService.getCommentThread as jest.Mock).mockResolvedValueOnce({
            success: true,
            data: {
                interactionId: "interaction-100",
                comments: [mockRootComment, mockReply],
                pagination: { total: 2, page: 1, limit: 20, hasMore: false },
            },
        });

        (CommentService.toggleCommentLike as jest.Mock).mockResolvedValueOnce({
            success: true,
            isLiked: true,
            likeCount: 3,
            commentId: "comment-2",
        });

        const { result } = renderHook(
            () => useCommentDetail("comment-1" as CommentId),
            { wrapper },
        );

        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => {
            result.current.toggleLike("comment-2");
        });

        // Optimistic update
        expect(result.current.likeOverrides["comment-2"]).toEqual({
            isLiked: true,
            likeCount: 3,
        });

        await waitFor(() =>
            expect(CommentService.toggleCommentLike).toHaveBeenCalledWith("comment-2"),
        );
    });

    it("handles addReply and invalidates query cache", async () => {
        (CommentService.getCommentThread as jest.Mock).mockResolvedValue({
            success: true,
            data: {
                interactionId: "interaction-100",
                comments: [mockRootComment],
                pagination: { total: 1, page: 1, limit: 20, hasMore: false },
            },
        });

        (CommentService.createReply as jest.Mock).mockResolvedValueOnce({
            success: true,
            data: mockReply,
        });

        const { result } = renderHook(
            () => useCommentDetail("comment-1" as CommentId),
            { wrapper },
        );

        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => {
            result.current.setInputText("New test reply");
        });

        let success = false;
        await act(async () => {
            success = await result.current.addReply();
        });

        expect(success).toBe(true);
        expect(CommentService.createReply).toHaveBeenCalledWith(
            "comment-1",
            "New test reply",
        );
        expect(result.current.inputText).toBe("");
    });

    it("triggers fetchNextPage when onEndReached is called and hasNextPage is true", async () => {
        (CommentService.getCommentThread as jest.Mock).mockResolvedValueOnce({
            success: true,
            data: {
                interactionId: "interaction-100",
                comments: [mockRootComment],
                pagination: { total: 25, page: 1, limit: 20, hasMore: true },
            },
        });

        const { result } = renderHook(
            () => useCommentDetail("comment-1" as CommentId),
            { wrapper },
        );

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.hasMore).toBe(true);

        (CommentService.getCommentThread as jest.Mock).mockResolvedValueOnce({
            success: true,
            data: {
                interactionId: "interaction-100",
                comments: [mockReply],
                pagination: { total: 25, page: 2, limit: 20, hasMore: false },
            },
        });

        act(() => {
            result.current.onEndReached();
        });

        await waitFor(() =>
            expect(CommentService.getCommentThread).toHaveBeenCalledWith("comment-1", 2, 20),
        );
    });
});
