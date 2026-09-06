import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import InteractionView from "./index";
import { CommentService } from "@/services/comment.service";

const mockRouterPush = jest.fn();

jest.mock("expo-router", () => ({
    useRouter: () => ({
        push: mockRouterPush,
    }),
}));

jest.mock("@/services/comment.service", () => ({
    CommentService: {
        toggleCommentLike: jest.fn(),
    },
}));

const mockGlobalUser = {
    user: { id: "user-test", username: "tester" },
    token: "valid-token",
};

jest.mock("@/context/AuthContext", () => ({
    useGlobalUser: () => mockGlobalUser,
}));

describe("InteractionView Component", () => {
    const mockData = {
        id: "int-123",
        user: {
            id: "user-456",
            username: "johndoe",
            fullname: "John Doe",
            avatar: "https://example.com/avatar.jpg",
        },
        comment: {
            id: "comment-789",
            content: "Bu gerçekten harika bir filmdi!",
            date: "2026-08-10T12:00:00Z",
        },
        rating: 9,
        isLiked: true,
        likesCount: 15,
        replyCount: 3,
    };

    beforeEach(() => {
        mockRouterPush.mockClear();
        jest.clearAllMocks();
    });

    it("should render user info and comment content correctly", () => {
        const { getByText } = render(<InteractionView data={mockData} />);

        expect(getByText("John Doe")).toBeTruthy();
        expect(getByText("@johndoe")).toBeTruthy();
        expect(getByText("Bu gerçekten harika bir filmdi!")).toBeTruthy();
        expect(getByText("15")).toBeTruthy();
        expect(getByText("3")).toBeTruthy();
    });

    it("should navigate to user profile when user card is pressed", () => {
        const { getByText } = render(<InteractionView data={mockData} />);

        fireEvent.press(getByText("John Doe"));

        expect(mockRouterPush).toHaveBeenCalledWith({
            pathname: "/users/[userId]",
            params: { userId: "user-456" },
        });
    });

    it("should not navigate to comment thread when interaction card is disabled", () => {
        const { getByText } = render(<InteractionView data={mockData} disabled={true} />);

        fireEvent.press(getByText("Bu gerçekten harika bir filmdi!"));

        expect(mockRouterPush).not.toHaveBeenCalled();
    });

    it("should navigate to comment thread when interaction card is pressed", () => {
        const { getByText } = render(<InteractionView data={mockData} />);

        fireEvent.press(getByText("Bu gerçekten harika bir filmdi!"));

        expect(mockRouterPush).toHaveBeenCalledWith({
            pathname: "/comments/[commentId]",
            params: {
                commentId: "comment-789",
                interactionData: JSON.stringify(mockData),
            },
        });
    });

    it("should fall back to username when fullname is missing", () => {
        const dataWithoutFullname = {
            ...mockData,
            user: {
                ...mockData.user,
                fullname: "",
            },
        };

        const { getAllByText } = render(<InteractionView data={dataWithoutFullname} />);

        expect(getAllByText("johndoe").length).toBeGreaterThan(0);
    });

    it("should call onLike prop when like button is pressed", () => {
        const onLikeMock = jest.fn();
        const { getByText } = render(
            <InteractionView data={mockData} onLike={onLikeMock} />,
        );

        fireEvent.press(getByText("15"));

        expect(onLikeMock).toHaveBeenCalledWith("comment-789");
    });

    it("should toggle like with CommentService when onLike prop is not provided", async () => {
        (CommentService.toggleCommentLike as jest.Mock).mockResolvedValueOnce({
            success: true,
            isLiked: false,
            likeCount: 14,
        });

        const { getByText } = render(<InteractionView data={mockData} />);

        fireEvent.press(getByText("15"));

        await waitFor(() => {
            expect(CommentService.toggleCommentLike).toHaveBeenCalledWith("comment-789");
        });
    });
});
