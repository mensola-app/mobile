import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import TasteCardModal from "../app/taste-card";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";

const mockBack = jest.fn();
let mockParams = {
    user: JSON.stringify({
        id: "u1",
        username: "johndoe",
        fullname: "John Doe",
        avatar: "https://example.com/avatar.jpg",
    }),
    favoriteMovies: JSON.stringify([
        { id: "m1", title: "Inception", poster: "https://example.com/poster1.jpg" },
        { id: "m2", title: "Interstellar", poster: "https://example.com/poster2.jpg" },
        { id: "m3", title: "The Dark Knight", poster: "https://example.com/poster3.jpg" },
    ]),
    favoriteTracks: JSON.stringify([
        {
            id: "t1",
            title: "Starboy",
            image: "https://example.com/t1.jpg",
            artists: [{ name: "The Weeknd" }],
        },
        {
            id: "t2",
            title: "Blinding Lights",
            image: "https://example.com/t2.jpg",
            artists: [{ name: "The Weeknd" }],
        },
        {
            id: "t3",
            title: "One Dance",
            image: "https://example.com/t3.jpg",
            artists: [{ name: "Drake" }],
        },
    ]),
};

jest.mock("expo-router", () => ({
    useRouter: () => ({
        back: mockBack,
        push: jest.fn(),
    }),
    useLocalSearchParams: () => mockParams,
}));

jest.mock("react-native-view-shot", () => ({
    captureRef: jest.fn().mockResolvedValue("file:///mock/taste-card.png"),
}));

jest.mock("expo-sharing", () => ({
    isAvailableAsync: jest.fn().mockResolvedValue(true),
    shareAsync: jest.fn().mockResolvedValue(undefined),
}));

describe("TasteCardModal", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render user info, movies without badges, and tracks correctly", () => {
        const { getByText, getAllByText } = render(<TasteCardModal />);

        // User info
        expect(getByText("John Doe")).toBeTruthy();
        expect(getByText("@johndoe")).toBeTruthy();
        expect(getByText("Mensola")).toBeTruthy();

        // Movie titles
        expect(getByText("Inception")).toBeTruthy();
        expect(getByText("Interstellar")).toBeTruthy();
        expect(getByText("The Dark Knight")).toBeTruthy();

        // Track titles and artists
        expect(getByText("Starboy")).toBeTruthy();
        expect(getAllByText("The Weeknd").length).toBe(2);
        expect(getByText("Blinding Lights")).toBeTruthy();
        expect(getByText("One Dance")).toBeTruthy();
        expect(getByText("Drake")).toBeTruthy();
    });

    it("should close when close button is pressed", () => {
        const { getByTestId } = render(<TasteCardModal />);
        const closeBtn = getByTestId("taste-card-close-button");

        fireEvent.press(closeBtn);
        expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it("should capture and share image when share button is pressed", async () => {
        const { getByTestId } = render(<TasteCardModal />);
        const shareBtn = getByTestId("taste-card-share-button");

        fireEvent.press(shareBtn);

        await waitFor(() => {
            expect(captureRef).toHaveBeenCalled();
            expect(Sharing.shareAsync).toHaveBeenCalledWith(
                "file:///mock/taste-card.png",
                expect.objectContaining({
                    mimeType: "image/png",
                }),
            );
        });
    });
});
