import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import MovieListHero from "./MovieListHero";

jest.mock("@/utils/share", () => ({
    shareMovieList: jest.fn(),
}));

jest.mock("@/context/AuthContext", () => ({
    useGlobalUser: () => ({
        user: { id: "user-999", username: "currentuser" },
    }),
}));

jest.mock("@/hooks/user/useFollow", () => ({
    useFollow: () => ({
        followHandler: jest.fn(),
        unfollowHandler: jest.fn(),
        error: "",
    }),
}));

jest.mock("expo-router", () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

describe("MovieListHero Component", () => {
    const mockListDetails = {
        id: "list-123",
        title: "2024 Favori Filmlerim",
        description: "Bu listede 2024 yılının en harika yapımlarını derledim.",
        image: "https://example.com/banner.jpg",
        creatorId: "user-1",
        owners: [
            { id: "user-1", username: "enesc", fullname: "Enes C", avatar: "https://example.com/avatar.jpg" },
        ],
        isLiked: false,
        isSaved: true,
        likesCount: 42,
        savesCount: 15,
        currentUserInteraction: null,
    };

    it("should render list title, creator name, description, and 4 badges correctly", () => {
        const { getByText } = render(
            <MovieListHero
                listDetails={mockListDetails as any}
                moviesCount={12}
                commentsCount={8}
                toggleLike={() => {}}
                toggleSave={() => {}}
            />
        );

        expect(getByText("2024 Favori Filmlerim")).toBeTruthy();
        expect(getByText("Enes C")).toBeTruthy();
        expect(getByText("Bu listede 2024 yılının en harika yapımlarını derledim.")).toBeTruthy();

        // Check 4 Badges
        expect(getByText("12")).toBeTruthy();
        expect(getByText("42")).toBeTruthy();
        expect(getByText("8")).toBeTruthy();
        expect(getByText("15")).toBeTruthy();
    });

    it("should prioritize listDetails.movieCount over moviesCount prop for total count", () => {
        const { getByText } = render(
            <MovieListHero
                listDetails={{ ...mockListDetails, movieCount: 50 } as any}
                moviesCount={18}
                commentsCount={8}
                toggleLike={() => {}}
                toggleSave={() => {}}
            />
        );

        expect(getByText("50")).toBeTruthy();
    });

    it("should trigger toggleSave and toggleLike when action buttons are pressed", () => {
        const toggleLikeMock = jest.fn();
        const toggleSaveMock = jest.fn();
        const onCommentPressMock = jest.fn();

        const { getByText, getAllByText } = render(
            <MovieListHero
                listDetails={mockListDetails as any}
                moviesCount={12}
                commentsCount={8}
                toggleLike={toggleLikeMock}
                toggleSave={toggleSaveMock}
                onCommentPress={onCommentPressMock}
            />
        );

        // ActionButton icons (index 1 because index 0 is badge icon)
        fireEvent.press(getAllByText("bookmark")[1]);
        expect(toggleSaveMock).toHaveBeenCalledTimes(1);

        fireEvent.press(getAllByText("heart")[1]);
        expect(toggleLikeMock).toHaveBeenCalledTimes(1);

        fireEvent.press(getByText("star"));
        expect(onCommentPressMock).toHaveBeenCalledTimes(1);
    });

    it("should return null when listDetails is null", () => {
        const { queryByText } = render(
            <MovieListHero
                listDetails={null}
                moviesCount={0}
                toggleLike={() => {}}
            />
        );

        expect(queryByText("2024 Favori Filmlerim")).toBeNull();
    });
});
