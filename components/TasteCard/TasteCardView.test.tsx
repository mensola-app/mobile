import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import TasteCardView from "./TasteCardView";

describe("TasteCardView Component", () => {
    const mockCardRef = { current: null };
    const mockOnClose = jest.fn();
    const mockOnShare = jest.fn();

    const mockUser = {
        id: "u1",
        username: "johndoe",
        fullname: "John Doe",
        avatar: "https://example.com/avatar.jpg",
    } as any;

    const mockMovies = [
        { id: "m1", title: "Inception", poster: "https://example.com/poster1.jpg" },
        { id: "m2", title: "Interstellar", poster: "https://example.com/poster2.jpg" },
        { id: "m3", title: "The Dark Knight", poster: "https://example.com/poster3.jpg" },
    ] as any;

    const mockTracks = [
        {
            id: "t1",
            title: "Starboy",
            image: "https://example.com/t1.jpg",
            artists: [{ id: "a1", name: "The Weeknd" }],
        },
        {
            id: "t2",
            title: "Blinding Lights",
            image: "https://example.com/t2.jpg",
            artists: [{ id: "a1", name: "The Weeknd" }],
        },
        {
            id: "t3",
            title: "One Dance",
            image: "https://example.com/t3.jpg",
            artists: [{ id: "a2", name: "Drake" }],
        },
    ] as any;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render user info, movies via MovieCard, and tracks via MusicCard", () => {
        const { getAllByText } = render(
            <TasteCardView
                cardRef={mockCardRef}
                user={mockUser}
                favoriteMovies={mockMovies}
                favoriteTracks={mockTracks}
                isSharing={false}
                onClose={mockOnClose}
                onShare={mockOnShare}
            />
        );

        expect(getAllByText("John Doe")[0]).toBeTruthy();
        expect(getAllByText("@johndoe")[0]).toBeTruthy();
        expect(getAllByText("mensola")[0]).toBeTruthy();

        expect(getAllByText("Inception")[0]).toBeTruthy();
        expect(getAllByText("Interstellar")[0]).toBeTruthy();
        expect(getAllByText("The Dark Knight")[0]).toBeTruthy();

        expect(getAllByText("Starboy")[0]).toBeTruthy();
        expect(getAllByText("The Weeknd").length).toBeGreaterThanOrEqual(2);
        expect(getAllByText("Blinding Lights")[0]).toBeTruthy();
        expect(getAllByText("One Dance")[0]).toBeTruthy();
        expect(getAllByText("Drake")[0]).toBeTruthy();
    });

    it("should call onClose when close button is pressed", () => {
        const { getByTestId } = render(
            <TasteCardView
                cardRef={mockCardRef}
                user={mockUser}
                favoriteMovies={mockMovies}
                favoriteTracks={mockTracks}
                isSharing={false}
                onClose={mockOnClose}
                onShare={mockOnShare}
            />
        );

        fireEvent.press(getByTestId("taste-card-close-button"));
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should call onShare when share button is pressed", () => {
        const { getByTestId } = render(
            <TasteCardView
                cardRef={mockCardRef}
                user={mockUser}
                favoriteMovies={mockMovies}
                favoriteTracks={mockTracks}
                isSharing={false}
                onClose={mockOnClose}
                onShare={mockOnShare}
            />
        );

        fireEvent.press(getByTestId("taste-card-share-button"));
        expect(mockOnShare).toHaveBeenCalledTimes(1);
    });

    it("should render off-screen capture card with square corners (borderRadius 0)", () => {
        const refObj: { current: any } = { current: null };
        render(
            <TasteCardView
                cardRef={refObj}
                user={mockUser}
                favoriteMovies={mockMovies}
                favoriteTracks={mockTracks}
                isSharing={false}
                onClose={mockOnClose}
                onShare={mockOnShare}
            />
        );

        expect(refObj.current).toBeTruthy();
        expect(refObj.current.props.style).toEqual(
            expect.arrayContaining([expect.objectContaining({ borderRadius: 0 })])
        );
    });
});
