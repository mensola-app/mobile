import { ImportService } from "./import.service";
import { client } from "@/api/client";
import { uploadAsync, FileSystemUploadType } from "expo-file-system/legacy";
import * as SecureStore from "expo-secure-store";

jest.mock("@/api/client", () => ({
    client: {
        post: jest.fn(),
        get: jest.fn(),
    },
    getActiveLanguage: jest.fn().mockReturnValue("tr"),
}));

jest.mock("expo-secure-store", () => ({
    getItemAsync: jest.fn(),
}));

jest.mock("expo-file-system/legacy", () => ({
    uploadAsync: jest.fn(),
    FileSystemUploadType: {
        MULTIPART: 1,
    },
}));

describe("ImportService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("uploadLetterboxdZip", () => {
        it("should throw error if file is larger than 50MB", async () => {
            const largeFile = {
                uri: "file:///path/to/large.zip",
                name: "large.zip",
                size: 51 * 1024 * 1024,
            };

            await expect(ImportService.uploadLetterboxdZip(largeFile)).rejects.toThrow(
                "FILE_TOO_LARGE",
            );
            expect(uploadAsync).not.toHaveBeenCalled();
        });

        it("should upload via uploadAsync and return job details on success", async () => {
            const validFile = {
                uri: "file:///path/to/export.zip",
                name: "export.zip",
                mimeType: "application/zip",
                size: 1024 * 100, // 100KB
            };

            (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce("test-token");
            (uploadAsync as jest.Mock).mockResolvedValueOnce({
                status: 200,
                body: JSON.stringify({
                    success: true,
                    data: {
                        jobId: "test-job-123",
                        status: "queued",
                        totalItems: 42,
                    },
                }),
            });

            const result = await ImportService.uploadLetterboxdZip(validFile);

            expect(uploadAsync).toHaveBeenCalledWith(
                expect.stringContaining("/v1/imports/letterboxd"),
                validFile.uri,
                expect.objectContaining({
                    fieldName: "file",
                    httpMethod: "POST",
                    uploadType: FileSystemUploadType.MULTIPART,
                    mimeType: "application/zip",
                    headers: expect.objectContaining({
                        Authorization: "Bearer test-token",
                        "Accept-Language": "tr",
                    }),
                }),
            );
            expect(result.jobId).toBe("test-job-123");
            expect(result.status).toBe("queued");
            expect(result.totalItems).toBe(42);
        });

        it("should throw error if API returns failure", async () => {
            const validFile = {
                uri: "file:///path/to/export.zip",
                name: "export.zip",
            };

            (uploadAsync as jest.Mock).mockResolvedValueOnce({
                status: 400,
                body: JSON.stringify({
                    success: false,
                    message: "Invalid zip file",
                }),
            });

            await expect(ImportService.uploadLetterboxdZip(validFile)).rejects.toThrow(
                "Invalid zip file",
            );
        });
    });

    describe("getImportProgress", () => {
        it("should get import progress for a jobId", async () => {
            const mockProgress = {
                jobId: "test-job-123",
                userId: "user-1",
                status: "processing",
                totalItems: 50,
                processedItems: 25,
                successCount: 24,
                failedCount: 1,
                createdAt: "2026-09-20T12:00:00Z",
                updatedAt: "2026-09-20T12:00:10Z",
            };

            (client.get as jest.Mock).mockResolvedValueOnce({
                success: true,
                data: mockProgress,
            });

            const result = await ImportService.getImportProgress("test-job-123");

            expect(client.get).toHaveBeenCalledWith("/v1/imports/test-job-123", {
                auth: true,
            });
            expect(result).toEqual(mockProgress);
        });
    });

    describe("importSpotifyPlaylists", () => {
        it("should post playlist URLs and return queued job details", async () => {
            const mockResponse = {
                jobId: "spotify-job-456",
                status: "queued",
                totalItems: 2,
                type: "spotify",
            };

            (client.post as jest.Mock).mockResolvedValueOnce({
                success: true,
                data: mockResponse,
            });

            const urls = [
                "https://open.spotify.com/playlist/5XzIwoEzc7KWg250ua37Ew",
                "spotify:playlist:37i9dQZF1DXcBWIGoYBM5M",
            ];

            const result = await ImportService.importSpotifyPlaylists(urls);

            expect(client.post).toHaveBeenCalledWith(
                "/v1/imports/spotify",
                { urls },
                { auth: true },
            );
            expect(result).toEqual(mockResponse);
        });

        it("should throw error if API returns unsuccessful response", async () => {
            (client.post as jest.Mock).mockResolvedValueOnce({
                success: false,
                message: "No valid playlists",
            });

            await expect(
                ImportService.importSpotifyPlaylists(["https://open.spotify.com/playlist/invalid"]),
            ).rejects.toBeDefined();
        });
    });
});
