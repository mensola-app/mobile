import React from "react";
import { render } from "@testing-library/react-native";
import CommentThreadView from "./CommentThreadView";
import { UseCommentDetailReturn } from "@/hooks/comment/useCommentDetail";

jest.mock("expo-router", () => ({
    useRouter: () => ({ push: jest.fn() }),
}));

describe("CommentThreadView Component", () => {
    const mockThread: UseCommentDetailReturn = {
        page: 1,
        limit: 20,
        hasMore: false,
        loading: false,
        loadingMore: false,
        isRefetching: false,
        isError: false,
        error: null,
        fetchFirstPage: jest.fn(),
        fetchNextPage: jest.fn(),
        fetchMore: jest.fn(),
        onEndReached: jest.fn(),
        refetch: jest.fn(),

        allComments: [
            {
                id: "comment-root",
                interactionId: "interaction-1",
                parentId: null,
                content: "Root comment text",
                createdAt: "2026-09-06T10:00:00Z",
                likeCount: 10,
                isLiked: false,
                user: { id: "user-1", username: "alice", avatar: null },
            },
            {
                id: "reply-1",
                interactionId: "interaction-1",
                parentId: "comment-root",
                content: "Reply text here",
                createdAt: "2026-09-06T10:05:00Z",
                likeCount: 3,
                isLiked: true,
                user: { id: "user-2", username: "bob", avatar: null },
            },
        ],
        rootComment: {
            id: "comment-root",
            interactionId: "interaction-1",
            parentId: null,
            content: "Root comment text",
            createdAt: "2026-09-06T10:00:00Z",
            likeCount: 10,
            isLiked: false,
            user: { id: "user-1", username: "alice", avatar: null },
        },
        rootCommentId: "comment-root",
        replies: [
            {
                id: "reply-1",
                interactionId: "interaction-1",
                parentId: "comment-root",
                content: "Reply text here",
                createdAt: "2026-09-06T10:05:00Z",
                likeCount: 3,
                isLiked: true,
                user: { id: "user-2", username: "bob", avatar: null },
                _localIsLiked: true,
                _localLikeCount: 3,
            },
        ],
        displayInteraction: {
            id: "interaction-1" as any,
            rating: 8.5,
            isLiked: false,
            likesCount: 10,
            replyCount: 1,
            user: {
                id: "user-1",
                username: "alice",
                fullname: "Alice",
                avatar: null,
            } as any,
            comment: {
                id: "comment-root",
                content: "Root comment text",
                date: "2026-09-06T10:00:00Z",
            },
        },
        heroLike: { isLiked: false, likeCount: 10 },
        likeOverrides: {},

        toggleLike: jest.fn(),
        handleHeroLike: jest.fn(),
        isLikePending: false,
        addReply: jest.fn().mockResolvedValue(true),
        isSending: false,
        replyTarget: null,
        setReplyTarget: jest.fn(),
        cancelReply: jest.fn(),
        inputText: "",
        setInputText: jest.fn(),
    };

    it("renders thread hero and reply list successfully", () => {
        const { getByText } = render(
            <CommentThreadView mediaTitle="Interstellar" mediaType="movie" thread={mockThread} />,
        );

        expect(getByText("Root comment text")).toBeTruthy();
        expect(getByText("Reply text here")).toBeTruthy();
    });

    it("renders empty state when replies array is empty", () => {
        const emptyThread: UseCommentDetailReturn = {
            ...mockThread,
            replies: [],
        };

        const { getByText } = render(<CommentThreadView thread={emptyThread} />);

        expect(getByText("comments.emptyTitle")).toBeTruthy();
    });
});
