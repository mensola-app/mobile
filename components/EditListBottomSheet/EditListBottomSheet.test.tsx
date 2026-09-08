import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import EditListBottomSheet from "./index";
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
        updateList: jest.fn(),
        deleteList: jest.fn(),
    },
}));

jest.mock("@/services/playlist.service", () => ({
    PlaylistService: {
        updatePlaylist: jest.fn(),
        deletePlaylist: jest.fn(),
    },
}));

jest.mock("@/services/storage.service", () => ({
    StorageService: {
        uploadCover: jest.fn(),
    },
}));

describe("EditListBottomSheet Component", () => {
    const defaultProps = {
        isVisible: true,
        onClose: jest.fn(),
        onSuccess: jest.fn(),
        type: "movie-lists" as const,
        listId: "list-123",
        initialTitle: "Existing Movie List",
        initialDescription: "Old Description",
        initialImage: "https://r2.mensola.app/covers/old.jpg",
        initialIsPrivate: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders initial values correctly", () => {
        const { getByDisplayValue } = render(
            <EditListBottomSheet {...defaultProps} />
        );

        expect(getByDisplayValue("Existing Movie List")).toBeTruthy();
        expect(getByDisplayValue("Old Description")).toBeTruthy();
    });

    it("updates movie list without changing image if untouched", async () => {
        (MovieService.updateList as jest.Mock).mockResolvedValue({ success: true });

        const { getByDisplayValue, getByText } = render(
            <EditListBottomSheet {...defaultProps} type="movie-lists" />
        );

        const titleInput = getByDisplayValue("Existing Movie List");
        fireEvent.changeText(titleInput, "Updated Movie List");

        const saveBtn = getByText("lists.edit.submitButton");
        fireEvent.press(saveBtn);

        await waitFor(() => {
            expect(StorageService.uploadCover).not.toHaveBeenCalled();
            expect(MovieService.updateList).toHaveBeenCalledWith("list-123", {
                title: "Updated Movie List",
                description: "Old Description",
                image: "https://r2.mensola.app/covers/old.jpg",
                isPrivate: false,
            });
            expect(defaultProps.onSuccess).toHaveBeenCalled();
            expect(defaultProps.onClose).toHaveBeenCalled();
        });
    });

    it("uploads new image and updates playlist with 1:1 aspect ratio", async () => {
        (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
        (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
            canceled: false,
            assets: [{ uri: "file:///new-playlist-cover.jpg" }],
        });
        (StorageService.uploadCover as jest.Mock).mockResolvedValue({
            success: true,
            data: { imageUrl: "https://r2.mensola.app/covers/new.jpg" },
        });
        (PlaylistService.updatePlaylist as jest.Mock).mockResolvedValue({ success: true });

        const { getByTestId, getByText } = render(
            <EditListBottomSheet
                {...defaultProps}
                type="playlists"
                listId="playlist-456"
                initialTitle="My Playlist"
            />
        );

        fireEvent.press(getByTestId("edit-list-image-picker"));

        await waitFor(() => {
            expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith(
                expect.objectContaining({
                    aspect: [1, 1],
                    allowsEditing: true,
                })
            );
        });

        const saveBtn = getByText("lists.edit.submitButton");
        fireEvent.press(saveBtn);

        await waitFor(() => {
            expect(StorageService.uploadCover).toHaveBeenCalledWith("file:///new-playlist-cover.jpg");
            expect(PlaylistService.updatePlaylist).toHaveBeenCalledWith("playlist-456", {
                title: "My Playlist",
                description: "Old Description",
                image: "https://r2.mensola.app/covers/new.jpg",
                isPrivate: false,
            });
            expect(defaultProps.onSuccess).toHaveBeenCalled();
            expect(defaultProps.onClose).toHaveBeenCalled();
        });
    });

    it("sets image to null when image is removed", async () => {
        (MovieService.updateList as jest.Mock).mockResolvedValue({ success: true });

        const { getByTestId, getByText } = render(
            <EditListBottomSheet {...defaultProps} />
        );

        // Click remove image button
        fireEvent.press(getByTestId("edit-list-remove-image"));

        const saveBtn = getByText("lists.edit.submitButton");
        fireEvent.press(saveBtn);

        await waitFor(() => {
            expect(MovieService.updateList).toHaveBeenCalledWith("list-123", {
                title: "Existing Movie List",
                description: "Old Description",
                image: null,
                isPrivate: false,
            });
        });
    });

    it("triggers delete confirmation and deletes movie list", async () => {
        const alertSpy = jest.spyOn(require("react-native").Alert, "alert");
        (MovieService.deleteList as jest.Mock).mockResolvedValue({ success: true });
        const onDeleteSuccess = jest.fn();

        const { getByTestId } = render(
            <EditListBottomSheet {...defaultProps} onDeleteSuccess={onDeleteSuccess} />
        );

        // Click delete button
        fireEvent.press(getByTestId("edit-list-delete-button"));

        expect(alertSpy).toHaveBeenCalledWith(
            "lists.edit.deleteConfirmTitle",
            "lists.edit.deleteConfirmBody",
            expect.any(Array),
        );

        // Simulate confirming delete (press index 1 button)
        const confirmButton = alertSpy.mock.calls[0][2][1];
        await act(async () => {
            await confirmButton.onPress();
        });

        await waitFor(() => {
            expect(MovieService.deleteList).toHaveBeenCalledWith("list-123");
            expect(defaultProps.onClose).toHaveBeenCalled();
            expect(onDeleteSuccess).toHaveBeenCalled();
        });
    });

    it("triggers delete confirmation and deletes playlist", async () => {
        const alertSpy = jest.spyOn(require("react-native").Alert, "alert");
        (PlaylistService.deletePlaylist as jest.Mock).mockResolvedValue({ success: true });
        const onDeleteSuccess = jest.fn();

        const { getByTestId } = render(
            <EditListBottomSheet
                {...defaultProps}
                type="playlists"
                listId="playlist-789"
                onDeleteSuccess={onDeleteSuccess}
            />
        );

        // Click delete button
        fireEvent.press(getByTestId("edit-list-delete-button"));

        expect(alertSpy).toHaveBeenCalled();
        const confirmButton = alertSpy.mock.calls[0][2][1];
        await act(async () => {
            await confirmButton.onPress();
        });


        await waitFor(() => {
            expect(PlaylistService.deletePlaylist).toHaveBeenCalledWith("playlist-789");
            expect(defaultProps.onClose).toHaveBeenCalled();
            expect(onDeleteSuccess).toHaveBeenCalled();
        });
    });
});

