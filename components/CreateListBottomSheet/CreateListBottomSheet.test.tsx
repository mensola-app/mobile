import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import CreateListBottomSheet from "./index";
import * as ImagePicker from "expo-image-picker";
import { MovieService } from "@/services/movie.service";
import { PlaylistService } from "@/services/playlist.service";
import { StorageService } from "@/services/storage.service";

jest.mock("expo-image-picker", () => ({
    requestMediaLibraryPermissionsAsync: jest.fn(),
    launchImageLibraryAsync: jest.fn(),
}));

jest.mock("@/services/movie.service", () => ({
    MovieService: {
        createList: jest.fn(),
    },
}));

jest.mock("@/services/playlist.service", () => ({
    PlaylistService: {
        createPlaylist: jest.fn(),
    },
}));

jest.mock("@/services/storage.service", () => ({
    StorageService: {
        uploadCover: jest.fn(),
    },
}));

describe("CreateListBottomSheet Component", () => {
    const defaultProps = {
        isVisible: true,
        onClose: jest.fn(),
        onSuccess: jest.fn(),
        type: "movie-lists" as const,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders properly for movie-lists", () => {
        const { getByPlaceholderText, getByText } = render(
            <CreateListBottomSheet {...defaultProps} type="movie-lists" />
        );

        expect(getByPlaceholderText("lists.create.namePlaceholderMovie")).toBeTruthy();
        expect(getByPlaceholderText("lists.create.descriptionPlaceholder")).toBeTruthy();
        expect(getByText("lists.create.submitButton")).toBeTruthy();
    });

    it("renders properly for playlists", () => {
        const { getByPlaceholderText } = render(
            <CreateListBottomSheet {...defaultProps} type="playlists" />
        );

        expect(getByPlaceholderText("lists.create.namePlaceholderTrack")).toBeTruthy();
    });

    it("picks image with 2:3 aspect ratio for movie-lists", async () => {
        (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
        (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
            canceled: false,
            assets: [{ uri: "file:///test-movie-cover.jpg" }],
        });

        const { getByTestId } = render(
            <CreateListBottomSheet {...defaultProps} type="movie-lists" />
        );

        fireEvent.press(getByTestId("create-list-image-picker"));

        await waitFor(() => {
            expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    aspect: [2, 3],
                    allowsEditing: true,
                })
            );
        });
    });

    it("picks image with 1:1 aspect ratio for playlists", async () => {
        (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
        (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
            canceled: false,
            assets: [{ uri: "file:///test-playlist-cover.jpg" }],
        });

        const { getByTestId } = render(
            <CreateListBottomSheet {...defaultProps} type="playlists" />
        );

        fireEvent.press(getByTestId("create-list-image-picker"));

        await waitFor(() => {
            expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    aspect: [1, 1],
                    allowsEditing: true,
                })
            );
        });
    });

    it("uploads image and calls MovieService.createList on submit", async () => {
        (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
        (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
            canceled: false,
            assets: [{ uri: "file:///test-cover.jpg" }],
        });
        (StorageService.uploadCover as jest.Mock).mockResolvedValue({
            success: true,
            data: { imageUrl: "https://r2.mensola.app/covers/test.jpg" },
        });
        (MovieService.createList as jest.Mock).mockResolvedValue({ success: true });

        const { getByPlaceholderText, getByText, getByTestId } = render(
            <CreateListBottomSheet {...defaultProps} type="movie-lists" />
        );

        // Pick image
        fireEvent.press(getByTestId("create-list-image-picker"));

        // Wait for image state update
        await waitFor(() => {
            expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
        });

        // Enter title
        const input = getByPlaceholderText("lists.create.namePlaceholderMovie");
        fireEvent.changeText(input, "My New Movie List");

        // Submit
        const submitBtn = getByText("lists.create.submitButton");
        fireEvent.press(submitBtn);

        await waitFor(() => {
            expect(StorageService.uploadCover).toHaveBeenCalledWith("file:///test-cover.jpg");
            expect(MovieService.createList).toHaveBeenCalledWith({
                title: "My New Movie List",
                description: undefined,
                image: "https://r2.mensola.app/covers/test.jpg",
                isPrivate: false,
            });
            expect(defaultProps.onSuccess).toHaveBeenCalled();
            expect(defaultProps.onClose).toHaveBeenCalled();
        });
    });

    it("allows removing the selected image", async () => {
        (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
        (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
            canceled: false,
            assets: [{ uri: "file:///test-cover.jpg" }],
        });

        const { getByTestId, queryByTestId } = render(
            <CreateListBottomSheet {...defaultProps} type="movie-lists" />
        );

        // Pick image
        fireEvent.press(getByTestId("create-list-image-picker"));

        await waitFor(() => {
            expect(getByTestId("create-list-remove-image")).toBeTruthy();
        });

        // Click remove badge
        fireEvent.press(getByTestId("create-list-remove-image"));

        await waitFor(() => {
            expect(queryByTestId("create-list-remove-image")).toBeNull();
        });
    });



    it("shows validation error when title is empty", async () => {
        const { getByText } = render(
            <CreateListBottomSheet {...defaultProps} type="movie-lists" />
        );

        const submitBtn = getByText("lists.create.submitButton");
        fireEvent.press(submitBtn);

        await waitFor(() => {
            expect(getByText("lists.create.errorTitleRequired")).toBeTruthy();
            expect(MovieService.createList).not.toHaveBeenCalled();
        });
    });
});
