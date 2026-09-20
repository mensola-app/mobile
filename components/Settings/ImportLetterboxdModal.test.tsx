import React from "react";
import { render, fireEvent, waitFor, act, cleanup } from "@testing-library/react-native";
import { Linking, Animated } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ImportLetterboxdModal from "./ImportLetterboxdModal";
import { ImportService } from "@/services/import.service";

jest.mock("expo-document-picker", () => ({
    getDocumentAsync: jest.fn(),
}));

jest.mock("expo-keep-awake", () => ({
    activateKeepAwakeAsync: jest.fn().mockResolvedValue(undefined),
    deactivateKeepAwake: jest.fn().mockResolvedValue(undefined),
}));

const mockInvalidateQueries = jest.fn();
jest.mock("@tanstack/react-query", () => ({
    useQueryClient: () => ({
        invalidateQueries: mockInvalidateQueries,
    }),
}));

jest.mock("@/services/import.service", () => ({
    ImportService: {
        uploadLetterboxdZip: jest.fn(),
        getImportProgress: jest.fn(),
    },
}));

describe("ImportLetterboxdModal", () => {
    const mockOnClose = jest.fn();
    const mockOnSuccess = jest.fn();

    beforeEach(async () => {
        jest.clearAllMocks();
        await AsyncStorage.clear();
        jest.spyOn(Animated, "timing").mockReturnValue({
            start: jest.fn((cb) => cb && cb({ finished: true })),
            stop: jest.fn(),
            reset: jest.fn(),
        } as any);
    });

    afterEach(() => {
        cleanup();
        jest.clearAllTimers();
    });

    it("renders guide and action buttons initially when no active job", async () => {
        const { getByText } = render(
            <ImportLetterboxdModal
                isVisible={true}
                onClose={mockOnClose}
                onSuccess={mockOnSuccess}
            />,
        );

        await waitFor(() => {
            expect(getByText("settings.letterboxdImport.guideTitle")).toBeTruthy();
            expect(getByText("settings.letterboxdImport.openLetterboxd")).toBeTruthy();
            expect(getByText("settings.letterboxdImport.selectZipButton")).toBeTruthy();
        });
    });

    it("opens Letterboxd data export URL when openLetterboxd button is pressed", async () => {
        const openUrlSpy = jest.spyOn(Linking, "openURL").mockResolvedValueOnce(true as any);

        const { getByText } = render(
            <ImportLetterboxdModal
                isVisible={true}
                onClose={mockOnClose}
                onSuccess={mockOnSuccess}
            />,
        );

        const openBtn = getByText("settings.letterboxdImport.openLetterboxd");
        fireEvent.press(openBtn);

        expect(openUrlSpy).toHaveBeenCalledWith("https://letterboxd.com/settings/data/");
    });

    it("displays error if picked file is not a zip file", async () => {
        (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce({
            canceled: false,
            assets: [{ name: "my_data.pdf", uri: "file:///data.pdf", size: 1024 }],
        });

        const { getByText } = render(
            <ImportLetterboxdModal
                isVisible={true}
                onClose={mockOnClose}
                onSuccess={mockOnSuccess}
            />,
        );

        const selectBtn = getByText("settings.letterboxdImport.selectZipButton");
        await act(async () => {
            fireEvent.press(selectBtn);
        });

        await waitFor(() => {
            expect(getByText("settings.letterboxdImport.invalidZip")).toBeTruthy();
        });
    });

    it("displays error if picked file exceeds 50MB", async () => {
        (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce({
            canceled: false,
            assets: [{ name: "large.zip", uri: "file:///large.zip", size: 55 * 1024 * 1024 }],
        });

        const { getByText } = render(
            <ImportLetterboxdModal
                isVisible={true}
                onClose={mockOnClose}
                onSuccess={mockOnSuccess}
            />,
        );

        const selectBtn = getByText("settings.letterboxdImport.selectZipButton");
        await act(async () => {
            fireEvent.press(selectBtn);
        });

        await waitFor(() => {
            expect(getByText("settings.letterboxdImport.fileTooLarge")).toBeTruthy();
        });
    });

    it("uploads zip and starts progress tracking on valid file", async () => {
        (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce({
            canceled: false,
            assets: [{ name: "letterboxd.zip", uri: "file:///export.zip", size: 2048 }],
        });

        (ImportService.uploadLetterboxdZip as jest.Mock).mockResolvedValueOnce({
            jobId: "job-xyz",
            status: "queued",
            totalItems: 100,
        });

        (ImportService.getImportProgress as jest.Mock).mockResolvedValue({
            jobId: "job-xyz",
            userId: "u1",
            status: "processing",
            totalItems: 100,
            processedItems: 50,
            successCount: 48,
            failedCount: 2,
            createdAt: "2026-09-20T12:00:00Z",
            updatedAt: "2026-09-20T12:00:10Z",
        });

        const { getByText } = render(
            <ImportLetterboxdModal
                isVisible={true}
                onClose={mockOnClose}
                onSuccess={mockOnSuccess}
            />,
        );

        const selectBtn = getByText("settings.letterboxdImport.selectZipButton");
        await act(async () => {
            fireEvent.press(selectBtn);
        });

        await waitFor(() => {
            expect(getByText("settings.letterboxdImport.processingTitle")).toBeTruthy();
            expect(getByText("settings.letterboxdImport.backgroundButton")).toBeTruthy();
        });

        const savedJob = await AsyncStorage.getItem("active_import_job_id");
        expect(savedJob).toBe("job-xyz");
    });

    it("renders failed/unsaved movies list on completed step when errors exist", async () => {
        (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce({
            canceled: false,
            assets: [{ name: "letterboxd.zip", uri: "file:///export.zip", size: 2048 }],
        });

        (ImportService.uploadLetterboxdZip as jest.Mock).mockResolvedValueOnce({
            jobId: "job-failed-test",
            status: "queued",
            totalItems: 10,
        });

        (ImportService.getImportProgress as jest.Mock).mockResolvedValue({
            jobId: "job-failed-test",
            userId: "u1",
            status: "completed",
            totalItems: 10,
            processedItems: 10,
            successCount: 9,
            failedCount: 1,
            errors: [
                {
                    movie: "Lost Film",
                    year: 2021,
                    error: "Movie \"Lost Film\" (2021) not found on TMDB",
                },
            ],
            createdAt: "2026-09-20T12:00:00Z",
            updatedAt: "2026-09-20T12:00:10Z",
        });

        const { getByText } = render(
            <ImportLetterboxdModal
                isVisible={true}
                onClose={mockOnClose}
                onSuccess={mockOnSuccess}
            />,
        );

        const selectBtn = getByText("settings.letterboxdImport.selectZipButton");
        await act(async () => {
            fireEvent.press(selectBtn);
        });

        await waitFor(() => {
            expect(DocumentPicker.getDocumentAsync).toHaveBeenCalled();
            expect(ImportService.uploadLetterboxdZip).toHaveBeenCalled();
            expect(getByText("settings.letterboxdImport.successTitle")).toBeTruthy();
            expect(getByText("settings.letterboxdImport.failedMoviesTitle")).toBeTruthy();
            expect(getByText("Lost Film (2021)")).toBeTruthy();
            expect(getByText("settings.letterboxdImport.notFoundOnTmdb")).toBeTruthy();
        });
    });

    it("renders detailed breakdown message when both watched and watchlist items were imported", async () => {
        (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce({
            canceled: false,
            assets: [{ name: "letterboxd.zip", uri: "file:///export.zip", size: 2048 }],
        });

        (ImportService.uploadLetterboxdZip as jest.Mock).mockResolvedValueOnce({
            jobId: "job-breakdown-test",
            status: "queued",
            totalItems: 15,
        });

        (ImportService.getImportProgress as jest.Mock).mockResolvedValue({
            jobId: "job-breakdown-test",
            userId: "u1",
            status: "completed",
            totalItems: 15,
            processedItems: 15,
            successCount: 15,
            failedCount: 0,
            watchedCount: 10,
            watchlistCount: 5,
            createdAt: "2026-09-20T12:00:00Z",
            updatedAt: "2026-09-20T12:00:10Z",
        });

        const { getByText } = render(
            <ImportLetterboxdModal
                isVisible={true}
                onClose={mockOnClose}
                onSuccess={mockOnSuccess}
            />,
        );

        const selectBtn = getByText("settings.letterboxdImport.selectZipButton");
        await act(async () => {
            fireEvent.press(selectBtn);
        });

        await waitFor(() => {
            expect(getByText("settings.letterboxdImport.successTitle")).toBeTruthy();
            expect(getByText("settings.letterboxdImport.successDetailed")).toBeTruthy();
        });
    });

    it("renders breakdown with lists and displays public lists notice when lists are imported", async () => {
        (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValueOnce({
            canceled: false,
            assets: [{ name: "letterboxd.zip", uri: "file:///export.zip", size: 2048 }],
        });

        (ImportService.uploadLetterboxdZip as jest.Mock).mockResolvedValueOnce({
            jobId: "job-lists-test",
            status: "queued",
            totalItems: 17,
        });

        (ImportService.getImportProgress as jest.Mock).mockResolvedValue({
            jobId: "job-lists-test",
            userId: "u1",
            status: "completed",
            totalItems: 17,
            processedItems: 17,
            successCount: 17,
            failedCount: 0,
            watchedCount: 10,
            watchlistCount: 5,
            listsCount: 2,
            createdAt: "2026-09-20T12:00:00Z",
            updatedAt: "2026-09-20T12:00:10Z",
        });

        const { getByText } = render(
            <ImportLetterboxdModal
                isVisible={true}
                onClose={mockOnClose}
                onSuccess={mockOnSuccess}
            />,
        );

        const selectBtn = getByText("settings.letterboxdImport.selectZipButton");
        await act(async () => {
            fireEvent.press(selectBtn);
        });

        await waitFor(() => {
            expect(getByText("settings.letterboxdImport.successTitle")).toBeTruthy();
            expect(getByText("settings.letterboxdImport.successDetailedWithLists")).toBeTruthy();
            expect(getByText("settings.letterboxdImport.listsPublicNotice")).toBeTruthy();
        });
    });
});
