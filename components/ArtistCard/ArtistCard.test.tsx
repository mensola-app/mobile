import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ArtistCard from "./index";
import { Image } from "expo-image";
import { IArtistCardProps } from "./types";

const mockArtistProps: IArtistCardProps = {
    artist: {
        id: "artist-1",
        name: "Artist Name",
        avatar: "https://example.com/artist.jpg",
        followerCount: 1552,
    },
    onPress: jest.fn(),
};

describe("ArtistCard Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render artist name correctly", () => {
        const { getByText } = render(<ArtistCard {...mockArtistProps} />);

        expect(getByText("Artist Name")).toBeTruthy();
    });

    it("should display number of followers when provided", () => {
        const { getByText } = render(<ArtistCard {...mockArtistProps} />);

        expect(getByText("1552 followers")).toBeTruthy();
    });

    it("should trigger onPress when the artist card is pressed", () => {
        const { getByText } = render(<ArtistCard {...mockArtistProps} />);

        const artistName = getByText("Artist Name");
        fireEvent.press(artistName);

        expect(mockArtistProps.onPress).toHaveBeenCalledTimes(1);
    });

    it("should render the avatar image with correct uri", () => {
        const { UNSAFE_getByType } = render(<ArtistCard {...mockArtistProps} />);

        const imageComponent = UNSAFE_getByType(Image);
        expect(imageComponent.props.source).toEqual({
            uri: mockArtistProps.artist.avatar?.toString(),
        });
    });

    it("should not render followers text when followers is missing", () => {
        const { queryByText } = render(
            <ArtistCard
                {...mockArtistProps}
                artist={{
                    ...mockArtistProps.artist,
                    followerCount: undefined,
                }}
            />
        );

        expect(queryByText("1552 followers")).toBeNull();
    });
});
