import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import MusicCard from "./index";
import { IMusicCardProps } from "./types";

const mockSongProps: Omit<IMusicCardProps, "type"> = {
    title: "Music Title",
    artists: [{ name: "Artist 1" }, { name: "Artist 2" }],
    image: "https://example.com/cover.jpg",
    duration: 197000,
};

const mockAlbumProps: Omit<IMusicCardProps, "type"> = {
    title: "Album Title",
    artists: [{ name: "Artist 1" }, { name: "Artist 2" }],
    image: "https://example.com/cover.jpg",
    releaseYear: 2026,
};

const mockPlaylistProps: Omit<IMusicCardProps, "type"> = {
    title: "Playlist Title",
    creator: { username: "enescxx" },
    image: "https://example.com/cover.jpg",
    songCount: 50,
};

describe("MusicCard Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should render title and subtitle correctly", () => {
        const { getByText } = render(<MusicCard type="track" data={mockSongProps} />);

        expect(getByText("Music Title")).toBeTruthy();
        expect(getByText("Artist 1, Artist 2 • 03:17")).toBeTruthy();
    });

    it("should display duration when type is 'song'", () => {
        const { getByText } = render(<MusicCard type="track" data={mockSongProps} />);

        expect(getByText("Artist 1, Artist 2 • 03:17")).toBeTruthy();
    });

    it("should display release year when type is 'album'", () => {
        const { getByText } = render(<MusicCard type="album" data={mockAlbumProps} />);

        expect(getByText("Artist 1, Artist 2 • 2026")).toBeTruthy();
    });

    it("should display song count when type is 'playlist'", () => {
        const { getByText } = render(<MusicCard type="playlist" data={mockPlaylistProps} />);

        expect(getByText("@enescxx • 50 common.track")).toBeTruthy();
    });

    it("should trigger onPress when the card is pressed", () => {
        const onPressMock = jest.fn();

        const { getByText } = render(<MusicCard type="track" data={mockSongProps} onPress={onPressMock} />);

        const cardTitle = getByText("Music Title");

        fireEvent.press(cardTitle);

        expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it("should render the cover image with correct uri", () => {
        const { UNSAFE_getByType } = render(<MusicCard type="track" data={mockSongProps} />);

        const imageComponent = UNSAFE_getByType("Image");
        expect(imageComponent.props.source).toEqual({
            uri: mockSongProps.image,
        });
    });

    it("should render only the subtitle without dot separator when extra info is missing", () => {
        const { getByText } = render(<MusicCard type="track" data={{ ...mockSongProps, duration: undefined }} />);

        expect(getByText("Artist 1, Artist 2")).toBeTruthy();
    });

    it("should render title and artist without duration in compact mode", () => {
        const { getByText, queryByText } = render(<MusicCard type="track" data={mockSongProps} compact />);

        expect(getByText("Music Title")).toBeTruthy();
        expect(getByText("Artist 1, Artist 2")).toBeTruthy();
        expect(queryByText("Artist 1, Artist 2 • 03:17")).toBeNull();
    });

    it("should fallback to name property if title is not provided", () => {
        const { getByText } = render(
            <MusicCard type="track" data={{ name: "Fallback Song", artists: [{ name: "Artist X" }] } as any} />
        );

        expect(getByText("Fallback Song")).toBeTruthy();
    });

    describe("Playlist cover & mosaic tests", () => {
        it("should render placeholder icon when playlist has no cover and 0 tracks", () => {
            const playlistWithoutTracks = {
                title: "Empty Playlist",
                songCount: 0,
                previewImages: [],
            };

            const { getByText, UNSAFE_queryByType } = render(
                <MusicCard type="playlist" data={playlistWithoutTracks as any} />
            );

            expect(getByText("Empty Playlist")).toBeTruthy();
            expect(getByText("0 common.track")).toBeTruthy();
            expect(UNSAFE_queryByType("Image")).toBeNull();
        });

        it("should render first track image when playlist has no cover and 1-3 tracks", () => {
            const playlistFewTracks = {
                title: "Few Tracks",
                songCount: 2,
                previewImages: ["https://example.com/track1.jpg", "https://example.com/track2.jpg"],
            };

            const { UNSAFE_getAllByType, getByText } = render(
                <MusicCard type="playlist" data={playlistFewTracks as any} />
            );

            expect(getByText("Few Tracks")).toBeTruthy();
            const images = UNSAFE_getAllByType("Image");
            expect(images.length).toBe(1);
            expect(images[0].props.source).toEqual({ uri: "https://example.com/track1.jpg" });
        });

        it("should render 2x2 grid when playlist has no cover and 4 or more tracks", () => {
            const playlistManyTracks = {
                title: "Many Tracks",
                songCount: 10,
                previewImages: [
                    "https://example.com/t1.jpg",
                    "https://example.com/t2.jpg",
                    "https://example.com/t3.jpg",
                    "https://example.com/t4.jpg",
                    "https://example.com/t5.jpg",
                ],
            };

            const { UNSAFE_getAllByType, getByText } = render(
                <MusicCard type="playlist" data={playlistManyTracks as any} />
            );

            expect(getByText("Many Tracks")).toBeTruthy();
            const images = UNSAFE_getAllByType("Image");
            expect(images.length).toBe(4);
            expect(images[0].props.source).toEqual({ uri: "https://example.com/t1.jpg" });
            expect(images[3].props.source).toEqual({ uri: "https://example.com/t4.jpg" });
        });

        it("should display only song count when hideCreator is true", () => {
            const playlistProps = {
                title: "My Own Playlist",
                creator: { username: "me" },
                songCount: 25,
            };

            const { getByText, queryByText } = render(
                <MusicCard type="playlist" data={playlistProps as any} hideCreator />
            );

            expect(getByText("My Own Playlist")).toBeTruthy();
            expect(getByText("25 common.track")).toBeTruthy();
            expect(queryByText("@me")).toBeNull();
        });
    });
});
